import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { DateRange } from '@/services/analyticsApi';
import { CalendarIcon } from 'lucide-react';
import React from 'react';

export type PeriodPreset = 'week' | '3months' | '6months' | '1year';

interface DateRangeSelectorProps {
  selectedPeriod: PeriodPreset;
  onPeriodChange: (period: PeriodPreset) => void;
}

const periodOptions = [
  { value: 'week' as PeriodPreset, label: 'Last Week', description: 'Last 7 days' },
  { value: '3months' as PeriodPreset, label: 'Last 3 Months', description: 'Last 90 days' },
  { value: '6months' as PeriodPreset, label: 'Last 6 Months', description: 'Last 180 days' },
  { value: '1year' as PeriodPreset, label: 'Last Year', description: 'Last 365 days' }
];

export const getDateRangeFromPeriod = (period: PeriodPreset): DateRange => {
  const endDate = new Date();
  const startDate = new Date();

  switch (period) {
    case 'week':
      startDate.setDate(endDate.getDate() - 7);
      break;
    case '3months':
      startDate.setMonth(endDate.getMonth() - 3);
      break;
    case '6months':
      startDate.setMonth(endDate.getMonth() - 6);
      break;
    case '1year':
      startDate.setFullYear(endDate.getFullYear() - 1);
      break;
    default:
      startDate.setMonth(endDate.getMonth() - 3); // Default to 3 months
  }

  return { startDate, endDate };
};

export const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({
  selectedPeriod,
  onPeriodChange
}) => {
  const currentOption = periodOptions.find(option => option.value === selectedPeriod);

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <CalendarIcon className="h-4 w-4 text-gray-500" />
        <span className="text-sm font-medium text-gray-700">Period:</span>
      </div>
      
      <Select value={selectedPeriod} onValueChange={onPeriodChange}>
        <SelectTrigger className="w-48">
          <SelectValue>
            <div className="flex flex-col items-start">
              <span className="font-medium">{currentOption?.label}</span>
              <span className="text-xs text-gray-500">{currentOption?.description}</span>
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {periodOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <div className="flex flex-col">
                <span className="font-medium">{option.label}</span>
                <span className="text-xs text-gray-500">{option.description}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};