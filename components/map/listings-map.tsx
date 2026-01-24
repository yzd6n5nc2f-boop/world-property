"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import maplibregl, { type LngLatBoundsLike, type Map } from "maplibre-gl";
import Supercluster from "supercluster";
import type { Bounds, Listing } from "@/types/listing";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils/format";

type ListingsMapProps = {
  listings: Listing[];
  selectedId?: string;
  onSelect: (id?: string) => void;
  onBoundsChange: (bounds: Bounds) => void;
  onSearchArea: () => void;
  isDirty: boolean;
};

type PointProperties = {
  id: string;
  price: number;
  currency: string;
};

type ClusterProperties = PointProperties & { cluster: true; point_count: number };

function toBounds(map: Map): Bounds {
  const bounds = map.getBounds();
  return {
    north: bounds.getNorth(),
    south: bounds.getSouth(),
    east: bounds.getEast(),
    west: bounds.getWest()
  };
}

export function ListingsMap({ listings, selectedId, onSelect, onBoundsChange, onSearchArea, isDirty }: ListingsMapProps) {
  const mapRef = useRef<Map | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const callbacksRef = useRef({ onSelect, onBoundsChange });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    callbacksRef.current = { onSelect, onBoundsChange };
  }, [onBoundsChange, onSelect]);

  const points = useMemo(
    () =>
      listings.map((listing) => ({
        type: "Feature" as const,
        properties: {
          id: listing.id,
          price: listing.price.salePrice ?? listing.price.rentPerMonth ?? listing.price.nightRate ?? 0,
          currency: listing.currency
        },
        geometry: {
          type: "Point" as const,
          coordinates: [listing.lng, listing.lat] as [number, number]
        }
      })),
    [listings]
  );

  const clusterIndex = useMemo(() => {
    const index = new Supercluster<PointProperties, ClusterProperties>({
      radius: 60,
      maxZoom: 15
    });
    index.load(points as never);
    return index;
  }, [points]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
      center: [0, 20],
      zoom: 1.5
    });

    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), "top-right");

    map.on("load", () => {
      map.addSource("listings", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
        cluster: false
      });

      map.addLayer({
        id: "clusters",
        type: "circle",
        source: "listings",
        filter: ["has", "point_count"],
        paint: {
          "circle-color": "#2563eb",
          "circle-radius": [
            "step",
            ["get", "point_count"],
            16,
            10,
            20,
            25,
            26
          ],
          "circle-opacity": 0.85
        }
      });

      map.addLayer({
        id: "cluster-count",
        type: "symbol",
        source: "listings",
        filter: ["has", "point_count"],
        layout: {
          "text-field": ["get", "point_count"],
          "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
          "text-size": 12
        },
        paint: {
          "text-color": "#fff"
        }
      });

      map.addLayer({
        id: "points",
        type: "circle",
        source: "listings",
        filter: ["!", ["has", "point_count"]],
        paint: {
          "circle-color": [
            "case",
            ["==", ["get", "id"], selectedId ?? ""],
            "#0f172a",
            "#1d4ed8"
          ],
          "circle-radius": ["case", ["==", ["get", "id"], selectedId ?? ""], 10, 8],
          "circle-stroke-width": 2,
          "circle-stroke-color": "#fff"
        }
      });

      map.on("click", "clusters", (event) => {
        const features = map.queryRenderedFeatures(event.point, { layers: ["clusters"] });
        const clusterId = features[0]?.properties?.cluster_id;
        if (!clusterId) return;
        const zoom = clusterIndex.getClusterExpansionZoom(clusterId);
        const geometry = features[0]?.geometry;
        if (!geometry || geometry.type !== "Point") return;
        const coords = geometry.coordinates as [number, number];
        map.easeTo({ center: coords, zoom: Math.min(zoom + 1, 14) });
      });

      map.on("click", "points", (event) => {
        const feature = map.queryRenderedFeatures(event.point, { layers: ["points"] })[0];
        const id = feature?.properties?.id as string | undefined;
        callbacksRef.current.onSelect(id);
      });

      map.on("moveend", () => {
        callbacksRef.current.onBoundsChange(toBounds(map));
      });

      setReady(true);
      callbacksRef.current.onBoundsChange(toBounds(map));
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;

    const bounds = map.getBounds();
    const zoom = Math.round(map.getZoom());
    const clusters = clusterIndex.getClusters([
      bounds.getWest(),
      bounds.getSouth(),
      bounds.getEast(),
      bounds.getNorth()
    ], zoom);

    const source = map.getSource("listings") as maplibregl.GeoJSONSource | undefined;
    if (!source) return;

    source.setData({
      type: "FeatureCollection",
      features: clusters as never
    });

    if (clusters.length > 0) {
      const lngLats = clusters
        .filter((feature) => feature.geometry.type === "Point")
        .map((feature) => feature.geometry.coordinates as [number, number]);
      if (lngLats.length === 0) return;
      const resultBounds: LngLatBoundsLike = lngLats.reduce(
        (acc, coords) => {
          acc.extend(coords);
          return acc;
        },
        new maplibregl.LngLatBounds(lngLats[0], lngLats[0])
      );

      const resultBoundsObj = resultBounds as maplibregl.LngLatBounds;
      const boundsContainsResult =
        bounds.contains(resultBoundsObj.getNorthEast()) && bounds.contains(resultBoundsObj.getSouthWest());

      if (lngLats.length > 1 && !boundsContainsResult) {
        map.fitBounds(resultBounds, { padding: 80, duration: 600, maxZoom: 12 });
      }
    }
  }, [clusterIndex, listings, ready]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;

    map.setPaintProperty("points", "circle-color", [
      "case",
      ["==", ["get", "id"], selectedId ?? ""],
      "#0f172a",
      "#1d4ed8"
    ]);
    map.setPaintProperty("points", "circle-radius", [
      "case",
      ["==", ["get", "id"], selectedId ?? ""],
      10,
      8
    ]);

    if (!selectedId) return;
    const listing = listings.find((entry) => entry.id === selectedId);
    if (!listing) return;
    map.easeTo({ center: [listing.lng, listing.lat], duration: 500 });
  }, [listings, ready, selectedId]);

  const selectedListing = selectedId ? listings.find((listing) => listing.id === selectedId) : undefined;

  return (
    <div className="relative h-[60vh] min-h-[420px] w-full overflow-hidden rounded-2xl border border-border/60 bg-muted/30 shadow-soft lg:h-full">
      <div ref={containerRef} className="h-full w-full" />
      {isDirty && (
        <div className="pointer-events-none absolute inset-x-0 top-4 flex justify-center">
          <Button className="pointer-events-auto" onClick={onSearchArea}>
            Search this area
          </Button>
        </div>
      )}
      {selectedListing && (
        <div className="pointer-events-none absolute bottom-4 left-4 right-4">
          <div className="pointer-events-auto rounded-xl border border-border/60 bg-card/95 p-4 shadow-soft backdrop-blur">
            <p className="text-sm font-medium">{selectedListing.title}</p>
            <p className="text-sm text-muted-foreground">
              {selectedListing.city}, {selectedListing.country}
            </p>
            <p className="text-base font-semibold text-primary">
              {formatCurrency(
                selectedListing.price.salePrice ?? selectedListing.price.rentPerMonth ?? selectedListing.price.nightRate ?? 0,
                selectedListing.currency
              )}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
