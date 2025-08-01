import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  MapPin, 
  Calendar,
  ArrowUp,
  ArrowDown,
  Minus,
  DollarSign,
  Building2,
  Users,
  Target
} from "lucide-react";
import { useMarketStats } from "@/hooks/use-properties";
import { formatCurrency } from "@/lib/constants";

interface MarketTrendsProps {
  city?: string;
  showControls?: boolean;
  compact?: boolean;
}

export default function MarketTrends({ 
  city = "Bangalore", 
  showControls = true, 
  compact = false 
}: MarketTrendsProps) {
  const [selectedPeriod, setSelectedPeriod] = useState("1Y");
  const [selectedCity, setSelectedCity] = useState(city);
  
  const { data: marketStatsData, isLoading } = useMarketStats(selectedCity, "city");

  // Mock trend data - in production this would come from the API
  const trendData = [
    { period: "Q1 2024", price: 6200, growth: 8.5, volume: 1250 },
    { period: "Q2 2024", price: 6450, growth: 4.0, volume: 1380 },
    { period: "Q3 2024", price: 6650, growth: 3.1, volume: 1420 },
    { period: "Q4 2024", price: 6850, growth: 3.0, volume: 1520 },
  ];

  const heatMapData = [
    { 
      area: "Whitefield", 
      growth: 15.2, 
      price: 8500, 
      demand: "Very High",
      color: "from-success/20 to-success/40" 
    },
    { 
      area: "Electronic City", 
      growth: 8.7, 
      price: 6200, 
      demand: "High",
      color: "from-warning/20 to-warning/40" 
    },
    { 
      area: "Koramangala", 
      growth: 6.3, 
      price: 12500, 
      demand: "High",
      color: "from-primary/20 to-primary/40" 
    },
    { 
      area: "Sarjapur", 
      growth: -2.1, 
      price: 5800, 
      demand: "Low",
      color: "from-destructive/20 to-destructive/40" 
    },
  ];

  const keyMetrics = [
    {
      title: "Avg Price/sq.ft",
      value: "₹6,850",
      change: "+12.5%",
      trend: "up",
      icon: DollarSign,
      color: "text-primary"
    },
    {
      title: "QoQ Growth",
      value: "3.2%",
      change: "+0.8%",
      trend: "up",
      icon: TrendingUp,
      color: "text-success"
    },
    {
      title: "New Launches",
      value: "25",
      change: "-5",
      trend: "down",
      icon: Building2,
      color: "text-warning"
    },
    {
      title: "Absorption Rate",
      value: "15.8%",
      change: "-2.1%",
      trend: "down",
      icon: Target,
      color: "text-destructive"
    }
  ];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up": return <ArrowUp className="h-4 w-4 text-success" />;
      case "down": return <ArrowDown className="h-4 w-4 text-destructive" />;
      default: return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const cities = ["Bangalore", "Mumbai", "Delhi NCR", "Chennai", "Hyderabad", "Pune"];
  const periods = ["3M", "6M", "1Y", "2Y", "5Y"];

  if (compact) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Price Trend Chart */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-lg">
              <TrendingUp className="h-5 w-5 text-primary" />
              <span>Price Trends - {selectedCity}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48 bg-gradient-to-br from-primary/10 to-purple-100/30 rounded-lg flex items-center justify-center mb-4">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 text-primary mx-auto mb-2" />
                <p className="text-gray-600 text-sm">Price trend visualization</p>
                <p className="text-xs text-gray-500 mt-1">
                  {selectedCity}: +12.5% YoY Growth
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <div className="text-lg font-bold text-success">+12.5%</div>
                <div className="text-xs text-gray-600">YoY Growth</div>
              </div>
              <div>
                <div className="text-lg font-bold text-primary">₹6,850</div>
                <div className="text-xs text-gray-600">Avg Price/sq.ft</div>
              </div>
              <div>
                <div className="text-lg font-bold text-warning">8.2%</div>
                <div className="text-xs text-gray-600">Appreciation</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Heat Map */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-lg">
              <MapPin className="h-5 w-5 text-success" />
              <span>Locality Heat Map</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {heatMapData.map((area) => (
                <div 
                  key={area.area}
                  className={`bg-gradient-to-r ${area.color} rounded-lg p-3 text-center`}
                >
                  <div className="font-semibold text-gray-900 text-sm">{area.area}</div>
                  <div className="text-xs text-gray-600">{area.demand}</div>
                  <div className={`text-sm font-bold mt-1 ${
                    area.growth > 0 ? 'text-success' : 'text-destructive'
                  }`}>
                    {area.growth > 0 ? '+' : ''}{area.growth}%
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      {showControls && (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <Select value={selectedCity} onValueChange={setSelectedCity}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {cities.map((city) => (
                  <SelectItem key={city} value={city}>{city}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <div className="flex space-x-2">
              {periods.map((period) => (
                <Button
                  key={period}
                  variant={selectedPeriod === period ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedPeriod(period)}
                  className="min-w-12"
                >
                  {period}
                </Button>
              ))}
            </div>
          </div>
          
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Export Data
          </Button>
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {keyMetrics.map((metric, index) => (
          <Card key={index} className="hover-lift">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="bg-gray-100 p-2 rounded-lg">
                    <metric.icon className={`h-4 w-4 ${metric.color}`} />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-600">{metric.title}</p>
                    <p className="text-lg font-bold text-gray-900">{metric.value}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-1">
                    {getTrendIcon(metric.trend)}
                    <span className={`text-xs font-medium ${
                      metric.trend === 'up' ? 'text-success' : 
                      metric.trend === 'down' ? 'text-destructive' : 'text-gray-500'
                    }`}>
                      {metric.change}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">vs prev quarter</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Price Trends Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Price Trends - {selectedCity}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gradient-to-br from-primary/10 to-purple-100/30 rounded-lg flex items-center justify-center mb-6">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 text-primary mx-auto mb-4" />
                <p className="text-gray-600">Interactive price trend chart</p>
                <p className="text-sm text-gray-500 mt-2">
                  {selectedCity}: +12.5% YoY Growth
                </p>
              </div>
            </div>
            
            {/* Trend Data Points */}
            <div className="grid grid-cols-4 gap-2 text-center">
              {trendData.map((point, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-2">
                  <div className="text-xs text-gray-600">{point.period}</div>
                  <div className="text-sm font-semibold">₹{point.price.toLocaleString()}</div>
                  <div className={`text-xs ${point.growth > 0 ? 'text-success' : 'text-destructive'}`}>
                    {point.growth > 0 ? '+' : ''}{point.growth}%
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Market Heat Map */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="h-5 w-5" />
              <span>Locality Heat Map</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {heatMapData.map((area, index) => (
                <div 
                  key={index}
                  className={`bg-gradient-to-r ${area.color} rounded-lg p-4 flex items-center justify-between`}
                >
                  <div>
                    <div className="font-semibold text-gray-900">{area.area}</div>
                    <div className="text-sm text-gray-600">{area.demand} Demand</div>
                    <div className="text-xs text-gray-500">
                      Avg: {formatCurrency(area.price)}/sq.ft
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${
                      area.growth > 0 ? 'text-success' : 'text-destructive'
                    }`}>
                      {area.growth > 0 ? '+' : ''}{area.growth}%
                    </div>
                    <div className="text-xs text-gray-600">YoY Growth</div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              <Button variant="outline" size="sm" className="w-full">
                <MapPin className="h-4 w-4 mr-2" />
                View Interactive Map
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Market Summary */}
      <Card className="bg-gradient-to-r from-primary/5 to-purple-100/30">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Market Summary - {selectedCity}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                <TrendingUp className="h-4 w-4 text-success mr-1" />
                Growth Drivers
              </h4>
              <ul className="space-y-1 text-sm text-gray-700">
                <li>• IT sector expansion in peripheral areas</li>
                <li>• Infrastructure development projects</li>
                <li>• Government policy support</li>
                <li>• Increasing demand from NRIs</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                <Users className="h-4 w-4 text-primary mr-1" />
                Buyer Preferences
              </h4>
              <ul className="space-y-1 text-sm text-gray-700">
                <li>• 2-3 BHK apartments (65%)</li>
                <li>• Ready-to-move properties</li>
                <li>• RERA-approved projects</li>
                <li>• Good connectivity to IT hubs</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                <Target className="h-4 w-4 text-warning mr-1" />
                Investment Outlook
              </h4>
              <ul className="space-y-1 text-sm text-gray-700">
                <li>• Positive medium-term outlook</li>
                <li>• 8-12% annual appreciation expected</li>
                <li>• Rental yields: 2.5-4%</li>
                <li>• Best entry time: Q4 2024</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
