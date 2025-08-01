export const CITIES = [
  "Mumbai",
  "Delhi NCR", 
  "Bangalore",
  "Chennai",
  "Hyderabad",
  "Pune",
  "Kolkata",
  "Ahmedabad"
];

export const BUDGET_RANGES = [
  { label: "₹25L - ₹50L", min: 2500000, max: 5000000 },
  { label: "₹50L - ₹1Cr", min: 5000000, max: 10000000 },
  { label: "₹1Cr - ₹2Cr", min: 10000000, max: 20000000 },
  { label: "₹2Cr - ₹5Cr", min: 20000000, max: 50000000 },
  { label: "₹5Cr+", min: 50000000, max: null }
];

export const BHK_OPTIONS = [
  { label: "1 BHK", value: 1 },
  { label: "2 BHK", value: 2 },
  { label: "3 BHK", value: 3 },
  { label: "4 BHK", value: 4 },
  { label: "4+ BHK", value: 5 }
];

export const PROPERTY_TYPES = [
  "Apartment",
  "Villa", 
  "Studio",
  "Penthouse",
  "Row House",
  "Builder Floor"
];

export const PROPERTY_STATUS = [
  { label: "Ready to Move", value: "ready" },
  { label: "Under Construction", value: "under_construction" },
  { label: "Launched", value: "launched" }
];

export const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिंदी" },
  { code: "hinglish", label: "Hinglish" }
];

export const TRENDING_LOCALITIES = {
  "Mumbai": ["Bandra West", "Powai", "Thane West", "Kandivali East", "Malad West"],
  "Delhi NCR": ["Gurgaon Sector 84", "Noida Extension", "Greater Noida", "Faridabad", "Dwarka"],
  "Bangalore": ["Whitefield", "Electronic City", "Sarjapur", "Hebbal", "Koramangala"],
  "Chennai": ["OMR Chennai", "Velachery", "Thoraipakkam", "Porur", "Anna Nagar"],
  "Hyderabad": ["Gachibowli", "Hitec City", "Kondapur", "Manikonda", "Tellapur"],
  "Pune": ["Hinjewadi", "Wakad", "Kharadi", "Baner", "Aundh"]
};

export const AMENITIES = [
  "Swimming Pool",
  "Gym",
  "Club House", 
  "Children's Play Area",
  "24/7 Security",
  "Power Backup",
  "Parking",
  "Garden",
  "Jogging Track",
  "Tennis Court",
  "Basketball Court",
  "Lift",
  "CCTV Surveillance",
  "Fire Safety",
  "Rainwater Harvesting",
  "Solar Panels",
  "Waste Management",
  "Senior Citizen Area",
  "Multi-purpose Hall",
  "Guest Rooms"
];

export const CREDIBILITY_THRESHOLDS = {
  EXCELLENT: 90,
  VERY_GOOD: 80,
  GOOD: 70,
  AVERAGE: 60,
  POOR: 0
};

export const CREDIBILITY_COLORS = {
  EXCELLENT: "success",
  VERY_GOOD: "warning", 
  GOOD: "primary",
  AVERAGE: "warning",
  POOR: "destructive"
};

export const SORT_OPTIONS = [
  { label: "Credibility Score", value: "credibility" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Newest First", value: "newest" },
  { label: "Possession Date", value: "possession" }
];

export const ROI_SCENARIOS = {
  BULL: "bull",
  BASE: "base", 
  BEAR: "bear"
};

export const INVESTMENT_PURPOSES = [
  { label: "Investment", value: "investment" },
  { label: "End Use", value: "enduse" }
];

export const URGENCY_LEVELS = [
  { label: "Immediate (Within 1 month)", value: "immediate" },
  { label: "Short term (1-3 months)", value: "short" },
  { label: "Medium term (3-6 months)", value: "medium" },
  { label: "Long term (6+ months)", value: "long" }
];

export const formatCurrency = (amount: number): string => {
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(1)}Cr`;
  } else if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(1)}L`;
  } else {
    return `₹${amount.toLocaleString('en-IN')}`;
  }
};

export const formatArea = (area: number): string => {
  return `${area.toLocaleString('en-IN')} sq.ft`;
};

export const getCredibilityBadge = (score: number): { label: string; color: string } => {
  if (score >= CREDIBILITY_THRESHOLDS.EXCELLENT) {
    return { label: "Excellent", color: "success" };
  } else if (score >= CREDIBILITY_THRESHOLDS.VERY_GOOD) {
    return { label: "Very Good", color: "warning" };
  } else if (score >= CREDIBILITY_THRESHOLDS.GOOD) {
    return { label: "Good", color: "primary" };
  } else if (score >= CREDIBILITY_THRESHOLDS.AVERAGE) {
    return { label: "Average", color: "warning" };
  } else {
    return { label: "Poor", color: "destructive" };
  }
};

export const generateSessionId = (): string => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};
