import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import PropertyCard from "@/components/property/property-card";
import PropertyFilters from "@/components/property/property-filters";
import BuilderCard from "@/components/builders/builder-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  MapPin, 
  Filter, 
  Grid3X3, 
  List, 
  SlidersHorizontal,
  Building2,
  Users,
  TrendingUp
} from "lucide-react";
import { useSearchProperties, useBuilders } from "@/hooks/use-properties";
import { SORT_OPTIONS } from "@/lib/constants";
import type { SearchFilters } from "@shared/schema";

export default function SearchPage() {
  const [location] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("credibility");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activeTab, setActiveTab] = useState("properties");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({});

  // Parse URL parameters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlFilters: SearchFilters = {};
    
    if (params.get('city')) urlFilters.city = params.get('city')!;
    if (params.get('locality')) urlFilters.locality = params.get('locality')!;
    if (params.get('budget_min')) {
      urlFilters.budget = { 
        min: parseInt(params.get('budget_min')!),
        max: params.get('budget_max') ? parseInt(params.get('budget_max')!) : undefined
      };
    }
    if (params.get('bhk')) {
      urlFilters.bhk = [parseInt(params.get('bhk')!)];
    }
    if (params.get('view')) {
      setActiveTab(params.get('view')!);
    }
    
    setFilters(urlFilters);
    setSearchQuery(params.get('q') || "");
  }, [location]);

  const { data: propertiesData, isLoading: propertiesLoading } = useSearchProperties(searchQuery, filters);
  const { data: buildersData, isLoading: buildersLoading } = useBuilders({ verified: true });

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (filters.city) params.set('city', filters.city);
    if (filters.locality) params.set('locality', filters.locality);
    if (filters.budget?.min) params.set('budget_min', filters.budget.min.toString());
    if (filters.budget?.max) params.set('budget_max', filters.budget.max.toString());
    if (filters.bhk?.length) params.set('bhk', filters.bhk[0].toString());
    
    window.history.pushState({}, '', `/search?${params.toString()}`);
  };

  const handleFiltersChange = (newFilters: SearchFilters) => {
    setFilters(newFilters);
  };

  const clearFilters = () => {
    setFilters({});
    setSearchQuery("");
    window.history.pushState({}, '', '/search');
  };

  const activeFiltersCount = Object.keys(filters).filter(key => {
    const value = filters[key as keyof SearchFilters];
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'object') return Object.keys(value || {}).length > 0;
    return !!value;
  }).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Search Header */}
      <section className="bg-white border-b py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            {/* Search Bar */}
            <div className="flex-1 flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  placeholder="Search by location, project name, or builder..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10"
                />
              </div>
              <Button onClick={handleSearch} className="bg-primary hover:bg-primary-dark">
                Search
              </Button>
            </div>

            {/* View Controls */}
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters
                {activeFiltersCount > 0 && (
                  <Badge className="ml-1 bg-primary text-white">{activeFiltersCount}</Badge>
                )}
              </Button>

              <div className="flex border rounded-lg overflow-hidden">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-none"
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Filters Sidebar */}
          {showFilters && (
            <div className="w-80 flex-shrink-0">
              <PropertyFilters
                filters={filters}
                onFiltersChange={handleFiltersChange}
                onClear={clearFilters}
              />
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1">
            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="properties" className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Properties
                  <Badge variant="secondary">{propertiesData?.total || 0}</Badge>
                </TabsTrigger>
                <TabsTrigger value="builders" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Builders
                  <Badge variant="secondary">{buildersData?.builders?.length || 0}</Badge>
                </TabsTrigger>
                <TabsTrigger value="market" className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Market
                </TabsTrigger>
              </TabsList>

              {/* Properties Tab */}
              <TabsContent value="properties" className="mt-6">
                {propertiesLoading ? (
                  <div className={viewMode === 'grid' 
                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    : "space-y-4"
                  }>
                    {[...Array(6)].map((_, i) => (
                      <Card key={i} className="animate-pulse">
                        <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                        <CardContent className="p-6 space-y-3">
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                          <div className="h-8 bg-gray-200 rounded w-full"></div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : propertiesData?.properties?.length ? (
                  <div className={viewMode === 'grid' 
                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    : "space-y-4"
                  }>
                    {propertiesData.properties.map((property) => (
                      <PropertyCard 
                        key={property.id} 
                        property={property} 
                        viewMode={viewMode}
                      />
                    ))}
                  </div>
                ) : (
                  <Card className="p-12 text-center">
                    <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Properties Found</h3>
                    <p className="text-gray-600 mb-6">
                      No properties match your current search criteria. Try adjusting your filters or search terms.
                    </p>
                    <Button onClick={clearFilters} variant="outline">
                      Clear All Filters
                    </Button>
                  </Card>
                )}
              </TabsContent>

              {/* Builders Tab */}
              <TabsContent value="builders" className="mt-6">
                {buildersLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                      <Card key={i} className="animate-pulse">
                        <CardContent className="p-6 text-center">
                          <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4"></div>
                          <div className="h-4 bg-gray-200 rounded mb-2"></div>
                          <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : buildersData?.builders?.length ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {buildersData.builders.map((builder) => (
                      <BuilderCard key={builder.id} builder={builder} />
                    ))}
                  </div>
                ) : (
                  <Card className="p-12 text-center">
                    <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Builders Found</h3>
                    <p className="text-gray-600">
                      No verified builders match your search criteria.
                    </p>
                  </Card>
                )}
              </TabsContent>

              {/* Market Tab */}
              <TabsContent value="market" className="mt-6">
                <Card className="p-12 text-center">
                  <TrendingUp className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Market Analysis</h3>
                  <p className="text-gray-600 mb-6">
                    Detailed market analysis and trends for your search area.
                  </p>
                  <Button className="bg-primary hover:bg-primary-dark">
                    View Market Intelligence
                  </Button>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
