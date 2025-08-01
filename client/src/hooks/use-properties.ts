import { useQuery } from "@tanstack/react-query";
import type { Project, SearchFilters } from "@shared/schema";

interface PropertiesResponse {
  properties: Project[];
  total: number;
}

export function useProperties(filters?: SearchFilters) {
  return useQuery({
    queryKey: ['/api/properties', filters],
    enabled: true,
  });
}

export function useFeaturedProperties(limit?: number) {
  return useQuery<PropertiesResponse>({
    queryKey: ['/api/properties/featured', limit],
    enabled: true,
  });
}

export function useProperty(id: string) {
  return useQuery({
    queryKey: ['/api/properties', id],
    enabled: !!id,
  });
}

export function useSearchProperties(query: string, filters?: SearchFilters) {
  return useQuery<PropertiesResponse>({
    queryKey: ['/api/properties/search', { q: query, ...filters }],
    enabled: query.length > 0 || Object.keys(filters || {}).length > 0,
  });
}

export function useTrendingLocalities(city: string) {
  return useQuery<{ localities: string[] }>({
    queryKey: ['/api/market/trending', city],
    enabled: !!city,
  });
}

export function useBuilders(filters?: { verified?: boolean }) {
  return useQuery({
    queryKey: ['/api/builders', filters?.verified ? 'verified' : 'all'],
    enabled: true,
  });
}

export function useBuilder(id: string) {
  return useQuery({
    queryKey: ['/api/builders', id],
    enabled: !!id,
  });
}

export function useMarketStats(geo: string, geoType: string) {
  return useQuery({
    queryKey: ['/api/market/stats', geo, geoType],
    enabled: !!geo && !!geoType,
  });
}

export function useUnits(projectId: string) {
  return useQuery({
    queryKey: ['/api/properties', projectId, 'units'],
    enabled: !!projectId,
  });
}

export function useUnit(id: string) {
  return useQuery({
    queryKey: ['/api/units', id],
    enabled: !!id,
  });
}
