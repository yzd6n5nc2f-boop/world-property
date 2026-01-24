"use client";

import { useEffect, useMemo } from "react";
import { BadgePoundSterling, Filter, Search, SlidersHorizontal } from "lucide-react";
import type { PropertyType } from "@/types/listing";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePreferencesStore } from "@/lib/stores/preferences-store";
import { supportedCurrencies } from "@/lib/fx/mock-rates";
import { cn } from "@/lib/utils/cn";

type FiltersPanelProps = {
  text: string;
  minPrice?: number;
  maxPrice?: number;
  minBeds?: number;
  propertyTypes: PropertyType[];
  onFiltersChange: (values: {
    text: string;
    minPrice?: number;
    maxPrice?: number;
    minBeds?: number;
    propertyTypes: PropertyType[];
  }) => void;
  onReset: () => void;
  onSaveSearch: () => void;
};

const propertyTypeOptions: Array<{ value: PropertyType; label: string }> = [
  { value: "apartment", label: "Apartment" },
  { value: "house", label: "House" },
  { value: "villa", label: "Villa" },
  { value: "condo", label: "Condo" },
  { value: "cabin", label: "Cabin" },
  { value: "loft", label: "Loft" },
  { value: "townhouse", label: "Townhouse" }
];

function parseInput(value: string) {
  if (!value) return undefined;
  const num = Number(value);
  return Number.isFinite(num) ? num : undefined;
}

export function FiltersPanel({ text, minPrice, maxPrice, minBeds, propertyTypes, onFiltersChange, onReset, onSaveSearch }: FiltersPanelProps) {
  const { displayCurrency, showLocalCurrency, hydrate, setDisplayCurrency, toggleShowLocalCurrency } = usePreferencesStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (text.trim()) count += 1;
    if (minPrice !== undefined || maxPrice !== undefined) count += 1;
    if (minBeds) count += 1;
    if (propertyTypes.length) count += 1;
    return count;
  }, [maxPrice, minBeds, minPrice, propertyTypes.length, text]);

  return (
    <section className="flex flex-col gap-5 rounded-2xl border border-border/60 bg-card/85 p-5 shadow-sm backdrop-blur">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-primary" />
          <h2 className="text-base font-semibold">Buyer filters</h2>
          <Badge variant="secondary" className="gap-1">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            {activeFilterCount}
          </Badge>
        </div>
        <Button variant="ghost" size="sm" onClick={onReset}>
          Reset
        </Button>
      </div>

      <div className="space-y-2 rounded-xl border border-border/60 bg-secondary/60 p-3">
        <Label className="flex items-center gap-2 text-sm text-muted-foreground">
          <BadgePoundSterling className="h-4 w-4" />
          Display currency
        </Label>
        <Select value={displayCurrency} onValueChange={setDisplayCurrency}>
          <SelectTrigger>
            <SelectValue placeholder="Select currency" />
          </SelectTrigger>
          <SelectContent>
            {supportedCurrencies.map((currency) => (
              <SelectItem key={currency} value={currency}>
                {currency}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
          <Checkbox checked={showLocalCurrency} onCheckedChange={() => toggleShowLocalCurrency()} />
          Show local currency alongside conversions
        </label>
        <p className="text-xs text-muted-foreground">FX rates are indicative (mock).</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="text-search" className="flex items-center gap-2 text-sm text-muted-foreground">
          <Search className="h-4 w-4" />
          City, country, or keyword
        </Label>
        <Input
          id="text-search"
          value={text}
          onChange={(event) => onFiltersChange({ text: event.target.value, minPrice, maxPrice, minBeds, propertyTypes })}
          placeholder="Try Lisbon, Dubai, or Tokyo"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="min-price">Min price</Label>
          <Input
            id="min-price"
            inputMode="numeric"
            placeholder="Any"
            value={minPrice ?? ""}
            onChange={(event) =>
              onFiltersChange({
                text,
                minPrice: parseInput(event.target.value),
                maxPrice,
                minBeds,
                propertyTypes
              })
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="max-price">Max price</Label>
          <Input
            id="max-price"
            inputMode="numeric"
            placeholder="Any"
            value={maxPrice ?? ""}
            onChange={(event) =>
              onFiltersChange({
                text,
                minPrice,
                maxPrice: parseInput(event.target.value),
                minBeds,
                propertyTypes
              })
            }
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Minimum beds</Label>
        <Select
          value={minBeds?.toString() ?? "any"}
          onValueChange={(value) =>
            onFiltersChange({
              text,
              minPrice,
              maxPrice,
              minBeds: value === "any" ? undefined : Number(value),
              propertyTypes
            })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Any" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any</SelectItem>
            {[1, 2, 3, 4, 5].map((value) => (
              <SelectItem key={value} value={value.toString()}>
                {value}+
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Property type</Label>
          {propertyTypes.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                onFiltersChange({
                  text,
                  minPrice,
                  maxPrice,
                  minBeds,
                  propertyTypes: []
                })
              }
            >
              Clear
            </Button>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2">
          {propertyTypeOptions.map((option) => {
            const checked = propertyTypes.includes(option.value);
            return (
              <label
                key={option.value}
                className={cn(
                  "flex cursor-pointer items-center gap-2 rounded-lg border border-border/70 px-3 py-2 text-sm transition-colors hover:border-primary/40 hover:bg-accent/40",
                  checked && "border-primary/60 bg-primary/5"
                )}
              >
                <Checkbox
                  checked={checked}
                  onCheckedChange={(value) => {
                    const next = value
                      ? [...propertyTypes, option.value]
                      : propertyTypes.filter((entry) => entry !== option.value);
                    onFiltersChange({ text, minPrice, maxPrice, minBeds, propertyTypes: next });
                  }}
                />
                {option.label}
              </label>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Button onClick={onSaveSearch}>Save search</Button>
        <p className="text-xs text-muted-foreground">Saved searches are stored locally on this device.</p>
      </div>

      <div className="rounded-xl border border-dashed border-border/70 bg-muted/40 p-3 text-xs text-muted-foreground">
        Buyer journey tip: pan the map to your target neighbourhood, then tap “Search this area” to refresh results.
      </div>
    </section>
  );
}
