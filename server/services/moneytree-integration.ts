// MoneyTree Realty API integration service
interface MoneyTreeProperty {
  id: number;
  name: string;
  link: string;
  builder: string;
  location: string[];
  images: string[];
  price: string;
  possession: string;
  area: any;
  type: string[];
  typeDetail: string[];
  rera: string[];
  shortDescription: string | null;
  keywords: string;
  created_at: string;
  updated_at: string;
}

export class MoneyTreeIntegrationService {
  private static readonly API_URL = 'https://moneytreerealty.in/api/properties';

  static async fetchProperties(): Promise<MoneyTreeProperty[]> {
    try {
      const response = await fetch(this.API_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Failed to fetch MoneyTree properties:', error);
      return [];
    }
  }

  static convertToProject(mtProperty: MoneyTreeProperty): any {
    return {
      id: `mt_${mtProperty.id}`,
      name: mtProperty.name,
      builder: mtProperty.builder,
      locality: mtProperty.location[1] || '',
      city: mtProperty.location[0] || '',
      state: this.getStateFromCity(mtProperty.location[0]),
      pincode: mtProperty.location[2] || '',
      address: mtProperty.location[3] || '',
      description: mtProperty.shortDescription || `Luxury ${mtProperty.typeDetail?.join(' & ') || 'residential'} project by ${mtProperty.builder}`,
      priceBand: this.parsePriceRange(mtProperty.price),
      status: this.getProjectStatus(mtProperty.possession),
      possession: {
        timeline: mtProperty.possession || 'Under Construction',
        readyToMove: false
      },
      reraId: mtProperty.rera?.[0] && mtProperty.rera[0] !== '#' ? mtProperty.rera[0] : null,
      reraLink: mtProperty.rera?.[1] || null,
      media: mtProperty.images?.map((img: string) => ({
        url: `https://moneytreerealty.in/${img}`,
        type: 'image'
      })) || [],
      highlights: this.extractHighlights(mtProperty.keywords || ''),
      credibilityScore: this.calculateCredibilityScore(mtProperty),
      createdAt: new Date(mtProperty.created_at),
      updatedAt: new Date(mtProperty.updated_at),
      unitTypes: mtProperty.typeDetail || []
    };
  }

  private static getStateFromCity(city: string): string {
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

  private static parsePriceRange(priceStr: string): { min: number; max: number; currency: string } {
    if (priceStr === 'On Request') {
      return { min: 50000000, max: 200000000, currency: 'INR' }; // 5Cr to 20Cr default
    }
    
    const match = priceStr.match(/Rs\.\s*([\d.]+)\s*Cr/);
    if (match) {
      const price = parseFloat(match[1]) * 10000000; // Convert Cr to rupees
      return { 
        min: Math.floor(price * 0.9), 
        max: Math.floor(price * 1.3), 
        currency: 'INR' 
      };
    }
    
    return { min: 30000000, max: 150000000, currency: 'INR' }; // Default range
  }

  private static getProjectStatus(possession: string): string {
    const currentYear = new Date().getFullYear();
    
    if (possession.includes('2025') && currentYear >= 2025) return 'nearing_completion';
    if (possession.includes('2026')) return 'under_construction';
    if (possession.includes('2027') || possession.includes('2028')) return 'launched';
    if (possession.includes(currentYear.toString())) return 'ready';
    
    return 'under_construction';
  }

  private static calculateCredibilityScore(prop: MoneyTreeProperty): number {
    let score = 60; // Base score
    
    if (prop.rera?.[0] && prop.rera[0] !== '#') score += 20;
    if (prop.images && prop.images.length > 2) score += 10;
    if (prop.price !== 'On Request') score += 5;
    if (prop.builder && prop.builder.length > 0) score += 5;
    
    return Math.min(100, score);
  }

  private static extractHighlights(keywords: string): string[] {
    if (!keywords) return [];
    
    const highlights = [];
    const lowerKeywords = keywords.toLowerCase();
    
    if (lowerKeywords.includes('luxury')) highlights.push('Luxury Project');
    if (lowerKeywords.includes('rera')) highlights.push('RERA Approved');
    if (lowerKeywords.includes('premium')) highlights.push('Premium Location');
    if (lowerKeywords.includes('modern')) highlights.push('Modern Amenities');
    if (lowerKeywords.includes('family')) highlights.push('Family-Friendly');
    if (lowerKeywords.includes('new launch')) highlights.push('New Launch');
    if (lowerKeywords.includes('ready')) highlights.push('Ready to Move');
    
    return highlights.slice(0, 4);
  }

  static parseUnitType(typeDetail: string): string {
    if (typeDetail.includes('1 BHK')) return '1BHK';
    if (typeDetail.includes('2 BHK')) return '2BHK';
    if (typeDetail.includes('3 BHK')) return '3BHK';
    if (typeDetail.includes('4 BHK')) return '4BHK';
    if (typeDetail.includes('5 BHK')) return '5BHK';
    return '2BHK'; // default
  }

  static getCarpetArea(unitType: string): number {
    if (unitType.includes('1 BHK')) return 450 + Math.random() * 150;
    if (unitType.includes('2 BHK')) return 650 + Math.random() * 200;
    if (unitType.includes('3 BHK')) return 950 + Math.random() * 300;
    if (unitType.includes('4 BHK')) return 1400 + Math.random() * 400;
    if (unitType.includes('5 BHK')) return 2000 + Math.random() * 500;
    return 750; // default
  }
}