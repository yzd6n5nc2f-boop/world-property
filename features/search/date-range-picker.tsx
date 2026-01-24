"use client";

import { useMemo } from "react";
import { format } from "date-fns";
import { CalendarDays } from "lucide-react";
import { DayPicker, type DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils/cn";

type DateRangePickerProps = {
  startDate?: string;
  endDate?: string;
  onChange: (range: { startDate?: string; endDate?: string }) => void;
};

function toDateRange(startDate?: string, endDate?: string): DateRange | undefined {
  if (!startDate && !endDate) return undefined;
  return {
    from: startDate ? new Date(startDate) : undefined,
    to: endDate ? new Date(endDate) : undefined
  };
}

export function DateRangePicker({ startDate, endDate, onChange }: DateRangePickerProps) {
  const value = useMemo(() => toDateRange(startDate, endDate), [endDate, startDate]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className={cn("w-full justify-start gap-2 text-left font-normal", !value && "text-muted-foreground")}> 
          <CalendarDays className="h-4 w-4" />
          {value?.from ? (
            value.to ? (
              <span>
                {format(value.from, "dd MMM yyyy")} - {format(value.to, "dd MMM yyyy")}
              </span>
            ) : (
              format(value.from, "dd MMM yyyy")
            )
          ) : (
            "Add dates"
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <DayPicker
          mode="range"
          numberOfMonths={2}
          selected={value}
          onSelect={(range) =>
            onChange({
              startDate: range?.from?.toISOString(),
              endDate: range?.to?.toISOString()
            })
          }
        />
      </PopoverContent>
    </Popover>
  );
}
