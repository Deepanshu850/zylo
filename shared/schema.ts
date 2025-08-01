import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  preferences: jsonb("preferences").$type<{
    budget?: { min: number; max: number };
    bhk?: number[];
    cities?: string[];
    language?: string;
  }>(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Builders table
export const builders = pgTable("builders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  verified: boolean("verified").default(false),
  reraIds: jsonb("rera_ids").$type<string[]>().default([]),
  inventoryFreshnessHours: integer("inventory_freshness_hours").default(24),
  slaResponseMinutes: integer("sla_response_minutes").default(30),
  contact: jsonb("contact").$type<{
    phone?: string;
    email?: string;
    website?: string;
  }>(),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0"),
  projectCount: integer("project_count").default(0),
  description: text("description"),
  logo: text("logo"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Projects table
export const projects = pgTable("projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  builderId: varchar("builder_id").references(() => builders.id).notNull(),
  reraId: text("rera_id"),
  city: text("city").notNull(),
  locality: text("locality").notNull(),
  lat: decimal("lat", { precision: 10, scale: 8 }),
  lng: decimal("lng", { precision: 11, scale: 8 }),
  status: text("status", { enum: ["launched", "under_construction", "ready"] }).notNull(),
  possessionDate: timestamp("possession_date"),
  amenities: jsonb("amenities").$type<string[]>().default([]),
  connectivity: jsonb("connectivity").$type<{
    metroKm?: number;
    airportKm?: number;
    railwayKm?: number;
    it_hubKm?: number;
  }>(),
  priceBand: jsonb("price_band").$type<{
    min: number;
    max: number;
    currency: string;
  }>().notNull(),
  media: jsonb("media").$type<Array<{
    url: string;
    type: "image" | "video" | "tour";
    verified: boolean;
    score: number;
  }>>().default([]),
  credibilityScore: integer("credibility_score").default(0),
  sources: jsonb("sources").$type<string[]>().default([]),
  lastVerified: timestamp("last_verified").defaultNow(),
  description: text("description"),
  highlights: jsonb("highlights").$type<string[]>().default([]),
  floorPlans: jsonb("floor_plans").$type<Array<{
    bhk: number;
    area: number;
    price: number;
    imageUrl?: string;
  }>>().default([]),
  createdAt: timestamp("created_at").defaultNow(),
});

// Units table
export const units = pgTable("units", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").references(() => projects.id).notNull(),
  bhk: integer("bhk").notNull(),
  carpet: decimal("carpet", { precision: 8, scale: 2 }).notNull(),
  price: decimal("price", { precision: 12, scale: 2 }).notNull(),
  facing: text("facing"),
  floor: integer("floor"),
  inventoryStatus: text("inventory_status", { enum: ["available", "hold", "sold"] }).default("available"),
  avm: jsonb("avm").$type<{
    fairValue: number;
    low: number;
    high: number;
    confidence: number;
  }>(),
  rentYieldPct: decimal("rent_yield_pct", { precision: 5, scale: 2 }),
  roi: jsonb("roi").$type<{
    appreciation: number;
    yield: number;
    irr: number;
    scenarios: {
      bull: number;
      base: number;
      bear: number;
    };
  }>(),
  unitNumber: text("unit_number"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Offers table
export const offers = pgTable("offers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  builderId: varchar("builder_id").references(() => builders.id).notNull(),
  projectId: varchar("project_id").references(() => projects.id),
  type: text("type", { enum: ["discount", "upgrade", "waiver", "token_cashback"] }).notNull(),
  title: text("title").notNull(),
  details: text("details").notNull(),
  validTill: timestamp("valid_till").notNull(),
  visibility: text("visibility", { enum: ["public", "private"] }).default("public"),
  tnc: text("tnc"),
  discountPct: decimal("discount_pct", { precision: 5, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Market Stats table
export const marketStats = pgTable("market_stats", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  geo: text("geo").notNull(), // city|locality|pincode
  geoType: text("geo_type", { enum: ["city", "locality", "pincode"] }).notNull(),
  period: text("period").notNull(), // YYYY-MM
  medianPrice: decimal("median_price", { precision: 12, scale: 2 }).notNull(),
  qoqPct: decimal("qoq_pct", { precision: 5, scale: 2 }),
  yoyPct: decimal("yoy_pct", { precision: 5, scale: 2 }),
  inventoryIndex: decimal("inventory_index", { precision: 8, scale: 2 }),
  pricePerSqft: decimal("price_per_sqft", { precision: 8, scale: 2 }),
  absorptionRate: decimal("absorption_rate", { precision: 5, scale: 2 }),
  newLaunches: integer("new_launches"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Legal Documents table
export const legalDocs = pgTable("legal_docs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").references(() => projects.id).notNull(),
  type: text("type", { enum: ["title", "noc", "layout", "agreement", "rera"] }).notNull(),
  fileUrl: text("file_url").notNull(),
  ocrText: text("ocr_text"),
  riskFlags: jsonb("risk_flags").$type<string[]>().default([]),
  summary: text("summary"),
  verified: boolean("verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Leads table
export const leads = pgTable("leads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  projectId: varchar("project_id").references(() => projects.id),
  builderId: varchar("builder_id").references(() => builders.id),
  stage: text("stage", { enum: ["new", "qualified", "visit", "negotiation", "booked"] }).default("new"),
  preferences: jsonb("preferences").$type<{
    budget?: number;
    bhk?: number[];
    urgency?: string;
    purpose?: "investment" | "enduse";
  }>(),
  channel: text("channel", { enum: ["web", "whatsapp", "phone"] }).default("web"),
  notes: text("notes"),
  contactInfo: jsonb("contact_info").$type<{
    name?: string;
    phone?: string;
    email?: string;
  }>(),
  createdAt: timestamp("created_at").defaultNow(),
});

// AI Chat History table
export const aiChatHistory = pgTable("ai_chat_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull(),
  userId: varchar("user_id").references(() => users.id),
  query: text("query").notNull(),
  response: text("response").notNull(),
  context: jsonb("context").$type<{
    properties?: string[];
    searchFilters?: any;
    language?: string;
  }>(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertBuilderSchema = createInsertSchema(builders).omit({
  id: true,
  createdAt: true,
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
  lastVerified: true,
});

export const insertUnitSchema = createInsertSchema(units).omit({
  id: true,
  createdAt: true,
});

export const insertOfferSchema = createInsertSchema(offers).omit({
  id: true,
  createdAt: true,
});

export const insertMarketStatSchema = createInsertSchema(marketStats).omit({
  id: true,
  createdAt: true,
});

export const insertLegalDocSchema = createInsertSchema(legalDocs).omit({
  id: true,
  createdAt: true,
});

export const insertLeadSchema = createInsertSchema(leads).omit({
  id: true,
  createdAt: true,
});

export const insertAiChatHistorySchema = createInsertSchema(aiChatHistory).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Builder = typeof builders.$inferSelect;
export type InsertBuilder = z.infer<typeof insertBuilderSchema>;

export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;

export type Unit = typeof units.$inferSelect;
export type InsertUnit = z.infer<typeof insertUnitSchema>;

export type Offer = typeof offers.$inferSelect;
export type InsertOffer = z.infer<typeof insertOfferSchema>;

export type MarketStat = typeof marketStats.$inferSelect;
export type InsertMarketStat = z.infer<typeof insertMarketStatSchema>;

export type LegalDoc = typeof legalDocs.$inferSelect;
export type InsertLegalDoc = z.infer<typeof insertLegalDocSchema>;

export type Lead = typeof leads.$inferSelect;
export type InsertLead = z.infer<typeof insertLeadSchema>;

export type AiChatHistory = typeof aiChatHistory.$inferSelect;
export type InsertAiChatHistory = z.infer<typeof insertAiChatHistorySchema>;

// Search and filter types
export const searchFiltersSchema = z.object({
  city: z.string().optional(),
  locality: z.string().optional(),
  budget: z.object({
    min: z.number().optional(),
    max: z.number().optional(),
  }).optional(),
  bhk: z.array(z.number()).optional(),
  propertyType: z.string().optional(),
  status: z.array(z.string()).optional(),
  verified: z.boolean().optional(),
  reraApproved: z.boolean().optional(),
  credibilityMin: z.number().optional(),
});

export type SearchFilters = z.infer<typeof searchFiltersSchema>;

// AI Query types
export const aiQuerySchema = z.object({
  query: z.string(),
  sessionId: z.string().optional(),
  context: z.object({
    properties: z.array(z.string()).optional(),
    searchFilters: searchFiltersSchema.optional(),
    language: z.string().optional(),
  }).optional(),
});

export type AiQuery = z.infer<typeof aiQuerySchema>;
