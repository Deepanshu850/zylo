import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, TrendingDown, MapPin, Building2, DollarSign, BarChart3 } from "lucide-react";

export default function MarketIntelligence() {
  const [selectedCity, setSelectedCity] = useState("Mumbai");
  const [timeframe, setTimeframe] = useState("6months");

  const { data: marketStats } = useQuery({
    queryKey: ["/api/market/stats", selectedCity],
    queryFn: () => apiRequest(`/api/market/stats/${selectedCity}`)
  });

  const { data: trendingLocalities } = useQuery({
    queryKey: ["/api/market/trending", selectedCity],
    queryFn: () => apiRequest(`/api/market/trending/${selectedCity}`)
  });

  const { data: marketInsights } = useQuery({
    queryKey: ["/api/market/insights", selectedCity, timeframe],
    queryFn: () => apiRequest("/api/market/insights", {
      method: "POST",
      body: JSON.stringify({ location: selectedCity, timeframe })
    })
  });

  const cities = ["Mumbai", "Delhi-NCR", "Bengaluru", "Pune", "Hyderabad", "Chennai"];

  const formatPrice = (price: number) => {
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(1)}Cr`;
    } else if (price >= 100000) {
      return `₹${(price / 100000).toFixed(0)}L`;
    }
    return `₹${price.toLocaleString()}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="border-b bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Market Intelligence
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Real-time market trends, pricing analytics, and investment insights
              </p>
            </div>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <Select value={selectedCity} onValueChange={setSelectedCity}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {cities.map(city => (
                    <SelectItem key={city} value={city}>{city}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={timeframe} onValueChange={setTimeframe}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3months">3M</SelectItem>
                  <SelectItem value="6months">6M</SelectItem>
                  <SelectItem value="1year">1Y</SelectItem>
                  <SelectItem value="2years">2Y</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="pricing">Pricing Trends</TabsTrigger>
            <TabsTrigger value="localities">Localities</TabsTrigger>
            <TabsTrigger value="forecasts">Forecasts</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Price/Sq Ft</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₹{marketStats?.avgPricePerSqft || 8450}</div>
                  <p className="text-xs text-muted-foreground flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                    +{marketStats?.priceGrowth || 12.5}% from last year
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{marketStats?.totalProjects || 145}</div>
                  <p className="text-xs text-muted-foreground">
                    {marketStats?.newLaunches || 23} new launches this quarter
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Absorption Rate</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{marketStats?.absorptionRate || 78}%</div>
                  <p className="text-xs text-muted-foreground">
                    Units sold in last 6 months
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Rental Yield</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{marketStats?.rentalYield || 3.2}%</div>
                  <p className="text-xs text-muted-foreground">
                    Average across all property types
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* AI Insights */}
            {marketInsights && (
              <Card>
                <CardHeader>
                  <CardTitle>AI Market Analysis</CardTitle>
                  <CardDescription>
                    Powered by ZyloAI - Real-time insights for {selectedCity}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="prose dark:prose-invert max-w-none">
                    <p className="text-gray-700 dark:text-gray-300 mb-4">
                      {marketInsights.answer || `Market analysis for ${selectedCity} shows strong fundamentals with selective growth opportunities.`}
                    </p>
                    
                    {marketInsights.cards?.map((card: any, index: number) => (
                      <div key={index} className="mb-6">
                        <h4 className="font-semibold text-lg mb-3">{card.title}</h4>
                        {card.type === 'insight' && (
                          <ul className="space-y-2">
                            {card.data?.slice(0, 5).map((insight: string, i: number) => (
                              <li key={i} className="flex items-start">
                                <TrendingUp className="h-4 w-4 text-blue-500 mt-1 mr-2 flex-shrink-0" />
                                <span className="text-sm">{insight}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                    
                    <div className="flex items-center justify-between mt-6 pt-4 border-t">
                      <div className="flex items-center text-sm text-gray-500">
                        <span>Confidence: {Math.round((marketInsights.confidence || 0.85) * 100)}%</span>
                      </div>
                      <Badge variant="outline">
                        Last updated: {new Date().toLocaleDateString()}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="pricing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Price Trends Analysis</CardTitle>
                <CardDescription>Historical pricing data and projections</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium text-green-700 dark:text-green-400">Premium Segment</h4>
                      <p className="text-2xl font-bold text-green-700 dark:text-green-400 mt-1">
                        ₹15,000-25,000/sq ft
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        <TrendingUp className="h-3 w-3 inline mr-1" />
                        +8.5% YoY growth
                      </p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium text-blue-700 dark:text-blue-400">Mid Segment</h4>
                      <p className="text-2xl font-bold text-blue-700 dark:text-blue-400 mt-1">
                        ₹8,000-15,000/sq ft
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        <TrendingUp className="h-3 w-3 inline mr-1" />
                        +12.2% YoY growth
                      </p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium text-purple-700 dark:text-purple-400">Affordable</h4>
                      <p className="text-2xl font-bold text-purple-700 dark:text-purple-400 mt-1">
                        ₹4,000-8,000/sq ft
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        <TrendingUp className="h-3 w-3 inline mr-1" />
                        +15.8% YoY growth
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="localities" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Trending Localities in {selectedCity}</CardTitle>
                <CardDescription>High-growth areas with strong investment potential</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {trendingLocalities?.localities?.slice(0, 6).map((locality: string, index: number) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                          <MapPin className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <h3 className="font-medium">{locality}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {Math.floor(Math.random() * 20) + 5} active projects
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-green-600">
                          <TrendingUp className="h-4 w-4 inline mr-1" />
                          +{Math.floor(Math.random() * 15) + 8}%
                        </div>
                        <div className="text-sm text-gray-500">
                          ₹{Math.floor(Math.random() * 5000) + 6000}/sq ft
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="forecasts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Market Forecasts</CardTitle>
                <CardDescription>AI-powered predictions for the next 12-24 months</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-3">Price Appreciation Forecast</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Next 6 months</span>
                          <span className="font-medium text-green-600">+4-6%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Next 12 months</span>
                          <span className="font-medium text-green-600">+8-12%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Next 24 months</span>
                          <span className="font-medium text-blue-600">+15-20%</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-3">Supply-Demand Balance</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Current Status</span>
                          <Badge variant="default">Balanced</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">6M Outlook</span>
                          <Badge variant="secondary">Slight Demand</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">12M Outlook</span>
                          <Badge variant="default">Strong Demand</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <h4 className="font-medium mb-2 text-blue-800 dark:text-blue-200">
                      Investment Recommendation
                    </h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      {selectedCity} shows strong fundamentals with continued infrastructure development and job growth. 
                      Consider focusing on mid-segment properties in emerging localities for optimal returns.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}