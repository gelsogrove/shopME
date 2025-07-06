import React from 'react';
import { CalendarIcon, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { DateRange, getDefaultDateRange, formatDateForDisplay } from '@/services/analyticsApi';

interface DateRangeSelectorProps {
  dateRange: DateRange;
  onDateRangeChange: (dateRange: DateRange) => void;
  isDefault: boolean;
}

export const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({
  dateRange,
  onDateRangeChange,
  isDefault
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const handleReset = () => {
    const defaultRange = getDefaultDateRange();
    onDateRangeChange(defaultRange);
    setIsOpen(false);
  };

  const handleDateSelect = (range: { from?: Date; to?: Date } | undefined) => {
    if (range?.from && range?.to) {
      onDateRangeChange({
        startDate: range.from,
        endDate: range.to
      });
      setIsOpen(false);
    }
  };

  const getCurrentMonthInfo = () => {
    const now = new Date();
    const currentMonthName = now.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' });
    return currentMonthName;
  };

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant="outline"
                className={cn(
                  "w-[300px] justify-start text-left font-normal",
                  !dateRange && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange ? (
                  <>
                    {formatDateForDisplay(dateRange.startDate)} -{" "}
                    {formatDateForDisplay(dateRange.endDate)}
                  </>
                ) : (
                  <span>Seleziona periodo</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange.startDate}
                selected={{
                  from: dateRange.startDate,
                  to: dateRange.endDate
                }}
                onSelect={handleDateSelect}
                numberOfMonths={2}
                locale={it}
              />
              <div className="p-3 border-t">
                <Button
                  onClick={handleReset}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  Ripristina Default (Ultimi 3 Mesi)
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          {!isDefault && (
            <Button
              onClick={handleReset}
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
            >
              Ripristina Default
            </Button>
          )}
        </div>
      </div>

      {/* Information about current month exclusion */}
      <div className="flex items-start space-x-2 text-sm text-muted-foreground bg-blue-50 p-3 rounded-md border border-blue-200">
        <Info className="h-4 w-4 mt-0.5 text-blue-600" />
        <div>
          <p className="font-medium text-blue-800">
            Informazioni sul periodo di default
          </p>
          <p className="mt-1">
            <strong>Default:</strong> Ultimi 3 mesi completi (escluso il mese corrente: {getCurrentMonthInfo()})
          </p>
          <p className="text-xs mt-1">
            Il mese corrente è escluso per garantire dati completi e comparabili mese su mese.
          </p>
          {isDefault && (
            <p className="text-xs mt-1 text-blue-700 font-medium">
              ✓ Stai visualizzando il periodo di default
            </p>
          )}
        </div>
      </div>
    </div>
  );
};