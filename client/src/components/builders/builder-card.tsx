import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Building2, MapPin, Star, Shield, CheckCircle, Phone, MessageSquare } from "lucide-react";
import { Link } from "wouter";

interface BuilderCardProps {
  builder: {
    id: string;
    name: string;
    description?: string;
    city: string;
    verified: boolean;
    rating: number;
    projectCount: number;
    establishedYear?: number;
    specializations?: string[];
    contactInfo?: {
      phone?: string;
      email?: string;
    };
  };
  showContact?: boolean;
}

export default function BuilderCard({ builder, showContact = false }: BuilderCardProps) {
  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating) 
            ? 'text-yellow-500 fill-current' 
            : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <Card className="group hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <Building2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white flex items-center">
                {builder.name}
                {builder.verified && (
                  <CheckCircle className="h-5 w-5 text-green-500 ml-2" />
                )}
              </h3>
              <div className="flex items-center text-gray-600 dark:text-gray-300 text-sm">
                <MapPin className="h-4 w-4 mr-1" />
                <span>{builder.city}</span>
                {builder.establishedYear && (
                  <span className="ml-2">• Est. {builder.establishedYear}</span>
                )}
              </div>
            </div>
          </div>
          
          {builder.verified && (
            <Badge variant="default" className="bg-green-600">
              <Shield className="h-3 w-3 mr-1" />
              Verified
            </Badge>
          )}
        </div>

        {/* Rating and Projects */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="flex items-center">
              {getRatingStars(builder.rating)}
            </div>
            <span className="text-sm font-medium">{builder.rating.toFixed(1)}</span>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-300">
            {builder.projectCount} projects
          </div>
        </div>

        {/* Description */}
        {builder.description && (
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
            {builder.description}
          </p>
        )}

        {/* Specializations */}
        {builder.specializations && builder.specializations.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-1">
              {builder.specializations.slice(0, 3).map((spec, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {spec}
                </Badge>
              ))}
              {builder.specializations.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{builder.specializations.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Contact Information */}
        {showContact && builder.contactInfo && (
          <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h4 className="font-medium text-sm mb-2">Contact Information</h4>
            {builder.contactInfo.phone && (
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 mb-1">
                <Phone className="h-4 w-4 mr-2" />
                {builder.contactInfo.phone}
              </div>
            )}
            {builder.contactInfo.email && (
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                <MessageSquare className="h-4 w-4 mr-2" />
                {builder.contactInfo.email}
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex space-x-2">
          <Link href={`/builder/${builder.id}`} className="flex-1">
            <Button variant="outline" className="w-full">
              View Projects
            </Button>
          </Link>
          {showContact && (
            <Button className="flex-1">
              <MessageSquare className="h-4 w-4 mr-2" />
              Contact
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}