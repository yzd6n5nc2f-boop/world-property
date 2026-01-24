"use client";

import { useEffect, useRef } from "react";
import maplibregl, { type Map } from "maplibre-gl";
import { cn } from "@/lib/utils/cn";

type PinMapProps = {
  lat: number;
  lng: number;
  onChange: (coords: { lat: number; lng: number }) => void;
  className?: string;
};

export function PinMap({ lat, lng, onChange, className }: PinMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Map | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
      center: [lng, lat],
      zoom: 10
    });

    const marker = new maplibregl.Marker({ draggable: true }).setLngLat([lng, lat]).addTo(map);

    map.on("click", (event) => {
      const coords = { lat: event.lngLat.lat, lng: event.lngLat.lng };
      marker.setLngLat([coords.lng, coords.lat]);
      onChangeRef.current(coords);
    });

    marker.on("dragend", () => {
      const position = marker.getLngLat();
      onChangeRef.current({ lat: position.lat, lng: position.lng });
    });

    mapRef.current = map;
    markerRef.current = marker;

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const marker = markerRef.current;
    if (!map || !marker) return;
    marker.setLngLat([lng, lat]);
    map.easeTo({ center: [lng, lat], duration: 400 });
  }, [lat, lng]);

  return <div ref={containerRef} className={cn("h-72 w-full overflow-hidden rounded-xl border border-border/60", className)} />;
}
