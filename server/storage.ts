import { 
  type User, type InsertUser,
  type Builder, type InsertBuilder,
  type Project, type InsertProject,
  type Unit, type InsertUnit,
  type Offer, type InsertOffer,
  type MarketStat, type InsertMarketStat,
  type LegalDoc, type InsertLegalDoc,
  type Lead, type InsertLead,
  type AiChatHistory, type InsertAiChatHistory,
  type SearchFilters
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Builders
  getBuilder(id: string): Promise<Builder | undefined>;
  getBuilders(filters?: { verified?: boolean }): Promise<Builder[]>;
  createBuilder(builder: InsertBuilder): Promise<Builder>;
  updateBuilder(id: string, updates: Partial<Builder>): Promise<Builder | undefined>;

  // Projects
  getProject(id: string): Promise<Project | undefined>;
  getProjects(filters?: SearchFilters): Promise<Project[]>;
  getProjectsByBuilder(builderId: string): Promise<Project[]>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: string, updates: Partial<Project>): Promise<Project | undefined>;

  // Units
  getUnit(id: string): Promise<Unit | undefined>;
  getUnitsByProject(projectId: string): Promise<Unit[]>;
  createUnit(unit: InsertUnit): Promise<Unit>;

  // Offers
  getOffersByBuilder(builderId: string): Promise<Offer[]>;
  getOffersByProject(projectId: string): Promise<Offer[]>;
  createOffer(offer: InsertOffer): Promise<Offer>;

  // Market Stats
  getMarketStats(geo: string, geoType: string): Promise<MarketStat[]>;
  createMarketStat(stat: InsertMarketStat): Promise<MarketStat>;

  // Legal Docs
  getLegalDocsByProject(projectId: string): Promise<LegalDoc[]>;
  createLegalDoc(doc: InsertLegalDoc): Promise<LegalDoc>;

  // Leads
  createLead(lead: InsertLead): Promise<Lead>;
  getLeadsByUser(userId: string): Promise<Lead[]>;

  // AI Chat History
  createAiChatHistory(chat: InsertAiChatHistory): Promise<AiChatHistory>;
  getAiChatHistory(sessionId: string): Promise<AiChatHistory[]>;

  // Search and aggregation
  searchProperties(query: string, filters?: SearchFilters): Promise<Project[]>;
  getFeaturedProjects(limit?: number): Promise<Project[]>;
  getTrendingLocalities(city: string): Promise<string[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private builders: Map<string, Builder> = new Map();
  private projects: Map<string, Project> = new Map();
  private units: Map<string, Unit> = new Map();
  private offers: Map<string, Offer> = new Map();
  private marketStats: Map<string, MarketStat> = new Map();
  private legalDocs: Map<string, LegalDoc> = new Map();
  private leads: Map<string, Lead> = new Map();
  private aiChatHistory: Map<string, AiChatHistory> = new Map();

  constructor() {
    this.initializeSampleData();
    this.loadMoneyTreeData();
  }

  private async loadMoneyTreeData() {
    try {
      console.log('Loading MoneyTree data...');
      const response = await fetch('https://moneytreerealty.in/api/properties');
      
      if (!response.ok) {
        console.log('MoneyTree API response not ok:', response.status);
        return;
      }
      
      const properties = await response.json();
      console.log(`Fetched ${properties.length} properties from MoneyTree`);
      
      // Convert first few properties for testing
      properties.slice(0, 10).forEach((prop: any) => {
        // Create builder first
        const builderId = this.getOrCreateBuilder(prop.builder, prop.location[0]);
        
        // Create project
        const project: Project = {
          id: `mt_${prop.id}`,
          name: prop.name,
          builderId: builderId,
          location: {
            city: prop.location[0] || 'Unknown',
            locality: prop.location[1] || '',
            state: this.getStateFromCity(prop.location[0]),
            pincode: prop.location[2] || '',
            address: prop.location[3] || ''
          },
          description: prop.shortDescription || `Premium ${prop.typeDetail?.join(' & ') || 'residential'} project by ${prop.builder}`,
          priceBand: this.parsePriceRange(prop.price),
          status: this.getProjectStatus(prop.possession),
          possession: {
            timeline: prop.possession || 'Under Construction',
            readyToMove: false
          },
          reraId: prop.rera?.[0] && prop.rera[0] !== '#' ? prop.rera[0] : null,
          media: prop.images?.map((img: string) => ({
            url: `https://moneytreerealty.in/${img}`,
            type: 'image' as const,
            caption: `${prop.name} - Gallery`
          })) || [],
          highlights: this.extractHighlights(prop.keywords || ''),
          credibilityScore: this.calculateCredibilityScore(prop),
          createdAt: new Date(prop.created_at || new Date()),
          approved: true,
          featured: Math.random() > 0.5
        };
        
        this.projects.set(project.id, project);
        console.log(`Added project: ${project.name}`);
      });
      
      console.log(`Successfully loaded ${properties.slice(0, 10).length} MoneyTree properties`);
    } catch (error) {
      console.error('Failed to load MoneyTree data:', error);
    }
  }

  private getOrCreateBuilder(builderName: string, city: string): string {
    // Find existing builder
    for (const [id, builder] of this.builders) {
      if (builder.name === builderName) {
        return id;
      }
    }
    
    // Create new builder
    const builderId = `mt_builder_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const builder: Builder = {
      id: builderId,
      name: builderName,
      verified: Math.random() > 0.3,
      reraIds: [],
      inventoryFreshnessHours: 24,
      slaResponseMinutes: 30,
      contact: {
        phone: '+91-98765-43210',
        email: `info@${builderName.toLowerCase().replace(/\s+/g, '')}.com`,
        website: `https://www.${builderName.toLowerCase().replace(/\s+/g, '')}.com`
      },
      rating: (3.5 + Math.random() * 1.5).toFixed(1),
      projectCount: Math.floor(Math.random() * 20) + 1,
      description: `Leading real estate developer specializing in premium projects in ${city}`,
      logo: null,
      createdAt: new Date()
    };
    
    this.builders.set(builderId, builder);
    return builderId;
  }

  private getStateFromCity(city: string): string {
    const cityStateMap: Record<string, string> = {
      'Mumbai': 'Maharashtra',
      'Pune': 'Maharashtra', 
      'Gurugram': 'Haryana',
      'Gurgaon': 'Haryana',
      'Delhi': 'Delhi',
      'Noida': 'Uttar Pradesh',
      'Bengaluru': 'Karnataka',
      'Bangalore': 'Karnataka',
      'Chennai': 'Tamil Nadu',
      'Hyderabad': 'Telangana'
    };
    return cityStateMap[city] || 'Unknown';
  }

  private parsePriceRange(priceStr: string): { min: number; max: number; currency: string } {
    if (priceStr === 'On Request') {
      return { min: 50000000, max: 200000000, currency: 'INR' };
    }
    
    const match = priceStr.match(/Rs\.\s*([\d.]+)\s*Cr/);
    if (match) {
      const price = parseFloat(match[1]) * 10000000;
      return { 
        min: Math.floor(price * 0.9), 
        max: Math.floor(price * 1.3), 
        currency: 'INR' 
      };
    }
    
    return { min: 30000000, max: 150000000, currency: 'INR' };
  }

  private getProjectStatus(possession: string): string {
    if (possession.includes('2025')) return 'nearing_completion';
    if (possession.includes('2026')) return 'under_construction';
    if (possession.includes('2027') || possession.includes('2028')) return 'launched';
    return 'under_construction';
  }

  private calculateCredibilityScore(prop: any): number {
    let score = 60;
    if (prop.rera?.[0] && prop.rera[0] !== '#') score += 20;
    if (prop.images && prop.images.length > 2) score += 10;
    if (prop.price !== 'On Request') score += 5;
    if (prop.builder && prop.builder.length > 0) score += 5;
    return Math.min(100, score);
  }

  private extractHighlights(keywords: string): string[] {
    if (!keywords) return [];
    const highlights = [];
    const lowerKeywords = keywords.toLowerCase();
    if (lowerKeywords.includes('luxury')) highlights.push('Luxury Project');
    if (lowerKeywords.includes('rera')) highlights.push('RERA Approved');
    if (lowerKeywords.includes('premium')) highlights.push('Premium Location');
    if (lowerKeywords.includes('modern')) highlights.push('Modern Amenities');
    return highlights.slice(0, 4);
  }

  private initializeSampleData() {
    // Initialize sample builders
    const builder1: Builder = {
      id: "builder-prestige",
      name: "Prestige Group",
      verified: true,
      reraIds: ["PRM/KA/RERA/1251/309"],
      inventoryFreshnessHours: 12,
      slaResponseMinutes: 15,
      contact: {
        phone: "+91 80 4055 9999",
        email: "sales@prestigeconstructions.com",
        website: "https://www.prestigeconstructions.com"
      },
      rating: "4.8",
      projectCount: 125,
      description: "Leading real estate developer in South India with 35+ years of experience",
      logo: null,
      createdAt: new Date(),
    };

    const builder2: Builder = {
      id: "builder-dlf",
      name: "DLF Limited",
      verified: true,
      reraIds: ["RC/REP/HARERA/GGM/766/499"],
      inventoryFreshnessHours: 18,
      slaResponseMinutes: 20,
      contact: {
        phone: "+91 124 4513 000",
        email: "customercare@dlf.in",
        website: "https://www.dlf.in"
      },
      rating: "4.6",
      projectCount: 200,
      description: "India's largest real estate developer with pan-India presence",
      logo: null,
      createdAt: new Date(),
    };

    const builder3: Builder = {
      id: "builder-godrej",
      name: "Godrej Properties",
      verified: true,
      reraIds: ["P51700000652"],
      inventoryFreshnessHours: 10,
      slaResponseMinutes: 12,
      contact: {
        phone: "+91 22 2518 8070",
        email: "customercare@godrejproperties.com",
        website: "https://www.godrejproperties.com"
      },
      rating: "4.9",
      projectCount: 90,
      description: "Trusted real estate brand with innovative and sustainable developments",
      logo: null,
      createdAt: new Date(),
    };

    const builder4: Builder = {
      id: "builder-brigade",
      name: "Brigade Group",
      verified: true,
      reraIds: ["PRM/KA/RERA/1251/308"],
      inventoryFreshnessHours: 16,
      slaResponseMinutes: 18,
      contact: {
        phone: "+91 80 4179 4179",
        email: "info@brigadegroup.com",
        website: "https://www.brigadegroup.com"
      },
      rating: "4.5",
      projectCount: 75,
      description: "Bangalore-based real estate developer known for quality constructions",
      logo: null,
      createdAt: new Date(),
    };

    [builder1, builder2, builder3, builder4].forEach(builder => {
      this.builders.set(builder.id, builder);
    });

    // Initialize sample projects
    const project1: Project = {
      id: "project-prestige-lakeside",
      name: "Prestige Lakeside Habitat",
      builderId: "builder-prestige",
      reraId: "PRM/KA/RERA/1251/309",
      city: "Bangalore",
      locality: "Whitefield",
      lat: "12.9698",
      lng: "77.7500",
      status: "under_construction",
      possessionDate: new Date("2025-12-31"),
      amenities: ["Swimming Pool", "Gym", "Club House", "Children's Play Area", "24/7 Security", "Power Backup"],
      connectivity: {
        metroKm: 5.2,
        airportKm: 35,
        railwayKm: 8,
        it_hubKm: 2.5
      },
      priceBand: {
        min: 12000000,
        max: 25000000,
        currency: "INR"
      },
      media: [
        {
          url: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00",
          type: "image",
          verified: true,
          score: 95
        }
      ],
      credibilityScore: 92,
      sources: ["RERA Portal", "Builder Direct", "Municipal Records"],
      lastVerified: new Date(),
      description: "Premium residential development with lake views and world-class amenities",
      highlights: ["Lake Facing", "RERA Approved", "Near IT Parks", "Metro Connectivity"],
      floorPlans: [
        { bhk: 2, area: 1200, price: 12000000 },
        { bhk: 3, area: 1800, price: 18000000 }
      ],
      createdAt: new Date(),
    };

    const project2: Project = {
      id: "project-dlf-privana",
      name: "DLF Privana South",
      builderId: "builder-dlf",
      reraId: "RC/REP/HARERA/GGM/766/499",
      city: "Gurgaon",
      locality: "Sector 77",
      lat: "28.3836",
      lng: "77.0642",
      status: "ready",
      possessionDate: new Date("2024-06-30"),
      amenities: ["Swimming Pool", "Spa", "Golf Course", "Concierge", "Valet Parking", "High-Speed Elevators"],
      connectivity: {
        metroKm: 3.5,
        airportKm: 25,
        railwayKm: 12,
        it_hubKm: 8
      },
      priceBand: {
        min: 28000000,
        max: 55000000,
        currency: "INR"
      },
      media: [
        {
          url: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00",
          type: "image",
          verified: true,
          score: 88
        }
      ],
      credibilityScore: 88,
      sources: ["RERA Portal", "Builder Direct"],
      lastVerified: new Date(),
      description: "Ultra-luxury residential towers with premium amenities and prime location",
      highlights: ["Ready to Move", "Golf Course Views", "Metro Connected", "Premium Location"],
      floorPlans: [
        { bhk: 3, area: 1800, price: 28000000 },
        { bhk: 4, area: 2500, price: 45000000 }
      ],
      createdAt: new Date(),
    };

    const project3: Project = {
      id: "project-godrej-reserve",
      name: "Godrej Reserve",
      builderId: "builder-godrej",
      reraId: "P51700000652",
      city: "Mumbai",
      locality: "Kandivali East",
      lat: "19.2056",
      lng: "72.8681",
      status: "under_construction",
      possessionDate: new Date("2026-03-31"),
      amenities: ["Forest Trail", "Organic Farming", "Yoga Deck", "Adventure Sports", "Amphitheatre", "Pet Park"],
      connectivity: {
        metroKm: 2.8,
        airportKm: 18,
        railwayKm: 1.5,
        it_hubKm: 15
      },
      priceBand: {
        min: 35000000,
        max: 80000000,
        currency: "INR"
      },
      media: [
        {
          url: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6",
          type: "image",
          verified: true,
          score: 95
        }
      ],
      credibilityScore: 95,
      sources: ["RERA Portal", "Builder Direct", "Municipal Records", "Environmental Clearance"],
      lastVerified: new Date(),
      description: "Luxury residences amidst 100 acres of lush greenery with sustainable living features",
      highlights: ["100 Acres Green", "Sustainable Living", "Premium Amenities", "Metro Proximity"],
      floorPlans: [
        { bhk: 4, area: 2200, price: 35000000 },
        { bhk: 5, area: 3000, price: 55000000 }
      ],
      createdAt: new Date(),
    };

    [project1, project2, project3].forEach(project => {
      this.projects.set(project.id, project);
    });

    // Initialize sample units
    const units = [
      {
        id: "unit-1",
        projectId: "project-prestige-lakeside",
        bhk: 2,
        carpet: "1200.00",
        price: "12000000.00",
        facing: "East",
        floor: 5,
        inventoryStatus: "available" as const,
        avm: {
          fairValue: 12500000,
          low: 11800000,
          high: 13200000,
          confidence: 0.85
        },
        rentYieldPct: "3.2",
        roi: {
          appreciation: 12.5,
          yield: 3.2,
          irr: 15.8,
          scenarios: { bull: 18.5, base: 12.5, bear: 8.2 }
        },
        unitNumber: "T1-505",
        createdAt: new Date(),
      },
      {
        id: "unit-2",
        projectId: "project-dlf-privana",
        bhk: 3,
        carpet: "1800.00",
        price: "28000000.00",
        facing: "North",
        floor: 12,
        inventoryStatus: "available" as const,
        avm: {
          fairValue: 29200000,
          low: 27500000,
          high: 31000000,
          confidence: 0.78
        },
        rentYieldPct: "2.8",
        roi: {
          appreciation: 8.5,
          yield: 2.8,
          irr: 11.3,
          scenarios: { bull: 13.2, base: 8.5, bear: 5.8 }
        },
        unitNumber: "A-1205",
        createdAt: new Date(),
      }
    ];

    units.forEach(unit => {
      this.units.set(unit.id, unit);
    });

    // Initialize market stats
    const marketStats = [
      {
        id: "market-bangalore-2024-08",
        geo: "Bangalore",
        geoType: "city" as const,
        period: "2024-08",
        medianPrice: "6850.00",
        qoqPct: "3.2",
        yoyPct: "12.5",
        inventoryIndex: "125.5",
        pricePerSqft: "6850.00",
        absorptionRate: "15.8",
        newLaunches: 25,
        createdAt: new Date(),
      },
      {
        id: "market-mumbai-2024-08",
        geo: "Mumbai",
        geoType: "city" as const,
        period: "2024-08",
        medianPrice: "15200.00",
        qoqPct: "2.8",
        yoyPct: "8.9",
        inventoryIndex: "98.2",
        pricePerSqft: "15200.00",
        absorptionRate: "12.3",
        newLaunches: 18,
        createdAt: new Date(),
      }
    ];

    marketStats.forEach(stat => {
      this.marketStats.set(stat.id, stat);
    });
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt: new Date(), 
      phone: insertUser.phone || null,
      preferences: insertUser.preferences || null
    };
    this.users.set(id, user);
    return user;
  }

  // Builder methods
  async getBuilder(id: string): Promise<Builder | undefined> {
    return this.builders.get(id);
  }

  async getBuilders(filters?: { verified?: boolean }): Promise<Builder[]> {
    let builders = Array.from(this.builders.values());
    
    if (filters?.verified !== undefined) {
      builders = builders.filter(b => b.verified === filters.verified);
    }
    
    return builders.sort((a, b) => Number(b.rating) - Number(a.rating));
  }

  async createBuilder(builder: InsertBuilder): Promise<Builder> {
    const id = randomUUID();
    const newBuilder: Builder = { 
      ...builder, 
      id, 
      createdAt: new Date(),
      description: builder.description || null,
      verified: builder.verified || null,
      reraIds: builder.reraIds || null,
      inventoryFreshnessHours: builder.inventoryFreshnessHours || null,
      slaResponseMinutes: builder.slaResponseMinutes || null,
      contact: builder.contact || null,
      rating: builder.rating || null,
      projectCount: builder.projectCount || null,
      logo: builder.logo || null
    };
    this.builders.set(id, newBuilder);
    return newBuilder;
  }

  async updateBuilder(id: string, updates: Partial<Builder>): Promise<Builder | undefined> {
    const existing = this.builders.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updates };
    this.builders.set(id, updated);
    return updated;
  }

  // Project methods
  async getProject(id: string): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async getProjects(filters?: SearchFilters): Promise<Project[]> {
    let projects = Array.from(this.projects.values());

    if (filters?.city) {
      projects = projects.filter(p => p.city.toLowerCase().includes(filters.city!.toLowerCase()));
    }

    if (filters?.locality) {
      projects = projects.filter(p => p.locality.toLowerCase().includes(filters.locality!.toLowerCase()));
    }

    if (filters?.budget) {
      projects = projects.filter(p => {
        const { min, max } = filters.budget!;
        return (!min || p.priceBand.min >= min) && (!max || p.priceBand.max <= max);
      });
    }

    if (filters?.status?.length) {
      projects = projects.filter(p => filters.status!.includes(p.status));
    }

    if (filters?.verified) {
      projects = projects.filter(p => (p.credibilityScore || 0) >= 80);
    }

    if (filters?.reraApproved) {
      projects = projects.filter(p => p.reraId !== null);
    }

    if (filters?.credibilityMin) {
      projects = projects.filter(p => (p.credibilityScore || 0) >= filters.credibilityMin!);
    }

    return projects.sort((a, b) => (b.credibilityScore || 0) - (a.credibilityScore || 0));
  }

  async getProjectsByBuilder(builderId: string): Promise<Project[]> {
    return Array.from(this.projects.values()).filter(p => p.builderId === builderId);
  }

  async createProject(project: InsertProject): Promise<Project> {
    const id = randomUUID();
    const newProject: Project = { 
      ...project, 
      id, 
      createdAt: new Date(),
      lastVerified: new Date(),
      description: project.description || null,
      reraId: project.reraId || null,
      lat: project.lat || null,
      lng: project.lng || null,
      possessionDate: project.possessionDate || null,
      amenities: project.amenities || null,
      connectivity: project.connectivity || null,
      media: project.media || null,
      credibilityScore: project.credibilityScore || null,
      sources: project.sources || null,
      highlights: project.highlights || null,
      floorPlans: project.floorPlans || null
    };
    this.projects.set(id, newProject);
    return newProject;
  }

  async updateProject(id: string, updates: Partial<Project>): Promise<Project | undefined> {
    const existing = this.projects.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updates };
    this.projects.set(id, updated);
    return updated;
  }

  // Unit methods
  async getUnit(id: string): Promise<Unit | undefined> {
    return this.units.get(id);
  }

  async getUnitsByProject(projectId: string): Promise<Unit[]> {
    return Array.from(this.units.values()).filter(u => u.projectId === projectId);
  }

  async createUnit(unit: InsertUnit): Promise<Unit> {
    const id = randomUUID();
    const newUnit: Unit = { 
      ...unit, 
      id, 
      createdAt: new Date(),
      facing: unit.facing || null,
      floor: unit.floor || null,
      inventoryStatus: unit.inventoryStatus || null,
      avm: unit.avm || null,
      rentYieldPct: unit.rentYieldPct || null,
      roi: unit.roi || null,
      unitNumber: unit.unitNumber || null
    };
    this.units.set(id, newUnit);
    return newUnit;
  }

  // Offer methods
  async getOffersByBuilder(builderId: string): Promise<Offer[]> {
    return Array.from(this.offers.values()).filter(o => o.builderId === builderId);
  }

  async getOffersByProject(projectId: string): Promise<Offer[]> {
    return Array.from(this.offers.values()).filter(o => o.projectId === projectId);
  }

  async createOffer(offer: InsertOffer): Promise<Offer> {
    const id = randomUUID();
    const newOffer: Offer = { 
      ...offer, 
      id, 
      createdAt: new Date(),
      visibility: offer.visibility || null,
      projectId: offer.projectId || null,
      tnc: offer.tnc || null,
      discountPct: offer.discountPct || null
    };
    this.offers.set(id, newOffer);
    return newOffer;
  }

  // Market Stats methods
  async getMarketStats(geo: string, geoType: string): Promise<MarketStat[]> {
    return Array.from(this.marketStats.values())
      .filter(s => s.geo === geo && s.geoType === geoType)
      .sort((a, b) => a.period.localeCompare(b.period));
  }

  async createMarketStat(stat: InsertMarketStat): Promise<MarketStat> {
    const id = randomUUID();
    const newStat: MarketStat = { 
      ...stat, 
      id, 
      createdAt: new Date(),
      qoqPct: stat.qoqPct || null,
      yoyPct: stat.yoyPct || null,
      inventoryIndex: stat.inventoryIndex || null,
      pricePerSqft: stat.pricePerSqft || null,
      absorptionRate: stat.absorptionRate || null,
      newLaunches: stat.newLaunches || null
    };
    this.marketStats.set(id, newStat);
    return newStat;
  }

  // Legal Docs methods
  async getLegalDocsByProject(projectId: string): Promise<LegalDoc[]> {
    return Array.from(this.legalDocs.values()).filter(d => d.projectId === projectId);
  }

  async createLegalDoc(doc: InsertLegalDoc): Promise<LegalDoc> {
    const id = randomUUID();
    const newDoc: LegalDoc = { 
      ...doc, 
      id, 
      createdAt: new Date(),
      summary: doc.summary || null,
      verified: doc.verified || null,
      ocrText: doc.ocrText || null,
      riskFlags: doc.riskFlags || null
    };
    this.legalDocs.set(id, newDoc);
    return newDoc;
  }

  // Lead methods
  async createLead(lead: InsertLead): Promise<Lead> {
    const id = randomUUID();
    const newLead: Lead = { 
      ...lead, 
      id, 
      createdAt: new Date(),
      userId: lead.userId || null,
      projectId: lead.projectId || null,
      builderId: lead.builderId || null,
      stage: lead.stage || null,
      preferences: lead.preferences || null,
      channel: lead.channel || null,
      notes: lead.notes || null,
      contactInfo: lead.contactInfo || null
    };
    this.leads.set(id, newLead);
    return newLead;
  }

  async getLeadsByUser(userId: string): Promise<Lead[]> {
    return Array.from(this.leads.values()).filter(l => l.userId === userId);
  }

  // AI Chat History methods
  async createAiChatHistory(chat: InsertAiChatHistory): Promise<AiChatHistory> {
    const id = randomUUID();
    const newChat: AiChatHistory = { 
      ...chat, 
      id, 
      createdAt: new Date(),
      context: chat.context || null,
      userId: chat.userId || null
    };
    this.aiChatHistory.set(id, newChat);
    return newChat;
  }

  async getAiChatHistory(sessionId: string): Promise<AiChatHistory[]> {
    return Array.from(this.aiChatHistory.values())
      .filter(c => c.sessionId === sessionId)
      .sort((a, b) => (a.createdAt?.getTime() || 0) - (b.createdAt?.getTime() || 0));
  }

  // Search and aggregation methods
  async searchProperties(query: string, filters?: SearchFilters): Promise<Project[]> {
    let projects = Array.from(this.projects.values());

    // Text search
    if (query.trim()) {
      const searchTerm = query.toLowerCase();
      projects = projects.filter(p => 
        p.name.toLowerCase().includes(searchTerm) ||
        p.locality.toLowerCase().includes(searchTerm) ||
        p.city.toLowerCase().includes(searchTerm) ||
        p.description?.toLowerCase().includes(searchTerm)
      );
    }

    // Apply filters
    if (filters) {
      return this.getProjects(filters);
    }

    return projects.sort((a, b) => (b.credibilityScore || 0) - (a.credibilityScore || 0));
  }

  async getFeaturedProjects(limit = 10): Promise<Project[]> {
    return Array.from(this.projects.values())
      .sort((a, b) => (b.credibilityScore || 0) - (a.credibilityScore || 0))
      .slice(0, limit);
  }

  async getTrendingLocalities(city: string): Promise<string[]> {
    const projects = Array.from(this.projects.values()).filter(p => p.city === city);
    const localityCount = new Map<string, number>();
    
    projects.forEach(p => {
      localityCount.set(p.locality, (localityCount.get(p.locality) || 0) + 1);
    });

    return Array.from(localityCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([locality]) => locality);
  }

  async getOffersByBuilder(builderId: string): Promise<Offer[]> {
    return Object.values(this.offers).filter(offer => offer.builderId === builderId);
  }

  async getProjectsByBuilder(builderId: string): Promise<Project[]> {
    return Object.values(this.projects).filter(project => project.builderId === builderId);
  }

  async updateBuilder(id: string, updates: Partial<Builder>): Promise<Builder | null> {
    const builder = this.builders[id];
    if (!builder) return null;
    
    const updatedBuilder = { ...builder, ...updates };
    this.builders[id] = updatedBuilder;
    return updatedBuilder;
  }

  async updateProject(id: string, updates: Partial<Project>): Promise<Project | null> {
    const project = this.projects[id];
    if (!project) return null;
    
    const updatedProject = { ...project, ...updates };
    this.projects[id] = updatedProject;
    return updatedProject;
  }
}

export const storage = new MemStorage();
