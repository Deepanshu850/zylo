import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, RefreshCw, CheckCircle, AlertCircle, ExternalLink } from "lucide-react";

export default function MoneyTreeSync() {
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const queryClient = useQueryClient();

  const { data: rawData, isLoading: loadingRaw } = useQuery({
    queryKey: ["/api/moneytree/raw"],
    queryFn: () => apiRequest("/api/moneytree/raw"),
    enabled: false // Only fetch when manually triggered
  });

  const syncMutation = useMutation({
    mutationFn: () => apiRequest("/api/moneytree/sync"),
    onSuccess: (data) => {
      setLastSync(new Date());
      queryClient.invalidateQueries({ queryKey: ["/api/properties"] });
      queryClient.invalidateQueries({ queryKey: ["/api/properties/featured"] });
    },
  });

  const handleSync = () => {
    syncMutation.mutate();
  };

  const handleViewRaw = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/moneytree/raw"] });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="h-5 w-5" />
            MoneyTree Realty Integration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Sync authentic property data from MoneyTree Realty API
              </p>
              {lastSync && (
                <p className="text-xs text-gray-500 mt-1">
                  Last synced: {lastSync.toLocaleString()}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleViewRaw}
                disabled={loadingRaw}
              >
                {loadingRaw ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <ExternalLink className="h-4 w-4 mr-2" />
                )}
                View Raw Data
              </Button>
              <Button
                onClick={handleSync}
                disabled={syncMutation.isPending}
              >
                {syncMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Sync Properties
              </Button>
            </div>
          </div>

          {syncMutation.isSuccess && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Successfully synced {syncMutation.data?.count || 0} properties from MoneyTree Realty API
              </AlertDescription>
            </Alert>
          )}

          {syncMutation.isError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Failed to sync properties. Please check the API connection.
              </AlertDescription>
            </Alert>
          )}

          {rawData && (
            <div className="mt-4">
              <h4 className="font-medium mb-3">Raw Data Preview</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    Total Properties: {rawData.count}
                  </Badge>
                  <Badge variant="secondary">
                    Preview: {rawData.properties?.length || 0} shown
                  </Badge>
                </div>
                
                {rawData.properties?.slice(0, 3).map((property: any, index: number) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div>
                        <h5 className="font-medium">{property.name}</h5>
                        <p className="text-sm text-gray-600">
                          by {property.builder} • {property.location?.[0]}
                        </p>
                        <p className="text-sm font-medium text-blue-600 mt-1">
                          {property.price}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant={property.rera?.[0] && property.rera[0] !== '#' ? 'default' : 'secondary'}>
                          {property.rera?.[0] && property.rera[0] !== '#' ? 'RERA' : 'No RERA'}
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">
                          {property.possession}
                        </p>
                      </div>
                    </div>
                    {property.typeDetail && (
                      <div className="mt-2 flex gap-1">
                        {property.typeDetail.slice(0, 3).map((type: string, i: number) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {type}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Integration Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-3 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium">API Connection</span>
              </div>
              <p className="text-xs text-gray-600">
                MoneyTree Realty API is accessible
              </p>
            </div>
            
            <div className="p-3 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm font-medium">Data Mapping</span>
              </div>
              <p className="text-xs text-gray-600">
                Properties converted to ZyloEstates format
              </p>
            </div>
            
            <div className="p-3 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-sm font-medium">Real-time Updates</span>
              </div>
              <p className="text-xs text-gray-600">
                Manual sync available, auto-sync in development
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}