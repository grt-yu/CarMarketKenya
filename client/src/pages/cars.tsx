import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Filter, Search, Grid, List, ChevronDown } from "lucide-react";
import CarCard from "@/components/car-card";
import { CAR_MAKES, BODY_TYPES, FUEL_TYPES, TRANSMISSIONS, KENYAN_COUNTIES, PRICE_RANGES } from "@/lib/constants";
import type { SearchFilters, CarWithSeller } from "@/lib/types";

export default function Cars() {
  const [location, setLocation] = useLocation();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    page: 1,
    limit: 20,
  });

  // Parse URL parameters on mount
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const urlFilters: SearchFilters = {
      page: parseInt(searchParams.get("page") || "1"),
      limit: parseInt(searchParams.get("limit") || "20"),
    };

    // Parse all possible filter parameters
    const filterKeys: (keyof SearchFilters)[] = [
      "make", "priceMin", "priceMax", "location", "county", 
      "fuelType", "transmission", "bodyType", "year"
    ];

    filterKeys.forEach(key => {
      const value = searchParams.get(key);
      if (value) {
        if (key === "priceMin" || key === "priceMax" || key === "year") {
          urlFilters[key] = parseInt(value);
        } else {
          urlFilters[key] = value;
        }
      }
    });

    setFilters(urlFilters);
  }, [location]);

  const { data: carsData, isLoading, error } = useQuery({
    queryKey: ["/api/cars", filters],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          searchParams.set(key, value.toString());
        }
      });
      
      const response = await fetch(`/api/cars?${searchParams.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch cars");
      }
      return response.json();
    },
  });

  const updateFilters = (newFilters: Partial<SearchFilters>) => {
    const updatedFilters = { ...filters, ...newFilters, page: 1 };
    setFilters(updatedFilters);
    
    // Update URL
    const searchParams = new URLSearchParams();
    Object.entries(updatedFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        searchParams.set(key, value.toString());
      }
    });
    setLocation(`/cars?${searchParams.toString()}`);
  };

  const handlePriceRangeChange = (rangeLabel: string) => {
    const range = PRICE_RANGES.find(r => r.label === rangeLabel);
    if (range) {
      updateFilters({ 
        priceMin: range.min, 
        priceMax: range.max 
      });
    }
  };

  const clearFilters = () => {
    setFilters({ page: 1, limit: 20 });
    setLocation("/cars");
  };

  const handlePageChange = (page: number) => {
    updateFilters({ page });
  };

  const cars = carsData?.cars || [];
  const total = carsData?.total || 0;
  const totalPages = Math.ceil(total / (filters.limit || 20));

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold text-destructive mb-4">Error Loading Cars</h2>
            <p className="text-neutral-600 mb-4">
              We encountered an error while fetching the car listings. Please try again later.
            </p>
            <Button onClick={() => window.location.reload()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <aside className={`lg:w-80 ${showFilters ? 'block' : 'hidden lg:block'}`}>
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Filters</span>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={clearFilters}
                  className="text-sm"
                >
                  Clear All
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Make */}
              <div>
                <Label htmlFor="make">Make</Label>
                <Select 
                  value={filters.make || ""} 
                  onValueChange={(value) => updateFilters({ make: value || undefined })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Any Make" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any Make</SelectItem>
                    {CAR_MAKES.map((make) => (
                      <SelectItem key={make} value={make}>{make}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Price Range */}
              <div>
                <Label>Price Range</Label>
                <Select onValueChange={handlePriceRangeChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any Price" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any Price</SelectItem>
                    {PRICE_RANGES.map((range) => (
                      <SelectItem key={range.label} value={range.label}>
                        {range.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Custom Price Range */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="priceMin">Min Price</Label>
                  <Input
                    id="priceMin"
                    type="number"
                    placeholder="Min"
                    value={filters.priceMin || ""}
                    onChange={(e) => updateFilters({ 
                      priceMin: e.target.value ? parseInt(e.target.value) : undefined 
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="priceMax">Max Price</Label>
                  <Input
                    id="priceMax"
                    type="number"
                    placeholder="Max"
                    value={filters.priceMax || ""}
                    onChange={(e) => updateFilters({ 
                      priceMax: e.target.value ? parseInt(e.target.value) : undefined 
                    })}
                  />
                </div>
              </div>

              {/* Location */}
              <div>
                <Label htmlFor="county">County</Label>
                <Select 
                  value={filters.county || ""} 
                  onValueChange={(value) => updateFilters({ county: value || undefined })}
                >
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

              {/* Body Type */}
              <div>
                <Label htmlFor="bodyType">Body Type</Label>
                <Select 
                  value={filters.bodyType || ""} 
                  onValueChange={(value) => updateFilters({ bodyType: value || undefined })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Any Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any Type</SelectItem>
                    {BODY_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Fuel Type */}
              <div>
                <Label htmlFor="fuelType">Fuel Type</Label>
                <Select 
                  value={filters.fuelType || ""} 
                  onValueChange={(value) => updateFilters({ fuelType: value || undefined })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Any Fuel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any Fuel</SelectItem>
                    {FUEL_TYPES.map((fuel) => (
                      <SelectItem key={fuel} value={fuel}>{fuel}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Transmission */}
              <div>
                <Label htmlFor="transmission">Transmission</Label>
                <Select 
                  value={filters.transmission || ""} 
                  onValueChange={(value) => updateFilters({ transmission: value || undefined })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Any Transmission" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any Transmission</SelectItem>
                    {TRANSMISSIONS.map((trans) => (
                      <SelectItem key={trans} value={trans}>{trans}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Year */}
              <div>
                <Label htmlFor="year">Year</Label>
                <Input
                  id="year"
                  type="number"
                  placeholder="Any Year"
                  min="1990"
                  max={new Date().getFullYear()}
                  value={filters.year || ""}
                  onChange={(e) => updateFilters({ 
                    year: e.target.value ? parseInt(e.target.value) : undefined 
                  })}
                />
              </div>
            </CardContent>
          </Card>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900">Browse Cars</h1>
              <p className="text-neutral-600 mt-1">
                {isLoading ? "Loading..." : `${total} cars found`}
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Mobile Filter Toggle */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>

              {/* View Mode Toggle */}
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Active Filters */}
          {Object.entries(filters).some(([key, value]) => 
            value && !["page", "limit"].includes(key)
          ) && (
            <div className="flex flex-wrap gap-2 mb-6">
              {Object.entries(filters).map(([key, value]) => {
                if (!value || ["page", "limit"].includes(key)) return null;
                
                return (
                  <Badge key={key} variant="secondary" className="flex items-center gap-1">
                    {key}: {value}
                    <button
                      onClick={() => updateFilters({ [key]: undefined })}
                      className="ml-1 hover:text-destructive"
                    >
                      ×
                    </button>
                  </Badge>
                );
              })}
            </div>
          )}

          {/* Results */}
          {isLoading ? (
            <div className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"}`}>
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="w-full h-48" />
                  <CardContent className="p-6 space-y-3">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-16 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : cars.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Search className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-neutral-900 mb-2">No cars found</h3>
                <p className="text-neutral-600 mb-4">
                  Try adjusting your search filters to find more results.
                </p>
                <Button onClick={clearFilters} variant="outline">
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"}`}>
              {cars.map((car: CarWithSeller) => (
                <CarCard 
                  key={car.id} 
                  car={car}
                  onFavoriteToggle={(carId, isFavorite) => {
                    console.log("Favorite toggled:", carId, isFavorite);
                  }}
                  onMessage={(sellerId, carId) => {
                    console.log("Message clicked:", sellerId, carId);
                  }}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <Button
                variant="outline"
                disabled={filters.page === 1}
                onClick={() => handlePageChange((filters.page || 1) - 1)}
              >
                Previous
              </Button>
              
              {[...Array(totalPages)].map((_, i) => {
                const page = i + 1;
                const isCurrentPage = page === filters.page;
                
                // Show first, last, current, and pages around current
                if (
                  page === 1 || 
                  page === totalPages || 
                  (page >= (filters.page || 1) - 2 && page <= (filters.page || 1) + 2)
                ) {
                  return (
                    <Button
                      key={page}
                      variant={isCurrentPage ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </Button>
                  );
                }
                
                // Show ellipsis
                if (page === (filters.page || 1) - 3 || page === (filters.page || 1) + 3) {
                  return <span key={page} className="px-2">...</span>;
                }
                
                return null;
              })}
              
              <Button
                variant="outline"
                disabled={filters.page === totalPages}
                onClick={() => handlePageChange((filters.page || 1) + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
