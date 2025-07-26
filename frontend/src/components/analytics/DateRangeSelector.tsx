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

export type PeriodPreset = 'month' | 'week' | '3months' | '6months' | '1year';

interface DateRangeSelectorProps {
  selectedPeriod: PeriodPreset;
  onPeriodChange: (period: PeriodPreset) => void;
}

const periodOptions = [
  { value: 'month' as PeriodPreset, label: 'Last Month', description: 'From 1st of month to today' },
  { value: 'week' as PeriodPreset, label: 'Last Week', description: 'From Monday to today' },
  { value: '3months' as PeriodPreset, label: 'Last 3 Months', description: 'From 1st of 3 months ago' },
  { value: '6months' as PeriodPreset, label: 'Last 6 Months', description: 'From 1st of 6 months ago' },
  { value: '1year' as PeriodPreset, label: 'Last Year', description: 'From 1st of 12 months ago' }
];

// Calendar-based calculation functions
const getStartOfMonth = (): Date => {
  const today = new Date();
  return new Date(today.getFullYear(), today.getMonth(), 1);
};

const getStartOfWeek = (): Date => {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(today);
  monday.setDate(today.getDate() + mondayOffset);
  return monday;
};

export const getDateRangeFromPeriod = (period: PeriodPreset): DateRange => {
  const endDate = new Date();
  let startDate: Date;

  switch (period) {
    case 'month':
      // From 1st of current month to today
      startDate = getStartOfMonth();
      break;
    case 'week':
      // From Monday of current week to today
      startDate = getStartOfWeek();
      break;
    case '3months':
      // From 1st of 3 months ago to today
      startDate = new Date(endDate.getFullYear(), endDate.getMonth() - 3, 1);
      break;
    case '6months':
      // From 1st of 6 months ago to today
      startDate = new Date(endDate.getFullYear(), endDate.getMonth() - 6, 1);
      break;
    case '1year':
      // From 1st of 12 months ago to today
      startDate = new Date(endDate.getFullYear(), endDate.getMonth() - 12, 1);
      break;
    default:
      // Default to current month
      startDate = getStartOfMonth();
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