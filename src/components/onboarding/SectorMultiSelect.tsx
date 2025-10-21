import { useState } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';

export const SETA_SECTORS = [
  'Agriculture',
  'Banking',
  'Chemical Industries',
  'Construction',
  'Culture, Arts, Tourism, Hospitality & Sport',
  'Education, Training & Development',
  'Energy & Water',
  'Fibre Processing & Manufacturing',
  'Finance & Accounting Services',
  'Food & Beverage Manufacturing',
  'Health & Welfare',
  'Insurance',
  'Local Government',
  'Manufacturing, Engineering & Related Services',
  'Media, Information & Communication Technologies',
  'Mining',
  'Public Service',
  'Safety & Security',
  'Services',
  'Transport',
  'Wholesale & Retail',
];

interface SectorMultiSelectProps {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
}

export const SectorMultiSelect = ({ value = [], onChange, placeholder = 'Select sectors...' }: SectorMultiSelectProps) => {
  const [open, setOpen] = useState(false);

  const handleSelect = (sector: string) => {
    const newValue = value.includes(sector)
      ? value.filter((v) => v !== sector)
      : [...value, sector];
    onChange(newValue);
  };

  const handleRemove = (sector: string) => {
    onChange(value.filter((v) => v !== sector));
  };

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between h-auto min-h-10"
          >
            {value.length === 0 ? (
              <span className="text-muted-foreground">{placeholder}</span>
            ) : (
              <span className="text-sm">{value.length} sector(s) selected</span>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0 bg-popover" align="start">
          <Command className="bg-popover">
            <CommandInput placeholder="Search sectors..." className="h-9" />
            <CommandEmpty>No sector found.</CommandEmpty>
            <CommandGroup className="max-h-64 overflow-auto">
              {SETA_SECTORS.map((sector) => (
                <CommandItem
                  key={sector}
                  value={sector}
                  onSelect={() => handleSelect(sector)}
                  className="cursor-pointer"
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value.includes(sector) ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  {sector}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>

      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((sector) => (
            <Badge
              key={sector}
              variant="secondary"
              className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors"
              onClick={() => handleRemove(sector)}
            >
              {sector}
              <span className="ml-1 text-xs">×</span>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};
