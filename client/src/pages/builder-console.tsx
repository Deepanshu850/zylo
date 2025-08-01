import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Building2, Home, Users, TrendingUp, Plus, Eye, MessageSquare, FileCheck } from "lucide-react";

const projectFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  city: z.string().min(1, "City is required"),
  locality: z.string().min(1, "Locality is required"),
  status: z.enum(["launched", "under_construction", "ready"]),
  description: z.string().optional(),
  priceBand: z.object({
    min: z.number().min(0),
    max: z.number().min(0),
    currency: z.string().default("INR")
  }),
  amenities: z.array(z.string()).default([]),
  highlights: z.array(z.string()).default([])
});

export default function BuilderConsole() {
  const [selectedTab, setSelectedTab] = useState("dashboard");
  const [isAddProjectOpen, setIsAddProjectOpen] = useState(false);

  // Mock builder ID - in production this would come from auth
  const builderId = "builder_123";

  const { data: builderStats } = useQuery({
    queryKey: ["/api/builder/stats", builderId],
    queryFn: () => apiRequest(`/api/builder/stats/${builderId}`)
  });

  const { data: projects } = useQuery({
    queryKey: ["/api/builder/projects", builderId],
    queryFn: () => apiRequest(`/api/builder/projects/${builderId}`)
  });

  const { data: leads } = useQuery({
    queryKey: ["/api/builder/leads", builderId],
    queryFn: () => apiRequest(`/api/builder/leads/${builderId}`)
  });

  const { data: offers } = useQuery({
    queryKey: ["/api/builder/offers", builderId],
    queryFn: () => apiRequest(`/api/builder/offers/${builderId}`)
  });

  const addProjectMutation = useMutation({
    mutationFn: (projectData: any) => 
      apiRequest("/api/projects", { 
        method: "POST", 
        body: JSON.stringify({ ...projectData, builderId })
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/builder/projects", builderId] });
      setIsAddProjectOpen(false);
    }
  });

  const form = useForm({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      name: "",
      city: "",
      locality: "",
      status: "launched" as const,
      description: "",
      priceBand: { min: 0, max: 0, currency: "INR" },
      amenities: [],
      highlights: []
    }
  });

  const onSubmit = (data: any) => {
    addProjectMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="border-b bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Builder Console
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Manage your projects, leads, and inventory
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="leads">Leads</TabsTrigger>
            <TabsTrigger value="offers">Offers</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{builderStats?.totalProjects || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {builderStats?.activeProjects || 0} active
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Units Available</CardTitle>
                  <Home className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{builderStats?.unitsAvailable || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {builderStats?.unitsSold || 0} sold this month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Leads</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{builderStats?.activeLeads || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {builderStats?.newLeadsThisWeek || 0} new this week
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₹{builderStats?.revenue || 0}Cr</div>
                  <p className="text-xs text-muted-foreground">
                    +{builderStats?.revenueGrowth || 0}% from last month
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Leads</CardTitle>
                  <CardDescription>Latest inquiries for your properties</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {leads?.slice(0, 5)?.map((lead: any) => (
                      <div key={lead.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{lead.contactInfo?.name || 'Anonymous'}</p>
                          <p className="text-sm text-gray-500">
                            Budget: ₹{lead.preferences?.budget}L • {lead.channel}
                          </p>
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

              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                  <CardDescription>Your builder performance overview</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Credibility Score</span>
                      <Badge variant="default">{builderStats?.credibilityScore || 0}%</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Response Time (Avg)</span>
                      <span className="text-sm">{builderStats?.avgResponseTime || 0} mins</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Customer Rating</span>
                      <span className="text-sm">{builderStats?.rating || 0}/5 ⭐</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>RERA Compliance</span>
                      <Badge variant="default">✓ Compliant</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="projects" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Project Management</h2>
              <Dialog open={isAddProjectOpen} onOpenChange={setIsAddProjectOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Project
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Add New Project</DialogTitle>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Project Name</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Project name" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="status"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Status</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="launched">Launched</SelectItem>
                                  <SelectItem value="under_construction">Under Construction</SelectItem>
                                  <SelectItem value="ready">Ready</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="city"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>City</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="City" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="locality"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Locality</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Locality" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea {...field} placeholder="Project description" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex justify-end space-x-2">
                        <Button type="button" variant="outline" onClick={() => setIsAddProjectOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" disabled={addProjectMutation.isPending}>
                          {addProjectMutation.isPending ? "Adding..." : "Add Project"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {projects?.map((project: any) => (
                <Card key={project.id}>
                  <CardContent className="flex items-center justify-between p-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                        <Building2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{project.name}</h3>
                        <p className="text-sm text-gray-500">
                          {project.locality}, {project.city} • {project.status}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="secondary">
                            Credibility: {project.credibilityScore}%
                          </Badge>
                          {project.reraId && (
                            <Badge variant="default">RERA Approved</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      <Button variant="outline" size="sm">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Leads
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="leads" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Lead Management</CardTitle>
                <CardDescription>Track and manage customer inquiries</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {leads?.map((lead: any) => (
                    <div key={lead.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                          <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <h3 className="font-medium">{lead.contactInfo?.name || 'Anonymous'}</h3>
                          <p className="text-sm text-gray-500">
                            {lead.contactInfo?.phone} • {lead.contactInfo?.email}
                          </p>
                          <p className="text-sm text-gray-500">
                            Budget: ₹{lead.preferences?.budget}L • {lead.preferences?.bhk?.join(', ')} BHK
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={
                          lead.stage === 'booked' ? 'default' :
                          lead.stage === 'negotiation' ? 'secondary' : 'outline'
                        }>
                          {lead.stage}
                        </Badge>
                        <Button size="sm" variant="outline">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Contact
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="offers" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Active Offers</CardTitle>
                <CardDescription>Manage promotional offers and discounts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {offers?.map((offer: any) => (
                    <div key={offer.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium">{offer.title}</h3>
                        <p className="text-sm text-gray-500">{offer.details}</p>
                        <p className="text-sm text-gray-500">
                          Valid till: {new Date(offer.validTill).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={offer.visibility === 'public' ? 'default' : 'secondary'}>
                          {offer.visibility}
                        </Badge>
                        {offer.discountPct && (
                          <Badge variant="outline">{offer.discountPct}% off</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Analytics</CardTitle>
                <CardDescription>Detailed insights into your business performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium">Lead Conversion Rate</h3>
                    <p className="text-2xl font-bold text-green-600">{builderStats?.conversionRate || 0}%</p>
                    <p className="text-sm text-gray-500">+2.3% from last month</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium">Average Response Time</h3>
                    <p className="text-2xl font-bold text-blue-600">{builderStats?.avgResponseTime || 0} mins</p>
                    <p className="text-sm text-gray-500">-5 mins improvement</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium">Customer Satisfaction</h3>
                    <p className="text-2xl font-bold text-purple-600">{builderStats?.satisfaction || 0}%</p>
                    <p className="text-sm text-gray-500">Based on 47 reviews</p>
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