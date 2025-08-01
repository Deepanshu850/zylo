import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { searchFiltersSchema, aiQuerySchema } from "@shared/schema";
import { processPropertyQuery, analyzePropertyComparison, generateMarketInsights } from "./services/openai";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Properties endpoints
  app.get("/api/properties", async (req, res) => {
    try {
      const filters = searchFiltersSchema.parse(req.query);
      const properties = await storage.getProjects(filters);
      res.json({ properties, total: properties.length });
    } catch (error) {
      res.status(400).json({ error: "Invalid filters" });
    }
  });

  app.get("/api/properties/featured", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const properties = await storage.getFeaturedProjects(limit);
      res.json({ properties });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch featured properties" });
    }
  });

  app.get("/api/properties/search", async (req, res) => {
    try {
      const query = req.query.q as string || "";
      const filters = searchFiltersSchema.parse(req.query);
      const properties = await storage.searchProperties(query, filters);
      res.json({ properties, total: properties.length });
    } catch (error) {
      res.status(400).json({ error: "Invalid search parameters" });
    }
  });

  app.get("/api/properties/:id", async (req, res) => {
    try {
      const property = await storage.getProject(req.params.id);
      if (!property) {
        return res.status(404).json({ error: "Property not found" });
      }
      
      // Get builder info
      const builder = await storage.getBuilder(property.builderId);
      
      // Get units
      const units = await storage.getUnitsByProject(property.id);
      
      // Get offers
      const offers = await storage.getOffersByProject(property.id);
      
      res.json({
        property,
        builder,
        units,
        offers
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch property details" });
    }
  });

  app.get("/api/properties/:id/units", async (req, res) => {
    try {
      const units = await storage.getUnitsByProject(req.params.id);
      res.json({ units });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch units" });
    }
  });

  // Builders endpoints
  app.get("/api/builders", async (req, res) => {
    try {
      const verified = req.query.verified === 'true' ? true : undefined;
      const builders = await storage.getBuilders({ verified });
      res.json({ builders });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch builders" });
    }
  });

  app.get("/api/builders/:id", async (req, res) => {
    try {
      const builder = await storage.getBuilder(req.params.id);
      if (!builder) {
        return res.status(404).json({ error: "Builder not found" });
      }
      
      const projects = await storage.getProjectsByBuilder(builder.id);
      const offers = await storage.getOffersByBuilder(builder.id);
      
      res.json({
        builder,
        projects,
        offers
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch builder details" });
    }
  });

  // Market data endpoints
  app.get("/api/market/stats", async (req, res) => {
    try {
      const { geo, geoType } = req.query;
      if (!geo || !geoType) {
        return res.status(400).json({ error: "geo and geoType are required" });
      }
      
      const stats = await storage.getMarketStats(geo as string, geoType as string);
      res.json({ stats });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch market stats" });
    }
  });

  app.get("/api/market/trending", async (req, res) => {
    try {
      const city = req.query.city as string;
      if (!city) {
        return res.status(400).json({ error: "city is required" });
      }
      
      const localities = await storage.getTrendingLocalities(city);
      res.json({ localities });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch trending localities" });
    }
  });

  app.post("/api/market/insights", async (req, res) => {
    try {
      const { location, timeframe } = req.body;
      if (!location) {
        return res.status(400).json({ error: "location is required" });
      }
      
      const insights = await generateMarketInsights(location, timeframe);
      res.json(insights);
    } catch (error) {
      res.status(500).json({ error: "Failed to generate market insights" });
    }
  });

  // AI endpoints
  app.post("/api/ai/chat", async (req, res) => {
    try {
      const queryData = aiQuerySchema.parse(req.body);
      const response = await processPropertyQuery(queryData.query, queryData.context);
      
      // Save chat history
      if (queryData.sessionId) {
        await storage.createAiChatHistory({
          sessionId: queryData.sessionId,
          query: queryData.query,
          response: response.response,
          context: queryData.context
        });
      }
      
      res.json(response);
    } catch (error) {
      console.error('AI chat error:', error);
      res.status(500).json({ error: "Failed to process AI query" });
    }
  });

  app.post("/api/ai/compare", async (req, res) => {
    try {
      const { propertyIds, userPreferences } = req.body;
      
      if (!propertyIds || !Array.isArray(propertyIds)) {
        return res.status(400).json({ error: "propertyIds array is required" });
      }
      
      // Fetch properties
      const properties = await Promise.all(
        propertyIds.map(id => storage.getProject(id))
      );
      
      const validProperties = properties.filter(p => p !== undefined);
      
      if (validProperties.length < 2) {
        return res.status(400).json({ error: "At least 2 valid properties required for comparison" });
      }
      
      const comparison = await analyzePropertyComparison(validProperties, userPreferences);
      res.json(comparison);
    } catch (error) {
      console.error('AI comparison error:', error);
      res.status(500).json({ error: "Failed to analyze property comparison" });
    }
  });

  app.get("/api/ai/chat-history/:sessionId", async (req, res) => {
    try {
      const history = await storage.getAiChatHistory(req.params.sessionId);
      res.json({ history });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch chat history" });
    }
  });

  // Leads endpoints
  app.post("/api/leads", async (req, res) => {
    try {
      const lead = await storage.createLead(req.body);
      res.json({ lead });
    } catch (error) {
      res.status(500).json({ error: "Failed to create lead" });
    }
  });

  // Units endpoints
  app.get("/api/units/:id", async (req, res) => {
    try {
      const unit = await storage.getUnit(req.params.id);
      if (!unit) {
        return res.status(404).json({ error: "Unit not found" });
      }
      
      const project = await storage.getProject(unit.projectId);
      const builder = project ? await storage.getBuilder(project.builderId) : null;
      
      res.json({
        unit,
        project,
        builder
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch unit details" });
    }
  });

  // Legal documents endpoints
  app.get("/api/legal/:projectId", async (req, res) => {
    try {
      const docs = await storage.getLegalDocsByProject(req.params.projectId);
      res.json({ docs });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch legal documents" });
    }
  });

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Admin API endpoints
  app.get("/api/admin/stats", async (req, res) => {
    try {
      const builders = await storage.getBuilders();
      const projects = await storage.getProjects();
      
      const stats = {
        totalBuilders: builders.length,
        newBuildersThisMonth: builders.filter(b => 
          new Date(b.createdAt).getMonth() === new Date().getMonth()
        ).length,
        activeProjects: projects.filter(p => p.status !== 'ready').length,
        newProjectsThisMonth: projects.filter(p => 
          new Date(p.createdAt).getMonth() === new Date().getMonth()
        ).length,
        totalLeads: 150, // Mock data
        newLeadsThisWeek: 25,
        revenue: 125000000,
        revenueGrowth: 15.2,
        compliantProjects: projects.filter(p => p.reraId).length,
        pendingReview: projects.filter(p => !p.reraId && p.credibilityScore < 80).length,
        nonCompliant: projects.filter(p => !p.reraId && p.credibilityScore < 50).length
      };
      
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch admin stats" });
    }
  });

  app.get("/api/admin/leads", async (req, res) => {
    try {
      // Mock leads data - in production would fetch from database
      const leads = [
        {
          id: "lead1",
          contactInfo: { name: "Rajesh Kumar", phone: "+91-9876543210" },
          stage: "qualified",
          channel: "web",
          preferences: { budget: 75 }
        },
        {
          id: "lead2", 
          contactInfo: { name: "Priya Sharma", phone: "+91-9876543211" },
          stage: "negotiation",
          channel: "whatsapp",
          preferences: { budget: 120 }
        }
      ];
      res.json(leads);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch leads" });
    }
  });

  app.post("/api/admin/builders/:id/verify", async (req, res) => {
    try {
      const builder = await storage.updateBuilder(req.params.id, { verified: true });
      if (!builder) {
        return res.status(404).json({ error: "Builder not found" });
      }
      res.json({ message: "Builder verified successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to verify builder" });
    }
  });

  app.post("/api/admin/projects/:id/approve", async (req, res) => {
    try {
      const project = await storage.updateProject(req.params.id, { approved: true });
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      res.json({ message: "Project approved successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to approve project" });
    }
  });

  // Builder Console API endpoints
  app.get("/api/builder/stats/:builderId", async (req, res) => {
    try {
      const builderId = req.params.builderId;
      const projects = await storage.getProjectsByBuilder(builderId);
      
      const stats = {
        totalProjects: projects.length,
        activeProjects: projects.filter(p => p.status !== 'ready').length,
        unitsAvailable: 245, // Mock data
        unitsSold: 18,
        activeLeads: 34,
        newLeadsThisWeek: 8,
        revenue: 25.5,
        revenueGrowth: 12.8,
        credibilityScore: 85,
        avgResponseTime: 15,
        rating: 4.2,
        conversionRate: 18.5,
        satisfaction: 92
      };
      
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch builder stats" });
    }
  });

  app.get("/api/builder/projects/:builderId", async (req, res) => {
    try {
      const projects = await storage.getProjectsByBuilder(req.params.builderId);
      res.json(projects);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch builder projects" });
    }
  });

  app.get("/api/builder/leads/:builderId", async (req, res) => {
    try {
      // Mock leads for builder - in production would filter by builderId
      const leads = [
        {
          id: "lead1",
          contactInfo: { name: "Amit Gupta", phone: "+91-9876543210" },
          stage: "new",
          channel: "web",
          preferences: { budget: 85, bhk: [2, 3] }
        }
      ];
      res.json(leads);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch builder leads" });
    }
  });

  app.get("/api/builder/offers/:builderId", async (req, res) => {
    try {
      const offers = await storage.getOffersByBuilder(req.params.builderId);
      res.json(offers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch builder offers" });
    }
  });

  // AI Tools API endpoints
  app.post("/api/ai/avm", async (req, res) => {
    try {
      const { projectId, unitId } = req.body;
      if (!projectId) {
        return res.status(400).json({ error: "projectId is required" });
      }
      
      const avmResult = await generateAVM(projectId, unitId);
      res.json(avmResult);
    } catch (error) {
      console.error('AVM generation error:', error);
      res.status(500).json({ error: "Failed to generate AVM" });
    }
  });

  app.post("/api/ai/legal-analysis", async (req, res) => {
    try {
      const { fileUrl, projectId } = req.body;
      if (!fileUrl || !projectId) {
        return res.status(400).json({ error: "fileUrl and projectId are required" });
      }
      
      const analysis = await analyzeLegalDocument(fileUrl, projectId);
      res.json(analysis);
    } catch (error) {
      console.error('Legal analysis error:', error);
      res.status(500).json({ error: "Failed to analyze document" });
    }
  });

  app.post("/api/ai/roi-scenarios", async (req, res) => {
    try {
      const { projectId, investmentAmount, timeHorizon } = req.body;
      
      // Mock ROI calculation
      const scenarios = {
        bull: 25.5,
        base: 15.2,
        bear: -2.1,
        appreciation: 12.5,
        yield: 3.8,
        irr: 16.2
      };
      
      res.json({ scenarios });
    } catch (error) {
      res.status(500).json({ error: "Failed to calculate ROI scenarios" });
    }
  });

  app.post("/api/ai/virtual-tour", async (req, res) => {
    try {
      const { projectId, unitId } = req.body;
      
      // Mock virtual tour generation
      const tourUrl = `https://tours.zyloestates.com/project/${projectId}`;
      res.json({ tourUrl, loadTime: "1.8s" });
    } catch (error) {
      res.status(500).json({ error: "Failed to generate virtual tour" });
    }
  });

  app.post("/api/ai/virtual-staging", async (req, res) => {
    try {
      const { imageUrl, style } = req.body;
      
      // Mock virtual staging
      const stagedUrl = `https://staging.zyloestates.com/staged/${Date.now()}.jpg`;
      res.json({ original: imageUrl, staged: stagedUrl });
    } catch (error) {
      res.status(500).json({ error: "Failed to generate virtual staging" });
    }
  });

  app.get("/api/rera/lookup/:reraId", async (req, res) => {
    try {
      const reraData = await lookupRERA(req.params.reraId);
      res.json(reraData);
    } catch (error) {
      res.status(500).json({ error: "Failed to lookup RERA data" });
    }
  });

  app.post("/api/ai/negotiate", async (req, res) => {
    try {
      const { offer, userPreferences } = req.body;
      const negotiation = await generateNegotiationCounters(offer, userPreferences);
      res.json(negotiation);
    } catch (error) {
      res.status(500).json({ error: "Failed to generate negotiation" });
    }
  });

  app.post("/api/schedule-visit", async (req, res) => {
    try {
      const { projectId, contactInfo, preferredDate } = req.body;
      
      // Mock visit scheduling
      const visitId = `visit_${Date.now()}`;
      
      // Send WhatsApp notification
      await sendWhatsAppMessage({
        to: contactInfo.phone,
        message: `Your visit to ${projectId} is scheduled for ${preferredDate}. Visit ID: ${visitId}`,
        type: "text"
      });
      
      res.json({ visitId, status: "scheduled" });
    } catch (error) {
      res.status(500).json({ error: "Failed to schedule visit" });
    }
  });

  app.post("/api/escrow/initiate", async (req, res) => {
    try {
      const { amount, buyerId, sellerId } = req.body;
      const transaction = await initiateEscrow({ amount, buyerId, sellerId });
      res.json(transaction);
    } catch (error) {
      res.status(500).json({ error: "Failed to initiate escrow" });
    }
  });

  app.post("/api/kyc/verify", async (req, res) => {
    try {
      const document = req.body;
      const verification = await verifyKYC(document);
      res.json(verification);
    } catch (error) {
      res.status(500).json({ error: "Failed to verify KYC" });
    }
  });

  app.post("/api/esign/initiate", async (req, res) => {
    try {
      const { documentId, signerId } = req.body;
      const esign = await initiateESign(documentId, signerId);
      res.json(esign);
    } catch (error) {
      res.status(500).json({ error: "Failed to initiate e-sign" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
