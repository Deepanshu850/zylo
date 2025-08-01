import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

interface PropertyRecommendation {
  property_id: string;
  relevance_score: number;
  reasoning: string;
  pros: string[];
  cons: string[];
}

interface AIResponse {
  response: string;
  properties?: PropertyRecommendation[];
  follow_up_questions?: string[];
  intent: string;
  confidence: number;
}

export async function processPropertyQuery(
  query: string,
  context?: {
    properties?: any[];
    searchFilters?: any;
    language?: string;
    userId?: string;
  }
): Promise<AIResponse> {
  try {
    const systemPrompt = `You are ZyloAI, an expert real estate advisor for the Indian market. You help users find properties, understand market trends, calculate ROI, and make informed real estate decisions.

Key Guidelines:
1. Always provide accurate, helpful information about Indian real estate
2. Use Indian currency (₹) and local terminology
3. Consider factors like RERA compliance, credibility scores, and market trends
4. Be transparent about data sources and limitations
5. Suggest relevant properties based on user needs
6. Calculate ROI, appreciation, and rental yields when relevant
7. Support multilingual responses (English/Hindi/Hinglish) based on user preference
8. Always mention important legal considerations and due diligence

Context: ${context ? JSON.stringify(context) : 'No specific context provided'}

Respond in JSON format with:
- response: detailed answer to the user query
- properties: array of relevant property recommendations (if applicable)
- follow_up_questions: suggested questions to help the user
- intent: categorize the query (search/compare/invest/legal/market)
- confidence: confidence level (0-1) in the response`;

    const userPrompt = `User Query: ${query}

Language preference: ${context?.language || 'English'}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 1500,
    });

    const result = JSON.parse(completion.choices[0].message.content || '{}');
    
    return {
      response: result.response || "I apologize, but I couldn't process your query. Please try rephrasing your question.",
      properties: result.properties || [],
      follow_up_questions: result.follow_up_questions || [],
      intent: result.intent || "general",
      confidence: result.confidence || 0.5
    };

  } catch (error) {
    console.error('OpenAI API error:', error);
    
    // Fallback response
    return {
      response: "I'm experiencing technical difficulties right now. Please try again in a moment, or contact our support team for immediate assistance.",
      properties: [],
      follow_up_questions: ["What type of property are you looking for?", "What's your budget range?", "Which city interests you?"],
      intent: "error",
      confidence: 0
    };
  }
}

export async function analyzePropertyComparison(
  properties: any[],
  userPreferences?: {
    budget?: number;
    purpose?: 'investment' | 'enduse';
    priorities?: string[];
  }
): Promise<{
  recommendation: string;
  winner: string;
  comparison_matrix: any;
  investment_analysis: any;
}> {
  try {
    const prompt = `Analyze these properties and provide a detailed comparison for Indian real estate buyers:

Properties: ${JSON.stringify(properties)}
User Preferences: ${JSON.stringify(userPreferences)}

Provide detailed comparison considering:
1. Price per sq.ft analysis
2. Location advantages/disadvantages  
3. Builder credibility and track record
4. ROI potential and rental yields
5. RERA compliance and legal aspects
6. Amenities and lifestyle factors
7. Connectivity and infrastructure
8. Market trends in the locality

Return JSON with:
- recommendation: detailed recommendation in plain English
- winner: ID of the recommended property
- comparison_matrix: structured comparison data
- investment_analysis: ROI, appreciation, risks`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 2000,
    });

    return JSON.parse(completion.choices[0].message.content || '{}');
    
  } catch (error) {
    console.error('Property comparison analysis error:', error);
    throw new Error('Failed to analyze property comparison');
  }
}

export async function generateMarketInsights(
  location: string,
  timeframe: string = "6months"
): Promise<{
  trends: any;
  forecast: any;
  insights: string[];
  investment_outlook: string;
}> {
  try {
    const prompt = `Generate comprehensive market insights for ${location} real estate market:

Timeframe: ${timeframe}

Provide analysis on:
1. Price trends and growth patterns
2. Supply and demand dynamics
3. Infrastructure developments
4. Investment hotspots
5. Future growth prospects
6. Risk factors
7. Best time to buy/sell

Return JSON with structured market data and insights.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.4,
      max_tokens: 1500,
    });

    return JSON.parse(completion.choices[0].message.content || '{}');
    
  } catch (error) {
    console.error('Market insights generation error:', error);
    throw new Error('Failed to generate market insights');
  }
}
