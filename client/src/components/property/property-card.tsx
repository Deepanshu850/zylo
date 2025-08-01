import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, BedDouble, Bath, Square, TrendingUp, Star, Shield } from "lucide-react";
import { Link } from "wouter";

interface PropertyCardProps {
  property: {
    id: string;
    name: string;
    locality: string;
    city: string;
    priceBand: {
      min: number;
      max: number;
      currency: string;
    };
    status: string;
    credibilityScore?: number;
    reraId?: string;
    media?: Array<{ url: string; type: string }>;
    highlights?: string[];
  };
  onCompare?: (propertyId: string) => void;
  isSelected?: boolean;
}

export default function PropertyCard({ property, onCompare, isSelected }: PropertyCardProps) {
  const formatPrice = (price: number) => {
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(1)}Cr`;
    } else if (price >= 100000) {
      return `₹${(price / 100000).toFixed(0)}L`;
    }
    return `₹${price.toLocaleString()}`;
  };

  const credibilityColor = (score?: number) => {
    if (!score) return "text-gray-500";
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <Card className={`group hover:shadow-lg transition-shadow ${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
      <CardContent className="p-0">
        {/* Image */}
        <div className="relative h-48 bg-gray-200 dark:bg-gray-800 overflow-hidden rounded-t-lg">
          {property.media?.[0] ? (
            <img 
              src={property.media[0].url} 
              alt={property.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <Square className="h-12 w-12" />
            </div>
          )}
          
          {/* Status Badge */}
          <div className="absolute top-3 left-3">
            <Badge variant={property.status === 'ready' ? 'default' : 'secondary'}>
              {property.status.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>

          {/* RERA Badge */}
          {property.reraId && (
            <div className="absolute top-3 right-3">
              <Badge variant="default" className="bg-green-600">
                <Shield className="h-3 w-3 mr-1" />
                RERA
              </Badge>
            </div>
          )}

          {/* Compare button */}
          {onCompare && (
            <div className="absolute bottom-3 right-3">
              <Button
                size="sm"
                variant={isSelected ? "default" : "secondary"}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onCompare(property.id);
                }}
              >
                {isSelected ? "Selected" : "Compare"}
              </Button>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Title and Location */}
          <div className="mb-3">
            <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-1 line-clamp-1">
              {property.name}
            </h3>
            <div className="flex items-center text-gray-600 dark:text-gray-300 text-sm">
              <MapPin className="h-4 w-4 mr-1" />
              <span>{property.locality}, {property.city}</span>
            </div>
          </div>

          {/* Price */}
          <div className="mb-3">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {formatPrice(property.priceBand.min)} - {formatPrice(property.priceBand.max)}
            </div>
            <div className="text-sm text-gray-500">Starting price</div>
          </div>

          {/* Credibility Score */}
          {property.credibilityScore && (
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-medium">Credibility Score</span>
              <div className="flex items-center">
                <div className={`text-sm font-bold ${credibilityColor(property.credibilityScore)}`}>
                  {property.credibilityScore}%
                </div>
                <Star className="h-4 w-4 ml-1 text-yellow-500" />
              </div>
            </div>
          )}

          {/* Highlights */}
          {property.highlights && property.highlights.length > 0 && (
            <div className="mb-4">
              <div className="flex flex-wrap gap-1">
                {property.highlights.slice(0, 3).map((highlight, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {highlight}
                  </Badge>
                ))}
                {property.highlights.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{property.highlights.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Action Button */}
          <Link href={`/property/${property.id}`}>
            <Button className="w-full">
              View Details
              <TrendingUp className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}