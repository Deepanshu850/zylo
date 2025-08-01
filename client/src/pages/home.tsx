import { useState } from "react";
import { Link } from "wouter";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import PropertyCard from "@/components/property/property-card";
import AIAssistant from "@/components/ai/ai-assistant";
import MarketTrends from "@/components/market/market-trends";
import BuilderCard from "@/components/builders/builder-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, TrendingUp, Shield, Clock, Building2, BarChart3, Calculator, Filter } from "lucide-react";
import { useFeaturedProperties, useBuilders, useTrendingLocalities } from "@/hooks/use-properties";
import { CITIES, BUDGET_RANGES, BHK_OPTIONS, PROPERTY_TYPES, TRENDING_LOCALITIES, formatCurrency } from "@/lib/constants";

export default function Home() {
  const [selectedCity, setSelectedCity] = useState("Bangalore");
  const [selectedBudget, setSelectedBudget] = useState("");
  const [selectedBHK, setSelectedBHK] = useState("");
  const [selectedType, setSelectedType] = useState("");

  const { data: featuredData, isLoading: featuredLoading } = useFeaturedProperties(6);
  const { data: buildersData, isLoading: buildersLoading } = useBuilders({ verified: true });
  const { data: trendingData } = useTrendingLocalities(selectedCity);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (selectedCity) params.set('city', selectedCity);
    if (selectedBudget) {
      const budget = BUDGET_RANGES.find(b => b.label === selectedBudget);
      if (budget) {
        params.set('budget_min', budget.min.toString());
        if (budget.max) params.set('budget_max', budget.max.toString());
      }
    }
    if (selectedBHK) params.set('bhk', selectedBHK);
    if (selectedType) params.set('type', selectedType);
    
    window.location.href = `/search?${params.toString()}`;
  };

  const trustMetrics = [
    { value: "15,000+", label: "Verified Properties", color: "text-primary" },
    { value: "500+", label: "Certified Builders", color: "text-success" },
    { value: "₹0", label: "Brokerage Fee", color: "text-warning" },
    { value: "24 hrs", label: "Avg Response Time", color: "text-purple-600" },
  ];

  const keyFeatures = [
    {
      icon: TrendingUp,
      title: "Best Time to Buy",
      description: "Current market conditions favor buyers with increased inventory and stable pricing.",
      action: "Read Full Report →",
      color: "text-success"
    },
    {
      icon: BarChart3,
      title: "Investment Hotspots",
      description: "Discover the top 5 areas with highest growth potential and ROI.",
      action: "View Analysis →",
      color: "text-warning"
    },
    {
      icon: Calculator,
      title: "ROI Calculator",
      description: "Calculate your investment returns with our AI-powered analysis tool.",
      action: "Calculate My ROI →",
      color: "text-primary"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="gradient-hero text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Direct से Builder से Property ख़रीदें
          </h1>
          <p className="text-xl mb-8 text-blue-100">
            Zero Brokerage • AI Verified Listings • Transparent Pricing • RERA Compliant
          </p>

          {/* Smart Search Bar */}
          <div className="bg-white rounded-2xl p-6 shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                <Select value={selectedCity} onValueChange={setSelectedCity}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CITIES.map((city) => (
                      <SelectItem key={city} value={city}>{city}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">Budget</label>
                <Select value={selectedBudget} onValueChange={setSelectedBudget}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select budget" />
                  </SelectTrigger>
                  <SelectContent>
                    {BUDGET_RANGES.map((range) => (
                      <SelectItem key={range.label} value={range.label}>{range.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">BHK</label>
                <Select value={selectedBHK} onValueChange={setSelectedBHK}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select BHK" />
                  </SelectTrigger>
                  <SelectContent>
                    {BHK_OPTIONS.map((bhk) => (
                      <SelectItem key={bhk.value} value={bhk.value.toString()}>{bhk.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">Property Type</label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROPERTY_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <Button 
              onClick={handleSearch}
              className="bg-primary hover:bg-primary-dark text-white font-semibold py-3 px-8 rounded-lg w-full md:w-auto"
            >
              <Search className="h-4 w-4 mr-2" />
              Search Properties
            </Button>
          </div>

          {/* Trending Localities */}
          <div className="mt-12">
            <h3 className="text-lg font-semibold mb-4 text-blue-100">Trending Localities</h3>
            <div className="flex flex-wrap justify-center gap-3">
              {(trendingData?.localities || TRENDING_LOCALITIES[selectedCity] || []).map((locality) => (
                <Link key={locality} href={`/search?city=${selectedCity}&locality=${locality}`}>
                  <Badge 
                    variant="secondary" 
                    className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full cursor-pointer hover:bg-white/30 transition-colors"
                  >
                    {locality}
                  </Badge>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {trustMetrics.map((metric, index) => (
              <div key={index}>
                <div className={`text-3xl font-bold ${metric.color}`}>{metric.value}</div>
                <div className="text-gray-600 mt-1">{metric.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Direct Builder Properties</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              AI-verified listings with transparent pricing and guaranteed authenticity
            </p>
          </div>

          {/* Filters Bar */}
          <div className="flex flex-wrap gap-4 mb-8 p-4 bg-white rounded-lg shadow-sm">
            <Button className="flex items-center space-x-2">
              <Filter className="h-4 w-4" />
              <span>All Filters</span>
            </Button>
            <Button variant="outline">Ready to Move</Button>
            <Button variant="outline">RERA Approved</Button>
            <Button variant="outline">Premium Builders</Button>
            <Button variant="outline">Verified Photos</Button>
            <div className="ml-auto flex items-center space-x-2">
              <span className="text-sm text-gray-600">Sort by:</span>
              <Select defaultValue="credibility">
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="credibility">Credibility Score</SelectItem>
                  <SelectItem value="price_asc">Price: Low to High</SelectItem>
                  <SelectItem value="price_desc">Price: High to Low</SelectItem>
                  <SelectItem value="newest">Newest First</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Property Grid */}
          {featuredLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl shadow-lg animate-pulse">
                  <div className="h-48 bg-gray-200 rounded-t-2xl"></div>
                  <div className="p-6 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-8 bg-gray-200 rounded w-full"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredData?.properties?.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link href="/search">
              <Button variant="outline" size="lg">
                Load More Properties
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* AI Comparison Tool */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">AI-Powered Property Comparison</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Compare properties side-by-side with AI insights and get personalized recommendations
            </p>
          </div>
          
          <div className="bg-gray-50 rounded-2xl p-8">
            <div className="text-center">
              <Building2 className="h-16 w-16 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Smart Property Comparison</h3>
              <p className="text-gray-600 mb-6">
                Select properties from search results to compare them with AI-powered insights
              </p>
              <Link href="/search">
                <Button className="bg-primary hover:bg-primary-dark text-white">
                  Start Comparing Properties
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Market Intelligence */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Market Intelligence</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Real-time market trends and AI-powered insights for informed decision making
            </p>
          </div>

          <MarketTrends />

          {/* Market Insights Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            {keyFeatures.map((feature, index) => (
              <Card key={index} className="hover-lift cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="bg-gray-100 p-3 rounded-lg">
                      <feature.icon className={`${feature.color} text-xl h-6 w-6`} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{feature.title}</h4>
                    </div>
                  </div>
                  <p className="text-gray-700 text-sm mb-4">{feature.description}</p>
                  <Button variant="ghost" className="text-primary hover:text-primary-dark font-medium text-sm p-0">
                    {feature.action}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Trusted Builders */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Verified Builders</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Connect directly with RERA-verified builders for transparent deals and faster closures
            </p>
          </div>

          {buildersLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {buildersData?.builders?.slice(0, 4).map((builder) => (
                <BuilderCard key={builder.id} builder={builder} />
              ))}
            </div>
          )}

          <div className="text-center mt-8">
            <Link href="/search?view=builders">
              <Button variant="outline" size="lg">
                View All Verified Builders
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* AI Assistant */}
      <section className="py-16 bg-gradient-to-br from-primary/5 to-purple-100/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">ZyloAI Assistant</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Get instant answers about properties, market trends, and investment advice
            </p>
          </div>
          
          <AIAssistant />
        </div>
      </section>

      <Footer />
    </div>
  );
}
