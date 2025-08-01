import OpenAI from "openai";
import { storage } from "../storage.js";
import { Project, Unit, Builder, MarketStat } from "../../shared/schema.js";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface ZyloAIResponse {
  status: "ok" | "error";
  answer: string;
  cards: Array<{
    type: "insight" | "warning" | "chart" | "table" | "media" | "cta";
    title: string;
    data: any;
  }>;
  actions: Array<{
    type: "schedule_visit" | "run_avm" | "compare" | "download_pdf" | "chat_builder" | "start_negotiation" | "pay_token";
    params: any;
  }>;
  sources: Array<{
    name: string;
    url: string;
    fetched_at: string;
  }>;
  confidence: number;
  disclaimer: string;
}

export async function processPropertyQuery(query: string, context?: any): Promise<ZyloAIResponse> {
  try {
    const systemPrompt = `You are ZyloAI, the intelligent assistant for ZyloEstates - India's premier AI-first direct-to-builder real estate platform.

MISSION: Remove information asymmetry, enable direct builder connections, provide explainable unbiased advice.

RULES:
- Always cite sources, dates, confidence levels
- Highlight conflicts and limitations  
- Communicate in English/Hinglish/Hindi as per user preference
- Prefer verified data (RERA, concordant multi-source, builder feeds)
- Never invent legal or price facts
- Show credibility scores and confidence levels
- Return strict JSON format for programmatic responses

AVAILABLE TOOLS: search_listings, resolve_conflicts, validate_media, generate_virtual_tour, virtual_stage, market_insights, avm, roi_scenarios, legal_diligence_upload, compare, rera_lookup, schedule_visit, negotiate_offer, escrow_initiate, kyc_esign, summarize_for_pdf

CONTEXT: ${JSON.stringify(context || {})}

USER QUERY: ${query}

Respond with helpful property advice, market insights, or guidance. Include relevant cards, actions, and confidence levels.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: query }
      ],
      response_format: { type: "json_object" },
    });

    const aiResponse = JSON.parse(response.choices[0].message.content || "{}");
    
    return {
      status: "ok",
      answer: aiResponse.answer || "I'd be happy to help you with your property query. Could you provide more specific details?",
      cards: aiResponse.cards || [],
      actions: aiResponse.actions || [],
      sources: [{
        name: "ZyloAI Assistant",
        url: "/ai",
        fetched_at: new Date().toISOString()
      }],
      confidence: aiResponse.confidence || 0.8,
      disclaimer: "AI-generated response. Verify details with builders/RERA directly."
    };
  } catch (error) {
    console.error('OpenAI API error:', error);
    return {
      status: "error",
      answer: "I'm having trouble processing your query right now. Please try again.",
      cards: [],
      actions: [],
      sources: [],
      confidence: 0.0,
      disclaimer: "Service temporarily unavailable"
    };
  }
}

export async function searchListings(filters: any): Promise<Project[]> {
  return await storage.getProjects(filters);
}

export async function generateAVM(projectId: string, unitId?: string): Promise<any> {
  try {
    const project = await storage.getProject(projectId);
    if (!project) throw new Error("Project not found");

    const units = await storage.getUnitsByProject(projectId);
    const marketStats = await storage.getMarketStats(project.city, "city");
    
    const prompt = `As a real estate valuation expert, analyze this property and provide AVM:

PROJECT: ${JSON.stringify(project)}
UNITS: ${JSON.stringify(units)}
MARKET DATA: ${JSON.stringify(marketStats)}

Return JSON with:
{
  "fairValue": number,
  "low": number, 
  "high": number,
  "confidence": number (0-1),
  "comparables": [],
  "adjustments": [],
  "rationale": "string"
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content || "{}");
  } catch (error) {
    throw new Error(`AVM generation failed: ${error}`);
  }
}

export async function compareProperties(propertyIds: string[], userPreferences?: any): Promise<ZyloAIResponse> {
  try {
    const properties = await Promise.all(
      propertyIds.map(id => storage.getProject(id))
    );

    const validProperties = properties.filter(p => p !== undefined);
    if (validProperties.length < 2) {
      throw new Error("Need at least 2 properties to compare");
    }

    const prompt = `Compare these properties for an Indian buyer:

PROPERTIES: ${JSON.stringify(validProperties)}
USER PREFERENCES: ${JSON.stringify(userPreferences || {})}

Rank by user priorities with plain-English verdict. Return JSON with comparison table, pros/cons, and final recommendation.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", 
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });

    const comparison = JSON.parse(response.choices[0].message.content || "{}");
    
    return {
      status: "ok",
      answer: comparison.verdict || "Properties compared successfully",
      cards: [
        {
          type: "table",
          title: "Property Comparison",
          data: comparison.table || []
        }
      ],
      actions: [
        {
          type: "schedule_visit",
          params: { projectIds: propertyIds }
        }
      ],
      sources: validProperties.map(p => ({
        name: p.name,
        url: `/property/${p.id}`,
        fetched_at: new Date().toISOString()
      })),
      confidence: 0.9,
      disclaimer: "Compare based on available data. Verify details before decisions."
    };
  } catch (error) {
    throw new Error(`Property comparison failed: ${error}`);
  }
}

export async function generateMarketInsights(location: string, timeframe?: string): Promise<ZyloAIResponse> {
  try {
    const marketStats = await storage.getMarketStats(location, "city");
    const projects = await storage.getProjects({ city: location });
    
    const prompt = `Generate market intelligence for ${location}:

MARKET DATA: ${JSON.stringify(marketStats)}
PROJECTS: ${JSON.stringify(projects.slice(0, 10))}
TIMEFRAME: ${timeframe || "current"}

Return JSON with trends, forecasts, investment recommendations, and risk factors.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });

    const insights = JSON.parse(response.choices[0].message.content || "{}");
    
    return {
      status: "ok",
      answer: insights.summary || `Market analysis for ${location}`,
      cards: [
        {
          type: "chart",
          title: "Price Trends",
          data: insights.trends || []
        },
        {
          type: "insight",
          title: "Investment Opportunities",
          data: insights.opportunities || []
        }
      ],
      actions: [],
      sources: [
        {
          name: "Market Data Analytics",
          url: "/market-intelligence",
          fetched_at: new Date().toISOString()
        }
      ],
      confidence: 0.85,
      disclaimer: "Market predictions are estimates based on historical data"
    };
  } catch (error) {
    throw new Error(`Market insights generation failed: ${error}`);
  }
}

export async function analyzeLegalDocument(fileUrl: string, projectId: string): Promise<any> {
  try {
    // In a real implementation, this would use OCR and document analysis
    const prompt = `Analyze this legal document for real estate risks:

DOCUMENT URL: ${fileUrl}
PROJECT ID: ${projectId}

Return JSON with:
{
  "summary": "string",
  "riskFlags": ["string"],
  "compliance": "compliant|warning|critical",
  "recommendations": ["string"]
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content || "{}");
  } catch (error) {
    throw new Error(`Document analysis failed: ${error}`);
  }
}

export async function generateNegotiationCounters(offer: any, userPreferences: any): Promise<any> {
  try {
    const prompt = `Generate compliant negotiation counters for Indian real estate:

CURRENT OFFER: ${JSON.stringify(offer)}
USER PREFERENCES: ${JSON.stringify(userPreferences)}

Return JSON with compliant counters, T&Cs, and expiry dates. Ensure RERA compliance.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content || "{}");
  } catch (error) {
    throw new Error(`Negotiation generation failed: ${error}`);
  }
}