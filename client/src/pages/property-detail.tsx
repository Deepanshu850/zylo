import { useState } from "react";
import { Link, useParams } from "wouter";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  Heart, 
  Share2, 
  MapPin, 
  Calendar, 
  Building2, 
  CheckCircle, 
  Phone, 
  MessageCircle,
  Download,
  Shield,
  TrendingUp,
  Calculator,
  Eye,
  Clock,
  Star,
  Users,
  Wifi,
  Car,
  Trees
} from "lucide-react";
import { useProperty, useUnits } from "@/hooks/use-properties";
import { formatCurrency, formatArea, getCredibilityBadge } from "@/lib/constants";

export default function PropertyDetail() {
  const { id } = useParams<{ id: string }>();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);

  const { data: propertyData, isLoading } = useProperty(id!);
  const { data: unitsData } = useUnits(id!);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-64 bg-gray-200 rounded-lg"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                <div className="h-32 bg-gray-200 rounded"></div>
                <div className="h-48 bg-gray-200 rounded"></div>
              </div>
              <div className="space-y-4">
                <div className="h-24 bg-gray-200 rounded"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!propertyData?.property) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="p-12 text-center">
            <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Property Not Found</h3>
            <p className="text-gray-600 mb-6">
              The property you're looking for doesn't exist or has been removed.
            </p>
            <Link href="/search">
              <Button>Browse Properties</Button>
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  const { property, builder, units, offers } = propertyData;
  const credibilityBadge = getCredibilityBadge(property.credibilityScore);

  const propertyFeatures = [
    { icon: MapPin, label: "Prime Location", value: `${property.locality}, ${property.city}` },
    { icon: Calendar, label: "Possession", value: property.possessionDate ? new Date(property.possessionDate).toLocaleDateString() : "Ready" },
    { icon: Building2, label: "Project Type", value: property.status.replace('_', ' ').toUpperCase() },
    { icon: CheckCircle, label: "RERA ID", value: property.reraId || "Pending" },
  ];

  const amenityIcons: Record<string, any> = {
    "Swimming Pool": Wifi,
    "Gym": Users,
    "Parking": Car,
    "Garden": Trees,
    "Club House": Building2,
    "Security": Shield,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-primary">Home</Link>
            <span>/</span>
            <Link href="/search" className="hover:text-primary">Search</Link>
            <span>/</span>
            <Link href={`/search?city=${property.city}`} className="hover:text-primary">{property.city}</Link>
            <span>/</span>
            <span className="text-gray-900">{property.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">{property.name}</h1>
              <div className="flex items-center space-x-2">
                <div className={`w-8 h-8 bg-${credibilityBadge.color} rounded-full flex items-center justify-center`}>
                  <span className="text-white text-xs font-bold">{property.credibilityScore}</span>
                </div>
                <Badge className={`bg-${credibilityBadge.color} text-white`}>
                  {credibilityBadge.label}
                </Badge>
              </div>
            </div>
            <div className="flex items-center text-gray-600 space-x-4">
              <div className="flex items-center space-x-1">
                <MapPin className="h-4 w-4" />
                <span>{property.locality}, {property.city}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Building2 className="h-4 w-4" />
                <span>By {builder?.name}</span>
                {builder?.verified && <CheckCircle className="h-4 w-4 text-success" />}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 mt-4 lg:mt-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFavorited(!isFavorited)}
              className="flex items-center space-x-2"
            >
              <Heart className={`h-4 w-4 ${isFavorited ? 'fill-red-500 text-red-500' : ''}`} />
              <span>Save</span>
            </Button>
            <Button variant="outline" size="sm" className="flex items-center space-x-2">
              <Share2 className="h-4 w-4" />
              <span>Share</span>
            </Button>
            <Button className="bg-primary hover:bg-primary-dark flex items-center space-x-2">
              <Phone className="h-4 w-4" />
              <span>Contact Builder</span>
            </Button>
          </div>
        </div>

        {/* Image Gallery */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-8">
          <div className="lg:col-span-3">
            <div className="relative h-96 rounded-lg overflow-hidden">
              <img
                src={property.media[activeImageIndex]?.url || "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"}
                alt={property.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4 flex space-x-2">
                {property.reraId && (
                  <Badge className="bg-primary text-white">RERA APPROVED</Badge>
                )}
                <Badge className="bg-success text-white flex items-center">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  VERIFIED
                </Badge>
              </div>
              <div className="absolute bottom-4 right-4">
                <Button variant="secondary" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  Virtual Tour
                </Button>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            {property.media.slice(1, 4).map((media, index) => (
              <div 
                key={index} 
                className="h-28 rounded-lg overflow-hidden cursor-pointer hover:opacity-80"
                onClick={() => setActiveImageIndex(index + 1)}
              >
                <img
                  src={media.url}
                  alt={`${property.name} ${index + 2}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
            {property.media.length > 4 && (
              <div className="h-28 rounded-lg bg-gray-200 flex items-center justify-center cursor-pointer hover:bg-gray-300">
                <span className="text-gray-600 font-medium">+{property.media.length - 4} more</span>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="units">Units ({units?.length || 0})</TabsTrigger>
                <TabsTrigger value="amenities">Amenities</TabsTrigger>
                <TabsTrigger value="location">Location</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* Price Band */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      <span>Price Range</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-4">
                      <div>
                        <div className="text-2xl font-bold text-gray-900">
                          {formatCurrency(property.priceBand.min)} - {formatCurrency(property.priceBand.max)}
                        </div>
                        <div className="text-gray-600">Starting price</div>
                      </div>
                      <Badge className="bg-success/10 text-success">
                        Market competitive
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Key Features */}
                <Card>
                  <CardHeader>
                    <CardTitle>Key Features</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-6">
                      {propertyFeatures.map((feature, index) => (
                        <div key={index} className="flex items-center space-x-3">
                          <feature.icon className="h-5 w-5 text-primary" />
                          <div>
                            <div className="font-medium text-gray-900">{feature.label}</div>
                            <div className="text-gray-600 text-sm">{feature.value}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Description */}
                <Card>
                  <CardHeader>
                    <CardTitle>About This Property</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 leading-relaxed">
                      {property.description || "This premium residential project offers modern living with world-class amenities and excellent connectivity. Designed for comfort and convenience, it provides an ideal blend of luxury and functionality."}
                    </p>
                    {property.highlights && property.highlights.length > 0 && (
                      <div className="mt-4">
                        <h4 className="font-medium text-gray-900 mb-2">Highlights</h4>
                        <div className="flex flex-wrap gap-2">
                          {property.highlights.map((highlight, index) => (
                            <Badge key={index} variant="secondary">{highlight}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="units" className="space-y-4">
                {units?.length ? (
                  units.map((unit) => (
                    <Card key={unit.id}>
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-lg font-semibold">{unit.bhk} BHK Apartment</h3>
                              <Badge 
                                className={unit.inventoryStatus === 'available' ? 'bg-success text-white' : 'bg-warning text-white'}
                              >
                                {unit.inventoryStatus.toUpperCase()}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-3 gap-4 text-sm">
                              <div>
                                <div className="text-gray-600">Carpet Area</div>
                                <div className="font-medium">{formatArea(Number(unit.carpet))}</div>
                              </div>
                              <div>
                                <div className="text-gray-600">Floor</div>
                                <div className="font-medium">{unit.floor || 'Various'}</div>
                              </div>
                              <div>
                                <div className="text-gray-600">Facing</div>
                                <div className="font-medium">{unit.facing || 'Various'}</div>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-gray-900">
                              {formatCurrency(Number(unit.price))}
                            </div>
                            <div className="text-gray-600 text-sm">
                              ₹{Math.round(Number(unit.price) / Number(unit.carpet)).toLocaleString()}/sq.ft
                            </div>
                            {unit.avm && (
                              <div className="text-xs text-gray-500 mt-1">
                                AVM: {formatCurrency(unit.avm.fairValue)}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card className="p-12 text-center">
                    <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">Unit details will be available soon.</p>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="amenities" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Project Amenities</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                      {property.amenities?.map((amenity, index) => {
                        const IconComponent = amenityIcons[amenity] || CheckCircle;
                        return (
                          <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                            <IconComponent className="h-5 w-5 text-primary" />
                            <span className="text-gray-900">{amenity}</span>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="location" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Location & Connectivity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 bg-gray-200 rounded-lg flex items-center justify-center mb-6">
                      <div className="text-center">
                        <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-600">Interactive map will load here</p>
                      </div>
                    </div>
                    
                    {property.connectivity && (
                      <div className="grid grid-cols-2 gap-6">
                        {property.connectivity.metroKm && (
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-blue-600 text-xs font-bold">M</span>
                            </div>
                            <div>
                              <div className="font-medium">Nearest Metro</div>
                              <div className="text-gray-600 text-sm">{property.connectivity.metroKm} km away</div>
                            </div>
                          </div>
                        )}
                        
                        {property.connectivity.airportKm && (
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                              <span className="text-green-600 text-xs font-bold">✈</span>
                            </div>
                            <div>
                              <div className="font-medium">Airport</div>
                              <div className="text-gray-600 text-sm">{property.connectivity.airportKm} km away</div>
                            </div>
                          </div>
                        )}
                        
                        {property.connectivity.it_hubKm && (
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                              <span className="text-purple-600 text-xs font-bold">IT</span>
                            </div>
                            <div>
                              <div className="font-medium">IT Hub</div>
                              <div className="text-gray-600 text-sm">{property.connectivity.it_hubKm} km away</div>
                            </div>
                          </div>
                        )}
                        
                        {property.connectivity.railwayKm && (
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                              <span className="text-orange-600 text-xs font-bold">🚊</span>
                            </div>
                            <div>
                              <div className="font-medium">Railway Station</div>
                              <div className="text-gray-600 text-sm">{property.connectivity.railwayKm} km away</div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Builder Info */}
            {builder && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Building2 className="h-5 w-5" />
                    <span>Builder Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-gray-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{builder.name}</div>
                      <div className="flex items-center space-x-2">
                        <div className="flex text-warning">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`h-3 w-3 ${i < Math.floor(Number(builder.rating)) ? 'fill-current' : ''}`} />
                          ))}
                        </div>
                        <span className="text-sm text-gray-600">({builder.rating})</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Projects</span>
                      <span className="font-medium">{builder.projectCount}+</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Response Time</span>
                      <span className="font-medium">{builder.slaResponseMinutes} min</span>
                    </div>
                    {builder.verified && (
                      <div className="flex items-center text-success">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        <span>Verified Builder</span>
                      </div>
                    )}
                  </div>

                  <Separator className="my-4" />

                  <div className="space-y-2">
                    <Button className="w-full bg-primary hover:bg-primary-dark">
                      <Phone className="h-4 w-4 mr-2" />
                      Call Builder
                    </Button>
                    <Button variant="outline" className="w-full">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      WhatsApp
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Calculator className="h-4 w-4 mr-2" />
                  EMI Calculator
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Download className="h-4 w-4 mr-2" />
                  Download Brochure
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Site Visit
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Eye className="h-4 w-4 mr-2" />
                  Virtual Tour
                </Button>
              </CardContent>
            </Card>

            {/* Offers */}
            {offers && offers.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-success">Special Offers</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {offers.map((offer) => (
                    <div key={offer.id} className="border border-success/20 rounded-lg p-3">
                      <div className="font-medium text-gray-900">{offer.title}</div>
                      <div className="text-sm text-gray-600 mt-1">{offer.details}</div>
                      <div className="flex items-center justify-between mt-2">
                        <Badge className="bg-success text-white text-xs">
                          {offer.type.toUpperCase()}
                        </Badge>
                        <div className="text-xs text-gray-500">
                          Valid till {new Date(offer.validTill).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Last Updated */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="h-4 w-4 mr-2" />
                  <span>Last updated: {new Date(property.lastVerified).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
