import { useState, useEffect } from "react";
import { Link } from "wouter";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Building2, 
  TrendingUp, 
  MapPin, 
  X, 
  Download, 
  BarChart3,
  CheckCircle,
  AlertCircle,
  Star,
  Home,
  DollarSign,
  Clock
} from "lucide-react";
import { useProperty } from "@/hooks/use-properties";
import { useAiChat } from "@/hooks/use-ai-chat";
import { formatCurrency, formatArea, getCredibilityBadge } from "@/lib/constants";

export default function ComparePage() {
  const [propertyIds, setPropertyIds] = useState<string[]>([]);
  const [userPreferences, setUserPreferences] = useState({
    purpose: "investment" as "investment" | "enduse",
    priorities: ["price", "location", "amenities"] as string[]
  });

  const { compareProperties, comparisonResult, isComparing } = useAiChat();

  // Load property IDs from URL params or localStorage
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ids = params.get('properties')?.split(',') || [];
    if (ids.length > 0) {
      setPropertyIds(ids);
    } else {
      // Try to load from localStorage (comparison cart)
      const savedIds = JSON.parse(localStorage.getItem('compareProperties') || '[]');
      setPropertyIds(savedIds.slice(0, 3)); // Max 3 properties
    }
  }, []);

  // Fetch property details
  const propertyQueries = propertyIds.map(id => useProperty(id));
  const properties = propertyQueries.map(query => query.data?.property).filter(Boolean);
  const isLoading = propertyQueries.some(query => query.isLoading);

  const removeProperty = (index: number) => {
    const newIds = propertyIds.filter((_, i) => i !== index);
    setPropertyIds(newIds);
    localStorage.setItem('compareProperties', JSON.stringify(newIds));
  };

  const handleCompare = () => {
    if (propertyIds.length >= 2) {
      compareProperties(propertyIds, userPreferences);
    }
  };

  const comparisonMetrics = [
    { 
      key: 'price', 
      label: 'Price Range', 
      icon: DollarSign,
      getValue: (property: any) => `${formatCurrency(property.priceBand.min)} - ${formatCurrency(property.priceBand.max)}`
    },
    { 
      key: 'pricePerSqft', 
      label: 'Price/sq.ft', 
      icon: BarChart3,
      getValue: (property: any) => {
        const avgPrice = (property.priceBand.min + property.priceBand.max) / 2;
        const avgArea = property.floorPlans?.length ? 
          property.floorPlans.reduce((sum: number, plan: any) => sum + plan.area, 0) / property.floorPlans.length : 1500;
        return `₹${Math.round(avgPrice / avgArea).toLocaleString()}`;
      }
    },
    { 
      key: 'location', 
      label: 'Location', 
      icon: MapPin,
      getValue: (property: any) => `${property.locality}, ${property.city}`
    },
    { 
      key: 'possession', 
      label: 'Possession', 
      icon: Clock,
      getValue: (property: any) => property.possessionDate ? 
        new Date(property.possessionDate).toLocaleDateString() : 'Ready'
    },
    { 
      key: 'credibility', 
      label: 'Credibility Score', 
      icon: CheckCircle,
      getValue: (property: any) => property.credibilityScore
    },
    { 
      key: 'amenities', 
      label: 'Amenities', 
      icon: Home,
      getValue: (property: any) => property.amenities?.length || 0
    },
  ];

  if (propertyIds.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="p-12 text-center">
            <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Properties to Compare</h3>
            <p className="text-gray-600 mb-6">
              Add properties to your comparison list from search results to start comparing.
            </p>
            <Link href="/search">
              <Button>Browse Properties</Button>
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Header Section */}
      <section className="bg-white border-b py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Property Comparison</h1>
              <p className="text-gray-600">
                Compare up to 3 properties side-by-side with AI-powered insights
              </p>
            </div>
            
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <Select 
                value={userPreferences.purpose} 
                onValueChange={(value: "investment" | "enduse") => 
                  setUserPreferences(prev => ({ ...prev, purpose: value }))
                }
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="investment">Investment</SelectItem>
                  <SelectItem value="enduse">End Use</SelectItem>
                </SelectContent>
              </Select>
              
              <Button 
                onClick={handleCompare}
                disabled={propertyIds.length < 2 || isComparing}
                className="bg-primary hover:bg-primary-dark"
              >
                {isComparing ? "Analyzing..." : "Get AI Analysis"}
              </Button>
              
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(propertyIds.length)].map((_, i) => (
                <div key={i} className="h-96 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Property Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property, index) => {
                const credibilityBadge = getCredibilityBadge(property.credibilityScore);
                
                return (
                  <Card key={property.id} className="relative">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2 z-10"
                      onClick={() => removeProperty(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    
                    <div className="h-48 rounded-t-lg overflow-hidden">
                      <img
                        src={property.media[0]?.url || "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00"}
                        alt={property.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {property.name}
                          </h3>
                          <p className="text-gray-600 text-sm flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            {property.locality}, {property.city}
                          </p>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <div className={`w-8 h-8 bg-${credibilityBadge.color} rounded-full flex items-center justify-center`}>
                            <span className="text-white text-xs font-bold">{property.credibilityScore}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Price Range</span>
                          <span className="font-medium">
                            {formatCurrency(property.priceBand.min)} - {formatCurrency(property.priceBand.max)}
                          </span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-gray-600">Status</span>
                          <Badge variant="secondary">
                            {property.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-gray-600">Amenities</span>
                          <span className="font-medium">{property.amenities?.length || 0}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
              
              {/* Add Property Placeholder */}
              {propertyIds.length < 3 && (
                <Card className="border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors">
                  <CardContent className="p-6 h-full flex flex-col items-center justify-center text-center">
                    <Building2 className="h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="font-medium text-gray-900 mb-2">Add Another Property</h3>
                    <p className="text-gray-600 text-sm mb-4">
                      Compare up to 3 properties for better insights
                    </p>
                    <Link href="/search">
                      <Button variant="outline">Browse Properties</Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Comparison Table */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Detailed Comparison</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Feature</th>
                        {properties.map((property) => (
                          <th key={property.id} className="text-left py-3 px-4 font-medium text-gray-900">
                            {property.name}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {comparisonMetrics.map((metric) => (
                        <tr key={metric.key} className="border-b">
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-2">
                              <metric.icon className="h-4 w-4 text-gray-600" />
                              <span className="font-medium text-gray-900">{metric.label}</span>
                            </div>
                          </td>
                          {properties.map((property) => (
                            <td key={property.id} className="py-3 px-4 text-gray-700">
                              {metric.getValue(property)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* AI Analysis Results */}
            {comparisonResult && (
              <Card className="bg-gradient-to-r from-primary/5 to-purple-100/30">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <div className="bg-primary rounded-full p-2">
                      <Star className="h-5 w-5 text-white" />
                    </div>
                    <span>AI Recommendation</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <p className="text-gray-700 leading-relaxed">
                      {comparisonResult.recommendation}
                    </p>
                    
                    {comparisonResult.winner && (
                      <div className="bg-white rounded-lg p-4 border border-success/20">
                        <div className="flex items-center space-x-2 mb-2">
                          <CheckCircle className="h-5 w-5 text-success" />
                          <span className="font-semibold text-success">Recommended Choice</span>
                        </div>
                        <p className="text-gray-700">
                          Based on your {userPreferences.purpose} goals, we recommend the property with ID: {comparisonResult.winner}
                        </p>
                      </div>
                    )}
                    
                    {comparisonResult.investment_analysis && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-success">Investment Pros</CardTitle>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <div className="space-y-2">
                              {comparisonResult.investment_analysis.pros?.map((pro: string, index: number) => (
                                <div key={index} className="flex items-start space-x-2">
                                  <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                                  <span className="text-sm text-gray-700">{pro}</span>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                        
                        <Card>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-warning">Considerations</CardTitle>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <div className="space-y-2">
                              {comparisonResult.investment_analysis.cons?.map((con: string, index: number) => (
                                <div key={index} className="flex items-start space-x-2">
                                  <AlertCircle className="h-4 w-4 text-warning mt-0.5 flex-shrink-0" />
                                  <span className="text-sm text-gray-700">{con}</span>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <div className="flex justify-center space-x-4">
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download Comparison Report
              </Button>
              <Link href="/search">
                <Button variant="outline">Add More Properties</Button>
              </Link>
              <Button className="bg-primary hover:bg-primary-dark">
                Schedule Site Visits
              </Button>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
