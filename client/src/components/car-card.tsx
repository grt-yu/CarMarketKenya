import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MessageCircle, Gauge, Fuel, Settings, MapPin, Star, Eye } from "lucide-react";
import { formatPrice, formatNumber } from "@/lib/constants";
import type { CarWithSeller } from "@/lib/types";

interface CarCardProps {
  car: CarWithSeller;
  onFavoriteToggle?: (carId: number, isFavorite: boolean) => void;
  onMessage?: (sellerId: number, carId: number) => void;
}

export default function CarCard({ car, onFavoriteToggle, onMessage }: CarCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newFavoriteState = !isFavorite;
    setIsFavorite(newFavoriteState);
    onFavoriteToggle?.(car.id, newFavoriteState);
  };

  const handleMessageClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onMessage?.(car.sellerId, car.id);
  };

  const mainImage = car.images?.[0] || "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250";
  
  const sellerIconBg = car.seller.userType === "dealer" 
    ? "bg-primary" 
    : car.seller.userType === "broker" 
    ? "bg-secondary" 
    : "bg-accent";

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 group">
      <div className="relative">
        <Link href={`/cars/${car.id}`}>
          <img 
            src={mainImage}
            alt={car.title}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </Link>
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {car.isFeatured && (
            <Badge className="bg-accent text-white">Featured</Badge>
          )}
          {car.isPremium && (
            <Badge className="bg-secondary text-white">Premium</Badge>
          )}
        </div>
        
        {/* Favorite Button */}
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-3 right-3 bg-white/90 hover:bg-white"
          onClick={handleFavoriteClick}
        >
          <Heart className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-neutral-600'}`} />
        </Button>
      </div>
      
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-2">
          <Link href={`/cars/${car.id}`}>
            <h3 className="text-lg font-semibold text-neutral-900 hover:text-primary transition-colors line-clamp-1">
              {car.title}
            </h3>
          </Link>
          <span className="text-lg font-bold text-primary ml-2">
            {formatPrice(parseFloat(car.price))}
          </span>
        </div>
        
        {/* Car Details */}
        <div className="grid grid-cols-3 gap-4 text-sm text-neutral-600 mb-4">
          <div className="flex items-center">
            <Gauge className="h-4 w-4 mr-1" />
            <span>{formatNumber(car.mileage)} km</span>
          </div>
          <div className="flex items-center">
            <Fuel className="h-4 w-4 mr-1" />
            <span>{car.fuelType}</span>
          </div>
          <div className="flex items-center">
            <Settings className="h-4 w-4 mr-1" />
            <span>{car.transmission}</span>
          </div>
        </div>
        
        {/* Seller Info */}
        <div className="flex items-center justify-between mb-4">
          <Link href={`/profile/${car.sellerId}`}>
            <div className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <Avatar className="h-8 w-8">
                <AvatarImage src={car.seller.profileImage} />
                <AvatarFallback className={sellerIconBg}>
                  {car.seller.firstName[0]}{car.seller.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="text-sm font-medium">
                  {car.seller.firstName} {car.seller.lastName}
                </div>
                <div className="flex items-center">
                  {car.seller.isVerified && (
                    <Badge variant="outline" className="text-xs mr-2">Verified</Badge>
                  )}
                  {parseFloat(car.seller.rating) > 0 && (
                    <div className="flex items-center text-xs">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                      <span>{car.seller.rating}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Link>
          
          <div className="flex items-center text-xs text-neutral-500">
            <MapPin className="h-3 w-3 mr-1" />
            {car.location}
          </div>
        </div>
        
        {/* View Count */}
        {car.viewCount > 0 && (
          <div className="flex items-center text-xs text-neutral-500 mb-4">
            <Eye className="h-3 w-3 mr-1" />
            {formatNumber(car.viewCount)} views
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="flex space-x-2">
          <Button asChild className="flex-1">
            <Link href={`/cars/${car.id}`}>
              View Details
            </Link>
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleMessageClick}
          >
            <MessageCircle className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
