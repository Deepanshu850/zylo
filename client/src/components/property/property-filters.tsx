import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { X, SlidersHorizontal } from "lucide-react";
import { 
  CITIES, 
  BUDGET_RANGES, 
  BHK_OPTIONS, 
  PROPERTY_TYPES, 
  PROPERTY_STATUS,
  AMENITIES,
  CREDIBILITY_THRESHOLDS,
  formatCurrency
} from "@/lib/constants";
import type { SearchFilters } from "@shared/schema";

interface PropertyFiltersProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  onClear: () => void;
}

export default function PropertyFilters({ filters, onFiltersChange, onClear }: PropertyFiltersProps) {
  const [localFilters, setLocalFilters] = useState<SearchFilters>(filters);
  const [budgetRange, setBudgetRange] = useState([
    filters.budget?.min || 1000000,
    filters.budget?.max || 50000000
  ]);
  const [credibilityMin, setCredibilityMin] = useState([filters.credibilityMin || 70]);

  const updateFilters = (newFilters: Partial<SearchFilters>) => {
    const updated = { ...localFilters, ...newFilters };
    setLocalFilters(updated);
    onFiltersChange(updated);
  };

  const handleBudgetChange = (values: number[]) => {
    setBudgetRange(values);
    updateFilters({
      budget: {
        min: values[0],
        max: values[1]
      }
    });
  };

  const handleCredibilityChange = (values: number[]) => {
    setCredibilityMin(values);
    updateFilters({ credibilityMin: values[0] });
  };

  const handleBHKToggle = (bhk: number) => {
    const currentBHKs = localFilters.bhk || [];
    const newBHKs = currentBHKs.includes(bhk)
      ? currentBHKs.filter(b => b !== bhk)
      : [...currentBHKs, bhk];
    
    updateFilters({ bhk: newBHKs });
  };

  const handleStatusToggle = (status: string) => {
    const currentStatuses = localFilters.status || [];
    const newStatuses = currentStatuses.includes(status)
      ? currentStatuses.filter(s => s !== status)
      : [...currentStatuses, status];
    
    updateFilters({ status: newStatuses });
  };

  const handleLocalityChange = (locality: string) => {
    updateFilters({ locality: locality || undefined });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (localFilters.city) count++;
    if (localFilters.locality) count++;
    if (localFilters.budget) count++;
    if (localFilters.bhk?.length) count++;
    if (localFilters.status?.length) count++;
    if (localFilters.verified) count++;
    if (localFilters.reraApproved) count++;
    if (localFilters.credibilityMin && localFilters.credibilityMin > 70) count++;
    return count;
  };

  const clearFilters = () => {
    setLocalFilters({});
    setBudgetRange([1000000, 50000000]);
    setCredibilityMin([70]);
    onClear();
  };

  const activeFiltersCount = getActiveFiltersCount();

  // Get trending localities for selected city
  const getTrendingLocalities = (city: string) => {
    const localities: Record<string, string[]> = {
      "Mumbai": ["Bandra West", "Powai", "Thane West", "Kandivali East", "Malad West"],
      "Delhi NCR": ["Gurgaon Sector 84", "Noida Extension", "Greater Noida", "Faridabad", "Dwarka"],
      "Bangalore": ["Whitefield", "Electronic City", "Sarjapur", "Hebbal", "Koramangala"],
      "Chennai": ["OMR Chennai", "Velachery", "Thoraipakkam", "Porur", "Anna Nagar"],
      "Hyderabad": ["Gachibowli", "Hitec City", "Kondapur", "Manikonda", "Tellapur"],
      "Pune": ["Hinjewadi", "Wakad", "Kharadi", "Baner", "Aundh"]
    };
    return localities[city] || [];
  };

  return (
    <Card className="sticky top-24 h-fit">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <SlidersHorizontal className="h-5 w-5" />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <Badge className="bg-primary text-white">{activeFiltersCount}</Badge>
            )}
          </CardTitle>
          {activeFiltersCount > 0 && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Location */}
        <div>
          <Label className="text-sm font-medium mb-3 block">Location</Label>
          <div className="space-y-3">
            <Select 
              value={localFilters.city || ""} 
              onValueChange={(value) => updateFilters({ city: value || undefined })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select City" />
              </SelectTrigger>
              <SelectContent>
                {CITIES.map((city) => (
                  <SelectItem key={city} value={city}>{city}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {localFilters.city && (
              <Select 
                value={localFilters.locality || ""} 
                onValueChange={handleLocalityChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Locality" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Localities</SelectItem>
                  {getTrendingLocalities(localFilters.city).map((locality) => (
                    <SelectItem key={locality} value={locality}>{locality}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        <Separator />

        {/* Budget Range */}
        <div>
          <Label className="text-sm font-medium mb-3 block">
            Budget Range: {formatCurrency(budgetRange[0])} - {formatCurrency(budgetRange[1])}
          </Label>
          <Slider
            value={budgetRange}
            onValueChange={handleBudgetChange}
            min={1000000}
            max={100000000}
            step={500000}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>₹10L</span>
            <span>₹10Cr+</span>
          </div>
        </div>

        <Separator />

        {/* BHK Configuration */}
        <div>
          <Label className="text-sm font-medium mb-3 block">BHK Configuration</Label>
          <div className="grid grid-cols-2 gap-2">
            {BHK_OPTIONS.map((bhk) => (
              <div key={bhk.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`bhk-${bhk.value}`}
                  checked={(localFilters.bhk || []).includes(bhk.value)}
                  onCheckedChange={() => handleBHKToggle(bhk.value)}
                />
                <Label htmlFor={`bhk-${bhk.value}`} className="text-sm">
                  {bhk.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Property Status */}
        <div>
          <Label className="text-sm font-medium mb-3 block">Property Status</Label>
          <div className="space-y-2">
            {PROPERTY_STATUS.map((status) => (
              <div key={status.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`status-${status.value}`}
                  checked={(localFilters.status || []).includes(status.value)}
                  onCheckedChange={() => handleStatusToggle(status.value)}
                />
                <Label htmlFor={`status-${status.value}`} className="text-sm">
                  {status.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Credibility Score */}
        <div>
          <Label className="text-sm font-medium mb-3 block">
            Minimum Credibility Score: {credibilityMin[0]}
          </Label>
          <Slider
            value={credibilityMin}
            onValueChange={handleCredibilityChange}
            min={50}
            max={100}
            step={5}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>50</span>
            <span>100</span>
          </div>
        </div>

        <Separator />

        {/* Verification Filters */}
        <div>
          <Label className="text-sm font-medium mb-3 block">Verification</Label>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="verified"
                checked={!!localFilters.verified}
                onCheckedChange={(checked) => updateFilters({ verified: checked ? true : undefined })}
              />
              <Label htmlFor="verified" className="text-sm">
                AI Verified Properties Only
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="rera"
                checked={!!localFilters.reraApproved}
                onCheckedChange={(checked) => updateFilters({ reraApproved: checked ? true : undefined })}
              />
              <Label htmlFor="rera" className="text-sm">
                RERA Approved Only
              </Label>
            </div>
          </div>
        </div>

        <Separator />

        {/* Quick Filters */}
        <div>
          <Label className="text-sm font-medium mb-3 block">Popular Filters</Label>
          <div className="flex flex-wrap gap-2">
            <Badge 
              variant="outline" 
              className="cursor-pointer hover:bg-primary hover:text-white"
              onClick={() => updateFilters({ status: ["ready"] })}
            >
              Ready to Move
            </Badge>
            <Badge 
              variant="outline" 
              className="cursor-pointer hover:bg-primary hover:text-white"
              onClick={() => updateFilters({ credibilityMin: 90 })}
            >
              Premium Projects
            </Badge>
            <Badge 
              variant="outline" 
              className="cursor-pointer hover:bg-primary hover:text-white"
              onClick={() => updateFilters({ 
                budget: { min: 5000000, max: 15000000 },
                bhk: [2, 3]
              })}
            >
              Family Homes
            </Badge>
          </div>
        </div>

        {/* Applied Filters */}
        {activeFiltersCount > 0 && (
          <>
            <Separator />
            <div>
              <Label className="text-sm font-medium mb-3 block">Applied Filters</Label>
              <div className="space-y-2">
                {localFilters.city && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">City: {localFilters.city}</span>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => updateFilters({ city: undefined })}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
                {localFilters.locality && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Locality: {localFilters.locality}</span>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => updateFilters({ locality: undefined })}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
                {localFilters.bhk?.length && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      BHK: {localFilters.bhk.join(", ")}
                    </span>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => updateFilters({ bhk: undefined })}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
