import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Building2, Users, FileText, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";

export default function AdminDashboard() {
  const [selectedTab, setSelectedTab] = useState("overview");

  // Fetch admin stats
  const { data: stats } = useQuery({
    queryKey: ["/api/admin/stats"],
    queryFn: () => apiRequest("/api/admin/stats")
  });

  const { data: builders } = useQuery({
    queryKey: ["/api/builders"],
    queryFn: () => apiRequest("/api/builders")
  });

  const { data: projects } = useQuery({
    queryKey: ["/api/projects"],
    queryFn: () => apiRequest("/api/projects")
  });

  const { data: leads } = useQuery({
    queryKey: ["/api/admin/leads"],
    queryFn: () => apiRequest("/api/admin/leads")
  });

  const verifyBuilder = useMutation({
    mutationFn: (builderId: string) => 
      apiRequest(`/api/admin/builders/${builderId}/verify`, { method: "POST" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/builders"] });
    }
  });

  const approveProject = useMutation({
    mutationFn: (projectId: string) =>
      apiRequest(`/api/admin/projects/${projectId}/approve`, { method: "POST" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
    }
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="border-b bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            ZyloEstates Admin Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Platform management and oversight
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="builders">Builders</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="leads">Leads</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Builders</CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalBuilders || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    +{stats?.newBuildersThisMonth || 0} this month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.activeProjects || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    +{stats?.newProjectsThisMonth || 0} this month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalLeads || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    +{stats?.newLeadsThisWeek || 0} this week
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₹{stats?.revenue || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    +{stats?.revenueGrowth || 0}% from last month
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Platform Health</CardTitle>
                <CardDescription>System status and alerts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>AI Assistant Uptime</span>
                  <Badge variant="default">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    99.9%
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>RERA Data Sync</span>
                  <Badge variant="default">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Builder Feed Status</span>
                  <Badge variant="secondary">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    2 Delayed
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="builders" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Builder Management</CardTitle>
                <CardDescription>Verify and manage builder accounts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {builders?.map((builder: any) => (
                    <div key={builder.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                          <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <h3 className="font-medium">{builder.name}</h3>
                          <p className="text-sm text-gray-500">
                            {builder.projectCount} projects • Rating: {builder.rating}/5
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {builder.verified ? (
                          <Badge variant="default">Verified</Badge>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => verifyBuilder.mutate(builder.id)}
                            disabled={verifyBuilder.isPending}
                          >
                            Verify
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="projects" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Approval</CardTitle>
                <CardDescription>Review and approve new project listings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {projects?.filter((p: any) => !p.approved)?.map((project: any) => (
                    <div key={project.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                          <Building2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <h3 className="font-medium">{project.name}</h3>
                          <p className="text-sm text-gray-500">
                            {project.locality}, {project.city} • Credibility: {project.credibilityScore}%
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={project.reraId ? "default" : "secondary"}>
                          {project.reraId ? "RERA Approved" : "Pending RERA"}
                        </Badge>
                        <Button
                          size="sm"
                          onClick={() => approveProject.mutate(project.id)}
                          disabled={approveProject.isPending}
                        >
                          Approve
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="leads" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Lead Management</CardTitle>
                <CardDescription>Monitor and manage customer leads</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {leads?.map((lead: any) => (
                    <div key={lead.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                          <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <h3 className="font-medium">{lead.contactInfo?.name || 'Anonymous'}</h3>
                          <p className="text-sm text-gray-500">
                            {lead.stage} • {lead.channel} • Budget: ₹{lead.preferences?.budget}L
                          </p>
                        </div>
                      </div>
                      <Badge variant={
                        lead.stage === 'booked' ? 'default' :
                        lead.stage === 'negotiation' ? 'secondary' : 'outline'
                      }>
                        {lead.stage}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="compliance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Compliance Monitor</CardTitle>
                <CardDescription>RERA compliance and regulatory oversight</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="p-4 border rounded-lg">
                      <h3 className="font-medium text-green-700 dark:text-green-400">Compliant Projects</h3>
                      <p className="text-2xl font-bold text-green-700 dark:text-green-400">
                        {stats?.compliantProjects || 0}
                      </p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h3 className="font-medium text-yellow-700 dark:text-yellow-400">Under Review</h3>
                      <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">
                        {stats?.pendingReview || 0}
                      </p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h3 className="font-medium text-red-700 dark:text-red-400">Non-Compliant</h3>
                      <p className="text-2xl font-bold text-red-700 dark:text-red-400">
                        {stats?.nonCompliant || 0}
                      </p>
                    </div>
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