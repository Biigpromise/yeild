import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, ChevronDown } from 'lucide-react';
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter } from 'date-fns';
import { cn } from '@/lib/utils';

export interface DateRange {
  from: Date;
  to: Date;
}

interface DateRangeSelectorProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  className?: string;
}

const presetRanges = [
  {
    label: 'Last 7 days',
    getValue: () => ({
      from: subDays(new Date(), 6),
      to: new Date()
    })
  },
  {
    label: 'Last 30 days',
    getValue: () => ({
      from: subDays(new Date(), 29),
      to: new Date()
    })
  },
  {
    label: 'This week',
    getValue: () => ({
      from: startOfWeek(new Date()),
      to: endOfWeek(new Date())
    })
  },
  {
    label: 'This month',
    getValue: () => ({
      from: startOfMonth(new Date()),
      to: endOfMonth(new Date())
    })
  },
  {
    label: 'This quarter',
    getValue: () => ({
      from: startOfQuarter(new Date()),
      to: endOfQuarter(new Date())
    })
  },
  {
    label: 'Last quarter',
    getValue: () => {
      const lastQuarter = subDays(startOfQuarter(new Date()), 1);
      return {
        from: startOfQuarter(lastQuarter),
        to: endOfQuarter(lastQuarter)
      };
    }
  }
];

export const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({
  value,
  onChange,
  className
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRange, setSelectedRange] = useState<{ from?: Date; to?: Date }>({
    from: value.from,
    to: value.to
  });

  const handleRangeSelect = (range: { from?: Date; to?: Date }) => {
    setSelectedRange(range);
    if (range.from && range.to) {
      onChange({ from: range.from, to: range.to });
      setIsOpen(false);
    }
  };

  const handlePresetSelect = (preset: typeof presetRanges[0]) => {
    const range = preset.getValue();
    setSelectedRange(range);
    onChange(range);
    setIsOpen(false);
  };

  const formatDateRange = (range: DateRange) => {
    if (range.from && range.to) {
      if (format(range.from, 'yyyy-MM-dd') === format(range.to, 'yyyy-MM-dd')) {
        return format(range.from, 'MMM dd, yyyy');
      }
      return `${format(range.from, 'MMM dd')} - ${format(range.to, 'MMM dd, yyyy')}`;
    }
    return 'Select date range';
  };

  const getActivePeriodBadge = () => {
    const activePreset = presetRanges.find(preset => {
      const presetRange = preset.getValue();
      return (
        format(presetRange.from, 'yyyy-MM-dd') === format(value.from, 'yyyy-MM-dd') &&
        format(presetRange.to, 'yyyy-MM-dd') === format(value.to, 'yyyy-MM-dd')
      );
    });

    if (activePreset) {
      return (
        <Badge variant="secondary" className="ml-2 text-xs">
          {activePreset.label}
        </Badge>
      );
    }

    return null;
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              'justify-start text-left font-normal',
              !value.from && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {formatDateRange(value)}
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="flex">
            {/* Preset Options */}
            <div className="border-r border-border p-3 space-y-1 min-w-[140px]">
              <div className="text-sm font-medium text-foreground mb-2">Quick Select</div>
              {presetRanges.map((preset, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-xs"
                  onClick={() => handlePresetSelect(preset)}
                >
                  {preset.label}
                </Button>
              ))}
            </div>

            {/* Calendar */}
            <div className="p-3">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={value.from}
                selected={selectedRange.from && selectedRange.to ? selectedRange as DateRange : undefined}
                onSelect={handleRangeSelect}
                numberOfMonths={2}
                className="pointer-events-auto"
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>
      
      {getActivePeriodBadge()}
    </div>
  );
};