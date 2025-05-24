import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import { CAR_MAKES, KENYAN_COUNTIES, PRICE_RANGES } from "@/lib/constants";
import type { SearchFilters } from "@/lib/types";

interface SearchFormProps {
  initialFilters?: SearchFilters;
  onSearch?: (filters: SearchFilters) => void;
  compact?: boolean;
}

export default function SearchForm({ initialFilters, onSearch, compact = false }: SearchFormProps) {
  const [, setLocation] = useLocation();
  const [filters, setFilters] = useState<SearchFilters>(initialFilters || {});

  const handleSearch = () => {
    if (onSearch) {
      onSearch(filters);
    } else {
      // Navigate to cars page with filters
      const searchParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          searchParams.set(key, value.toString());
        }
      });
      setLocation(`/cars?${searchParams.toString()}`);
    }
  };

  const updateFilter = (key: keyof SearchFilters, value: string | number | undefined) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  if (compact) {
    return (
      <div className="flex gap-2">
        <Select onValueChange={(value) => updateFilter("make", value)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Make" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any Make</SelectItem>
            {CAR_MAKES.map((make) => (
              <SelectItem key={make} value={make}>{make}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select onValueChange={(value) => {
          const range = PRICE_RANGES.find(r => r.label === value);
          if (range) {
            updateFilter("priceMin", range.min);
            updateFilter("priceMax", range.max);
          }
        }}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Price" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any Price</SelectItem>
            {PRICE_RANGES.map((range) => (
              <SelectItem key={range.label} value={range.label}>{range.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Button onClick={handleSearch} size="sm">
          <Search className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">Make</label>
          <Select onValueChange={(value) => updateFilter("make", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Any Make" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any Make</SelectItem>
              {CAR_MAKES.map((make) => (
                <SelectItem key={make} value={make}>{make}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">Price Range</label>
          <Select onValueChange={(value) => {
            const range = PRICE_RANGES.find(r => r.label === value);
            if (range) {
              updateFilter("priceMin", range.min);
              updateFilter("priceMax", range.max);
            }
          }}>
            <SelectTrigger>
              <SelectValue placeholder="Any Price" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any Price</SelectItem>
              {PRICE_RANGES.map((range) => (
                <SelectItem key={range.label} value={range.label}>{range.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">Location</label>
          <Select onValueChange={(value) => updateFilter("county", value)}>
            <SelectTrigger>
              <SelectValue placeholder="All Kenya" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Kenya</SelectItem>
              {KENYAN_COUNTIES.map((county) => (
                <SelectItem key={county} value={county}>{county}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <Button onClick={handleSearch} className="w-full bg-secondary hover:bg-secondary/90">
        <Search className="h-4 w-4 mr-2" />
        Search Cars
      </Button>
    </div>
  );
}
