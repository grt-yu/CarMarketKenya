import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { 
  Heart, MessageCircle, Phone, MapPin, Calendar, Gauge, 
  Fuel, Settings, Car as CarIcon, Eye, Star, Share2,
  CheckCircle, AlertCircle
} from "lucide-react";
import { formatPrice, formatNumber, formatDate } from "@/lib/constants";
import { apiRequest } from "@/lib/queryClient";
import type { CarWithSeller } from "@/lib/types";

export default function CarDetails() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  const { data: car, isLoading, error } = useQuery({
    queryKey: [`/api/cars/${id}`],
    enabled: !!id,
  });

  const favoriteMutation = useMutation({
    mutationFn: async ({ carId, add }: { carId: number; add: boolean }) => {
      if (add) {
        return apiRequest("POST", "/api/favorites", { userId: 1, carId }); // Mock user ID
      } else {
        return apiRequest("DELETE", `/api/favorites/1/${carId}`); // Mock user ID
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
    },
  });

  const handleFavoriteToggle = () => {
    if (!car) return;
    const newFavoriteState = !isFavorite;
    setIsFavorite(newFavoriteState);
    favoriteMutation.mutate({ carId: car.id, add: newFavoriteState });
  };

  const handleMessage = () => {
    if (!car) return;
    setLocation(`/messages?seller=${car.sellerId}&car=${car.id}`);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: car?.title,
          text: `Check out this ${car?.title} for ${formatPrice(parseFloat(car?.price || "0"))}`,
          url: window.location.href,
        });
      } catch (error) {
        console.log("Share failed:", error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      // Could show a toast here
    }
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-destructive mb-4">Car Not Found</h2>
            <p className="text-neutral-600 mb-4">
              The car you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => setLocation("/cars")}>
              Back to Cars
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="w-full h-96 rounded-xl" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
          <div className="space-y-6">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }

  const carData = car as CarWithSeller;
  const images = carData.images?.length ? carData.images : [
    "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
  ];

  const carSpecs = [
    { icon: Calendar, label: "Year", value: carData.year },
    { icon: Gauge, label: "Mileage", value: `${formatNumber(carData.mileage)} km` },
    { icon: Fuel, label: "Fuel Type", value: carData.fuelType },
    { icon: Settings, label: "Transmission", value: carData.transmission },
    { icon: CarIcon, label: "Body Type", value: carData.bodyType },
    { icon: Eye, label: "Views", value: formatNumber(carData.viewCount || 0) },
  ];

  const sellerRating = parseFloat(carData.seller.rating || "0");

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image Gallery */}
          <Card className="overflow-hidden">
            <div className="relative">
              <img
                src={images[selectedImageIndex]}
                alt={carData.title}
                className="w-full h-96 object-cover"
              />
              
              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {carData.isFeatured && (
                  <Badge className="bg-accent text-white">Featured</Badge>
                )}
                {carData.isPremium && (
                  <Badge className="bg-secondary text-white">Premium</Badge>
                )}
                <Badge variant="outline" className="bg-white/90">
                  {carData.condition}
                </Badge>
              </div>

              {/* Actions */}
              <div className="absolute top-4 right-4 flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-white/90 hover:bg-white"
                  onClick={handleFavoriteToggle}
                  disabled={favoriteMutation.isPending}
                >
                  <Heart className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-white/90 hover:bg-white"
                  onClick={handleShare}
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Thumbnail Navigation */}
            {images.length > 1 && (
              <div className="p-4">
                <div className="flex gap-2 overflow-x-auto">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                        index === selectedImageIndex ? 'border-primary' : 'border-neutral-200'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${carData.title} - ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Car Details */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl">{carData.title}</CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    <MapPin className="h-4 w-4 text-neutral-500" />
                    <span className="text-neutral-600">{carData.location}, {carData.county}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-primary">
                    {formatPrice(parseFloat(carData.price))}
                  </div>
                  <div className="text-sm text-neutral-500">
                    Posted {formatDate(carData.createdAt)}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Specifications */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Specifications</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {carSpecs.map((spec, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
                      <spec.icon className="h-5 w-5 text-neutral-600" />
                      <div>
                        <div className="text-sm text-neutral-600">{spec.label}</div>
                        <div className="font-medium">{spec.value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Features */}
              {carData.features && carData.features.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Features</h3>
                  <div className="flex flex-wrap gap-2">
                    {carData.features.map((feature, index) => (
                      <Badge key={index} variant="outline">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Description</h3>
                <p className="text-neutral-700 leading-relaxed whitespace-pre-wrap">
                  {carData.description}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contact Card */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Seller</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Seller Info */}
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={carData.seller.profileImage} />
                  <AvatarFallback className="bg-primary text-white">
                    {carData.seller.firstName[0]}{carData.seller.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="font-semibold">
                    {carData.seller.firstName} {carData.seller.lastName}
                  </div>
                  <div className="text-sm text-neutral-600 capitalize">
                    {carData.seller.userType.replace('_', ' ')}
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    {carData.seller.isVerified && (
                      <Badge variant="outline" className="text-xs">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                    {sellerRating > 0 && (
                      <div className="flex items-center text-xs">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                        <span>{carData.seller.rating}</span>
                        <span className="text-neutral-500 ml-1">
                          ({carData.seller.totalRatings} reviews)
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Contact Actions */}
              <div className="space-y-2">
                <Button 
                  className="w-full" 
                  onClick={handleMessage}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
                
                {carData.seller.phone && (
                  <Button 
                    variant="outline" 
                    className="w-full"
                    asChild
                  >
                    <a href={`tel:${carData.seller.phone}`}>
                      <Phone className="h-4 w-4 mr-2" />
                      {carData.seller.phone}
                    </a>
                  </Button>
                )}
              </div>

              {/* Seller Bio */}
              {carData.seller.bio && (
                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-2">About Seller</h4>
                  <p className="text-sm text-neutral-600">
                    {carData.seller.bio}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Safety Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Safety Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm space-y-2">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                  <span>Meet in a public place for viewing</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                  <span>Inspect the vehicle thoroughly</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                  <span>Verify all documents</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                  <span>Use secure payment methods</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Report Listing */}
          <Card>
            <CardContent className="pt-6">
              <Button variant="outline" size="sm" className="w-full text-destructive border-destructive hover:bg-destructive hover:text-white">
                <AlertCircle className="h-4 w-4 mr-2" />
                Report This Listing
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
