"use client";

import { useMemo } from "react";
import { Filter, Home, Landmark, Search, SlidersHorizontal } from "lucide-react";
import type { ListingMode, PropertyType } from "@/types/listing";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DateRangePicker } from "@/features/search/date-range-picker";
import { cn } from "@/lib/utils/cn";

type FiltersPanelProps = {
  mode: ListingMode;
  text: string;
  minPrice?: number;
  maxPrice?: number;
  minBeds?: number;
  propertyTypes: PropertyType[];
  startDate?: string;
  endDate?: string;
  onModeChange: (mode: ListingMode) => void;
  onFiltersChange: (values: {
    text: string;
    minPrice?: number;
    maxPrice?: number;
    minBeds?: number;
    propertyTypes: PropertyType[];
    startDate?: string;
    endDate?: string;
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

export function FiltersPanel({
  mode,
  text,
  minPrice,
  maxPrice,
  minBeds,
  propertyTypes,
  startDate,
  endDate,
  onModeChange,
  onFiltersChange,
  onReset,
  onSaveSearch
}: FiltersPanelProps) {
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (text.trim()) count += 1;
    if (minPrice !== undefined || maxPrice !== undefined) count += 1;
    if (minBeds) count += 1;
    if (propertyTypes.length) count += 1;
    if (mode === "stay" && (startDate || endDate)) count += 1;
    return count;
  }, [endDate, maxPrice, minBeds, minPrice, mode, propertyTypes.length, startDate, text]);

  const modeLabel = mode === "stay" ? "Stay" : "Buy / Rent";

  return (
    <section className="flex flex-col gap-5 rounded-2xl border border-border/60 bg-card/80 p-5 shadow-sm backdrop-blur">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-primary" />
          <h2 className="text-base font-semibold">Filters</h2>
          <Badge variant="secondary" className="gap-1">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            {activeFilterCount}
          </Badge>
        </div>
        <Button variant="ghost" size="sm" onClick={onReset}>
          Reset
        </Button>
      </div>

      <Tabs value={mode === "stay" ? "stay" : "buy"} onValueChange={(value) => onModeChange(value === "stay" ? "stay" : "buy")}> 
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="buy" className="gap-2">
            <Landmark className="h-4 w-4" />
            Buy / Rent
          </TabsTrigger>
          <TabsTrigger value="stay" className="gap-2">
            <Home className="h-4 w-4" />
            Stay
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="space-y-2">
        <Label htmlFor="text-search" className="flex items-center gap-2 text-sm text-muted-foreground">
          <Search className="h-4 w-4" />
          City, country, or keyword
        </Label>
        <Input
          id="text-search"
          value={text}
          onChange={(event) => onFiltersChange({ text: event.target.value, minPrice, maxPrice, minBeds, propertyTypes, startDate, endDate })}
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
                propertyTypes,
                startDate,
                endDate
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
                propertyTypes,
                startDate,
                endDate
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
              propertyTypes,
              startDate,
              endDate
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
                  propertyTypes: [],
                  startDate,
                  endDate
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
                    onFiltersChange({ text, minPrice, maxPrice, minBeds, propertyTypes: next, startDate, endDate });
                  }}
                />
                {option.label}
              </label>
            );
          })}
        </div>
      </div>

      {mode === "stay" && (
        <div className="space-y-2">
          <Label>Dates</Label>
          <DateRangePicker
            startDate={startDate}
            endDate={endDate}
            onChange={({ startDate: nextStart, endDate: nextEnd }) =>
              onFiltersChange({ text, minPrice, maxPrice, minBeds, propertyTypes, startDate: nextStart, endDate: nextEnd })
            }
          />
        </div>
      )}

      <div className="flex flex-col gap-2">
        <Button onClick={onSaveSearch}>Save search</Button>
        <p className="text-xs text-muted-foreground">Saved searches are stored locally on this device.</p>
      </div>

      <div className="rounded-xl border border-dashed border-border/70 bg-muted/40 p-3 text-xs text-muted-foreground">
        Mode: <span className="font-medium text-foreground">{modeLabel}</span>. Pan the map, then use “Search this area”.
      </div>
    </section>
  );
}
