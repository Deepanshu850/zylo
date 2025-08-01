import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Calculator, 
  FileSearch, 
  TrendingUp, 
  Scale, 
  Camera, 
  Building, 
  MapPin,
  FileText,
  DollarSign,
  Shield,
  Zap
} from "lucide-react";

interface AIToolsProps {
  selectedProperties?: string[];
  onToolResult?: (result: any) => void;
}

export function AITools({ selectedProperties = [], onToolResult }: AIToolsProps) {
  const [activeDialog, setActiveDialog] = useState<string | null>(null);
  const [avmData, setAvmData] = useState<any>(null);
  const [compareData, setCompareData] = useState<any>(null);
  const [marketData, setMarketData] = useState<any>(null);

  // AVM Tool
  const avmMutation = useMutation({
    mutationFn: (data: { projectId: string; unitId?: string }) =>
      apiRequest("/api/ai/avm", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: (data) => {
      setAvmData(data);
      onToolResult?.(data);
    }
  });

  // Property Comparison Tool
  const compareMutation = useMutation({
    mutationFn: (data: { propertyIds: string[]; userPreferences?: any }) =>
      apiRequest("/api/ai/compare", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: (data) => {
      setCompareData(data);
      onToolResult?.(data);
    }
  });

  // Market Intelligence Tool
  const marketMutation = useMutation({
    mutationFn: (data: { location: string; timeframe?: string }) =>
      apiRequest("/api/market/insights", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: (data) => {
      setMarketData(data);
      onToolResult?.(data);
    }
  });

  // Legal Document Analysis Tool
  const legalMutation = useMutation({
    mutationFn: (data: { fileUrl: string; projectId: string }) =>
      apiRequest("/api/ai/legal-analysis", { method: "POST", body: JSON.stringify(data) }),
  });

  // ROI Scenarios Tool
  const roiMutation = useMutation({
    mutationFn: (data: { projectId: string; investmentAmount: number; timeHorizon: number }) =>
      apiRequest("/api/ai/roi-scenarios", { method: "POST", body: JSON.stringify(data) }),
  });

  // Virtual Tour Generator
  const tourMutation = useMutation({
    mutationFn: (data: { projectId: string; unitId?: string }) =>
      apiRequest("/api/ai/virtual-tour", { method: "POST", body: JSON.stringify(data) }),
  });

  // Virtual Staging Tool
  const stagingMutation = useMutation({
    mutationFn: (data: { imageUrl: string; style: string }) =>
      apiRequest("/api/ai/virtual-staging", { method: "POST", body: JSON.stringify(data) }),
  });

  const tools = [
    {
      id: "avm",
      title: "AVM Valuation",
      description: "AI-powered property valuation with confidence metrics",
      icon: Calculator,
      color: "bg-blue-500",
      requiresProperties: true
    },
    {
      id: "compare",
      title: "Property Compare",
      description: "Intelligent comparison with user priority ranking",
      icon: Scale,
      color: "bg-green-500",
      requiresProperties: true,
      minProperties: 2
    },
    {
      id: "market",
      title: "Market Intelligence",
      description: "Real-time market trends and forecasts",
      icon: TrendingUp,
      color: "bg-purple-500",
      requiresProperties: false
    },
    {
      id: "legal",
      title: "Legal Analysis",
      description: "Document OCR and risk assessment",
      icon: FileSearch,
      color: "bg-red-500",
      requiresProperties: false
    },
    {
      id: "roi",
      title: "ROI Scenarios",
      description: "Investment return projections with scenarios",
      icon: DollarSign,
      color: "bg-yellow-500",
      requiresProperties: true
    },
    {
      id: "tour",
      title: "Virtual Tour",
      description: "3D/VR tour generation and optimization",
      icon: Camera,
      color: "bg-indigo-500",
      requiresProperties: true
    },
    {
      id: "staging",
      title: "Virtual Staging",
      description: "AI-powered interior staging and visualization",
      icon: Building,
      color: "bg-pink-500",
      requiresProperties: false
    },
    {
      id: "rera",
      title: "RERA Lookup",
      description: "Real-time RERA compliance verification",
      icon: Shield,
      color: "bg-orange-500",
      requiresProperties: false
    }
  ];

  const canUseTool = (tool: any) => {
    if (!tool.requiresProperties) return true;
    if (tool.minProperties) return selectedProperties.length >= tool.minProperties;
    return selectedProperties.length > 0;
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          ZyloAI Tools
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Powered by AI to provide transparent, unbiased real estate insights
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {tools.map((tool) => {
          const Icon = tool.icon;
          const canUse = canUseTool(tool);
          
          return (
            <Dialog 
              key={tool.id} 
              open={activeDialog === tool.id} 
              onOpenChange={(open) => setActiveDialog(open ? tool.id : null)}
            >
              <DialogTrigger asChild>
                <Card className={`cursor-pointer transition-all hover:shadow-lg ${!canUse ? 'opacity-50' : ''}`}>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3">
                      <div className={`w-12 h-12 ${tool.color} rounded-lg flex items-center justify-center`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm">{tool.title}</h3>
                        <p className="text-xs text-gray-500 mt-1">{tool.description}</p>
                        {!canUse && (
                          <Badge variant="outline" className="mt-2 text-xs">
                            {tool.minProperties ? `Needs ${tool.minProperties}+ properties` : 'Select property'}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </DialogTrigger>

              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center space-x-2">
                    <Icon className="h-5 w-5" />
                    <span>{tool.title}</span>
                  </DialogTitle>
                </DialogHeader>

                {tool.id === "avm" && (
                  <AVMTool 
                    selectedProperties={selectedProperties}
                    onRun={avmMutation.mutate}
                    isLoading={avmMutation.isPending}
                    result={avmData}
                  />
                )}

                {tool.id === "compare" && (
                  <CompareTool 
                    selectedProperties={selectedProperties}
                    onRun={compareMutation.mutate}
                    isLoading={compareMutation.isPending}
                    result={compareData}
                  />
                )}

                {tool.id === "market" && (
                  <MarketTool 
                    onRun={marketMutation.mutate}
                    isLoading={marketMutation.isPending}
                    result={marketData}
                  />
                )}

                {tool.id === "legal" && (
                  <LegalTool 
                    onRun={legalMutation.mutate}
                    isLoading={legalMutation.isPending}
                    result={legalMutation.data}
                  />
                )}

                {tool.id === "roi" && (
                  <ROITool 
                    selectedProperties={selectedProperties}
                    onRun={roiMutation.mutate}
                    isLoading={roiMutation.isPending}
                    result={roiMutation.data}
                  />
                )}

                {tool.id === "tour" && (
                  <VirtualTourTool 
                    selectedProperties={selectedProperties}
                    onRun={tourMutation.mutate}
                    isLoading={tourMutation.isPending}
                    result={tourMutation.data}
                  />
                )}

                {tool.id === "staging" && (
                  <VirtualStagingTool 
                    onRun={stagingMutation.mutate}
                    isLoading={stagingMutation.isPending}
                    result={stagingMutation.data}
                  />
                )}

                {tool.id === "rera" && (
                  <RERALookupTool />
                )}
              </DialogContent>
            </Dialog>
          );
        })}
      </div>
    </div>
  );
}

// Individual Tool Components
function AVMTool({ selectedProperties, onRun, isLoading, result }: any) {
  return (
    <div className="space-y-4">
      <p className="text-gray-600">
        Get AI-powered property valuation with comparable analysis and confidence metrics.
      </p>
      
      {selectedProperties.length > 0 && (
        <div>
          <h4 className="font-medium mb-2">Selected Property:</h4>
          <Badge variant="secondary">{selectedProperties[0]}</Badge>
        </div>
      )}

      <Button 
        onClick={() => onRun({ projectId: selectedProperties[0] })}
        disabled={isLoading || selectedProperties.length === 0}
        className="w-full"
      >
        {isLoading ? "Generating AVM..." : "Run AVM Analysis"}
      </Button>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>AVM Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center p-4 border rounded-lg">
                <h4 className="font-medium text-green-600">Fair Value</h4>
                <p className="text-2xl font-bold">₹{result.fairValue}</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <h4 className="font-medium text-blue-600">Range</h4>
                <p className="text-lg">₹{result.low} - ₹{result.high}</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <h4 className="font-medium text-purple-600">Confidence</h4>
                <div className="flex items-center space-x-2">
                  <Progress value={result.confidence * 100} className="flex-1" />
                  <span className="text-sm">{Math.round(result.confidence * 100)}%</span>
                </div>
              </div>
            </div>
            {result.rationale && (
              <div>
                <h4 className="font-medium mb-2">Analysis Rationale:</h4>
                <p className="text-sm text-gray-600">{result.rationale}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function CompareTool({ selectedProperties, onRun, isLoading, result }: any) {
  return (
    <div className="space-y-4">
      <p className="text-gray-600">
        Compare selected properties with AI-powered ranking based on your priorities.
      </p>
      
      <div>
        <h4 className="font-medium mb-2">Selected Properties ({selectedProperties.length}):</h4>
        <div className="flex flex-wrap gap-2">
          {selectedProperties.map((id: string) => (
            <Badge key={id} variant="secondary">{id}</Badge>
          ))}
        </div>
      </div>

      <Button 
        onClick={() => onRun({ propertyIds: selectedProperties })}
        disabled={isLoading || selectedProperties.length < 2}
        className="w-full"
      >
        {isLoading ? "Comparing Properties..." : "Compare Properties"}
      </Button>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Comparison Results</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">{result.answer}</p>
            {result.cards?.map((card: any, index: number) => (
              <div key={index} className="mt-4">
                <h4 className="font-medium mb-2">{card.title}</h4>
                {card.type === 'table' && (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-300">
                      <thead>
                        <tr>
                          <th className="border border-gray-300 p-2">Property</th>
                          <th className="border border-gray-300 p-2">Score</th>
                          <th className="border border-gray-300 p-2">Pros</th>
                          <th className="border border-gray-300 p-2">Cons</th>
                        </tr>
                      </thead>
                      <tbody>
                        {card.data?.map((row: any, i: number) => (
                          <tr key={i}>
                            <td className="border border-gray-300 p-2">{row.property}</td>
                            <td className="border border-gray-300 p-2">{row.score}</td>
                            <td className="border border-gray-300 p-2">{row.pros}</td>
                            <td className="border border-gray-300 p-2">{row.cons}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function MarketTool({ onRun, isLoading, result }: any) {
  const [location, setLocation] = useState("");
  
  return (
    <div className="space-y-4">
      <p className="text-gray-600">
        Get comprehensive market intelligence and investment insights for any location.
      </p>
      
      <div>
        <label className="block text-sm font-medium mb-2">Location</label>
        <Input 
          placeholder="Enter city or locality"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
      </div>

      <Button 
        onClick={() => onRun({ location })}
        disabled={isLoading || !location}
        className="w-full"
      >
        {isLoading ? "Analyzing Market..." : "Get Market Intelligence"}
      </Button>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Market Intelligence</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">{result.answer}</p>
            <div className="space-y-4">
              {result.cards?.map((card: any, index: number) => (
                <div key={index}>
                  <h4 className="font-medium mb-2">{card.title}</h4>
                  {card.type === 'insight' && (
                    <ul className="list-disc list-inside space-y-1">
                      {card.data?.map((insight: string, i: number) => (
                        <li key={i} className="text-sm text-gray-600">{insight}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function LegalTool({ onRun, isLoading, result }: any) {
  const [fileUrl, setFileUrl] = useState("");
  const [projectId, setProjectId] = useState("");
  
  return (
    <div className="space-y-4">
      <p className="text-gray-600">
        Upload legal documents for AI-powered OCR analysis and risk assessment.
      </p>
      
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium mb-2">Document URL</label>
          <Input 
            placeholder="https://example.com/document.pdf"
            value={fileUrl}
            onChange={(e) => setFileUrl(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Project ID</label>
          <Input 
            placeholder="Project ID"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
          />
        </div>
      </div>

      <Button 
        onClick={() => onRun({ fileUrl, projectId })}
        disabled={isLoading || !fileUrl || !projectId}
        className="w-full"
      >
        {isLoading ? "Analyzing Document..." : "Analyze Legal Document"}
      </Button>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Legal Analysis Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Summary:</h4>
              <p className="text-sm text-gray-600">{result.summary}</p>
            </div>
            
            {result.riskFlags?.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Risk Flags:</h4>
                <div className="space-y-2">
                  {result.riskFlags.map((flag: string, index: number) => (
                    <Badge key={index} variant="destructive" className="mr-2 mb-2">
                      {flag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h4 className="font-medium mb-2">Compliance Status:</h4>
              <Badge variant={
                result.compliance === 'compliant' ? 'default' :
                result.compliance === 'warning' ? 'secondary' : 'destructive'
              }>
                {result.compliance}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ROITool({ selectedProperties, onRun, isLoading, result }: any) {
  const [investmentAmount, setInvestmentAmount] = useState("");
  const [timeHorizon, setTimeHorizon] = useState("");
  
  return (
    <div className="space-y-4">
      <p className="text-gray-600">
        Calculate ROI scenarios with bull, base, and bear market projections.
      </p>
      
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium mb-2">Investment Amount (₹)</label>
          <Input 
            type="number"
            placeholder="5000000"
            value={investmentAmount}
            onChange={(e) => setInvestmentAmount(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Time Horizon (years)</label>
          <Input 
            type="number"
            placeholder="5"
            value={timeHorizon}
            onChange={(e) => setTimeHorizon(e.target.value)}
          />
        </div>
      </div>

      <Button 
        onClick={() => onRun({ 
          projectId: selectedProperties[0], 
          investmentAmount: parseInt(investmentAmount),
          timeHorizon: parseInt(timeHorizon)
        })}
        disabled={isLoading || !investmentAmount || !timeHorizon || selectedProperties.length === 0}
        className="w-full"
      >
        {isLoading ? "Calculating ROI..." : "Calculate ROI Scenarios"}
      </Button>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>ROI Projections</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center p-4 border rounded-lg">
                <h4 className="font-medium text-green-600">Bull Market</h4>
                <p className="text-xl font-bold">+{result.scenarios?.bull}%</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <h4 className="font-medium text-blue-600">Base Case</h4>
                <p className="text-xl font-bold">+{result.scenarios?.base}%</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <h4 className="font-medium text-red-600">Bear Market</h4>
                <p className="text-xl font-bold">{result.scenarios?.bear}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function VirtualTourTool({ selectedProperties, onRun, isLoading, result }: any) {
  return (
    <div className="space-y-4">
      <p className="text-gray-600">
        Generate immersive 3D/VR tours optimized for &lt;2s load time on 4G.
      </p>
      
      <Button 
        onClick={() => onRun({ projectId: selectedProperties[0] })}
        disabled={isLoading || selectedProperties.length === 0}
        className="w-full"
      >
        {isLoading ? "Generating Tour..." : "Generate Virtual Tour"}
      </Button>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Virtual Tour Generated</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center mb-4">
              <p className="text-gray-500">3D Tour Preview</p>
            </div>
            <div className="flex space-x-2">
              <Button size="sm">
                <Zap className="h-4 w-4 mr-2" />
                View Tour
              </Button>
              <Button size="sm" variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Share Link
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function VirtualStagingTool({ onRun, isLoading, result }: any) {
  const [imageUrl, setImageUrl] = useState("");
  const [style, setStyle] = useState("modern");
  
  return (
    <div className="space-y-4">
      <p className="text-gray-600">
        Transform empty spaces with AI-powered virtual furniture and staging.
      </p>
      
      <div>
        <label className="block text-sm font-medium mb-2">Image URL</label>
        <Input 
          placeholder="https://example.com/room.jpg"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Staging Style</label>
        <select 
          className="w-full p-2 border rounded-md"
          value={style}
          onChange={(e) => setStyle(e.target.value)}
        >
          <option value="modern">Modern</option>
          <option value="traditional">Traditional</option>
          <option value="minimalist">Minimalist</option>
          <option value="luxury">Luxury</option>
        </select>
      </div>

      <Button 
        onClick={() => onRun({ imageUrl, style })}
        disabled={isLoading || !imageUrl}
        className="w-full"
      >
        {isLoading ? "Staging Image..." : "Generate Virtual Staging"}
      </Button>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Staged Result</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="font-medium mb-2">Original</h4>
                <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg"></div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Staged</h4>
                <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function RERALookupTool() {
  const [reraId, setReraId] = useState("");
  const [lookupResult, setLookupResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLookup = async () => {
    setIsLoading(true);
    try {
      const result = await apiRequest(`/api/rera/lookup/${reraId}`);
      setLookupResult(result);
    } catch (error) {
      console.error('RERA lookup failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-gray-600">
        Verify RERA registration status and get real-time compliance information.
      </p>
      
      <div>
        <label className="block text-sm font-medium mb-2">RERA ID</label>
        <Input 
          placeholder="UP-RERA-2023-HP-001"
          value={reraId}
          onChange={(e) => setReraId(e.target.value)}
        />
      </div>

      <Button 
        onClick={handleLookup}
        disabled={isLoading || !reraId}
        className="w-full"
      >
        {isLoading ? "Looking up..." : "Verify RERA Status"}
      </Button>

      {lookupResult && (
        <Card>
          <CardHeader>
            <CardTitle>RERA Verification Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="font-medium">Project ID:</h4>
                <p className="text-sm text-gray-600">{lookupResult.projectId}</p>
              </div>
              <div>
                <h4 className="font-medium">Status:</h4>
                <Badge variant={lookupResult.status === 'registered' ? 'default' : 'destructive'}>
                  {lookupResult.status}
                </Badge>
              </div>
              <div>
                <h4 className="font-medium">Builder:</h4>
                <p className="text-sm text-gray-600">{lookupResult.builderName}</p>
              </div>
              <div>
                <h4 className="font-medium">Approval Date:</h4>
                <p className="text-sm text-gray-600">{lookupResult.approvalDate}</p>
              </div>
            </div>
            
            {lookupResult.violations?.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Violations:</h4>
                <div className="space-y-2">
                  {lookupResult.violations.map((violation: string, index: number) => (
                    <Badge key={index} variant="destructive" className="mr-2 mb-2">
                      {violation}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}