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

export type PeriodPreset = 'week' | '30days' | '3months' | '6months' | '1year';

interface DateRangeSelectorProps {
  selectedPeriod: PeriodPreset;
  onPeriodChange: (period: PeriodPreset) => void;
}

const periodOptions = [
  { value: 'week' as PeriodPreset, label: 'Ultima Settimana', description: 'Ultimi 7 giorni' },
  { value: '30days' as PeriodPreset, label: 'Ultimi 30 Giorni', description: 'Ultimi 30 giorni' },
  { value: '3months' as PeriodPreset, label: 'Ultimi 3 Mesi', description: 'Ultimi 90 giorni' },
  { value: '6months' as PeriodPreset, label: 'Ultimi 6 Mesi', description: 'Ultimi 180 giorni' },
  { value: '1year' as PeriodPreset, label: 'Ultimo Anno', description: 'Ultimi 365 giorni' }
];

export const getDateRangeFromPeriod = (period: PeriodPreset): DateRange => {
  const endDate = new Date();
  const startDate = new Date();

  switch (period) {
    case 'week':
      startDate.setDate(endDate.getDate() - 7);
      break;
    case '30days':
      startDate.setDate(endDate.getDate() - 30);
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
      startDate.setDate(endDate.getDate() - 7); // Default to 1 week
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
        <span className="text-sm font-medium text-gray-700">Periodo:</span>
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