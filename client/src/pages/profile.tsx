import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User, MapPin, Calendar, Star, CheckCircle, 
  Car, MessageCircle, Phone, AlertCircle 
} from "lucide-react";
import CarCard from "@/components/car-card";
import { formatDate, formatNumber } from "@/lib/constants";
import type { CarWithSeller, ReviewWithUser } from "@/lib/types";

export default function Profile() {
  const { id } = useParams();

  const { data: user, isLoading: userLoading, error } = useQuery({
    queryKey: [`/api/users/${id}`],
    enabled: !!id,
  });

  const { data: userCars, isLoading: carsLoading } = useQuery({
    queryKey: ["/api/cars", { sellerId: id }],
    enabled: !!id,
    queryFn: async () => {
      const response = await fetch(`/api/cars?sellerId=${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch user cars");
      }
      return response.json();
    },
  });

  const { data: reviews, isLoading: reviewsLoading } = useQuery({
    queryKey: [`/api/reviews/${id}`],
    enabled: !!id,
  });

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-destructive mb-4">User Not Found</h2>
            <p className="text-neutral-600 mb-4">
              The user profile you're looking for doesn't exist.
            </p>
            <Button onClick={() => window.history.back()}>
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (userLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Skeleton className="h-20 w-20 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-64 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const userRating = parseFloat(user?.rating || "0");
  const cars = userCars?.cars || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Profile Header */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user?.profileImage} />
                <AvatarFallback className="bg-primary text-white text-2xl">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 space-y-3">
                <div>
                  <h1 className="text-2xl font-bold text-neutral-900">
                    {user?.firstName} {user?.lastName}
                  </h1>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="capitalize">
                      {user?.userType?.replace('_', ' ') || 'Individual'}
                    </Badge>
                    {user?.isVerified && (
                      <Badge className="bg-accent text-white">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-600">
                  {user?.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {user.location}
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Joined {formatDate(user?.createdAt)}
                  </div>
                  {userRating > 0 && (
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span>{user.rating}</span>
                      <span className="text-neutral-500">
                        ({user.totalRatings} reviews)
                      </span>
                    </div>
                  )}
                </div>

                {user?.bio && (
                  <p className="text-neutral-700 leading-relaxed">
                    {user.bio}
                  </p>
                )}
              </div>
              
              <div className="flex flex-col gap-2">
                <Button>
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
                {user?.phone && (
                  <Button variant="outline" asChild>
                    <a href={`tel:${user.phone}`}>
                      <Phone className="h-4 w-4 mr-2" />
                      Call
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Tabs */}
        <Tabs defaultValue="listings" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="listings">
              Listings ({cars.length})
            </TabsTrigger>
            <TabsTrigger value="reviews">
              Reviews ({reviews?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="about">
              About
            </TabsTrigger>
          </TabsList>

          {/* Listings Tab */}
          <TabsContent value="listings" className="space-y-6">
            {carsLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <Skeleton className="w-full h-48" />
                    <CardContent className="p-6 space-y-3">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-16 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : cars.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Car className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                    No listings yet
                  </h3>
                  <p className="text-neutral-600">
                    This user hasn't listed any cars for sale.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cars.map((car: CarWithSeller) => (
                  <CarCard 
                    key={car.id} 
                    car={car}
                    onFavoriteToggle={(carId, isFavorite) => {
                      console.log("Favorite toggled:", carId, isFavorite);
                    }}
                    onMessage={(sellerId, carId) => {
                      console.log("Message clicked:", sellerId, carId);
                    }}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews" className="space-y-6">
            {reviewsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-6 w-full" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : !reviews || reviews.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Star className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                    No reviews yet
                  </h3>
                  <p className="text-neutral-600">
                    This user hasn't received any reviews yet.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {reviews.map((review: ReviewWithUser) => (
                  <Card key={review.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={review.reviewer.profileImage} />
                          <AvatarFallback>
                            {review.reviewer.firstName[0]}{review.reviewer.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <div className="font-medium">
                                {review.reviewer.firstName} {review.reviewer.lastName}
                              </div>
                              <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star 
                                    key={i} 
                                    className={`h-4 w-4 ${
                                      i < review.rating 
                                        ? 'fill-yellow-400 text-yellow-400' 
                                        : 'text-neutral-300'
                                    }`} 
                                  />
                                ))}
                                <span className="ml-2 text-sm text-neutral-600">
                                  {review.rating}/5
                                </span>
                              </div>
                            </div>
                            <span className="text-sm text-neutral-500">
                              {formatDate(review.createdAt)}
                            </span>
                          </div>
                          
                          {review.comment && (
                            <p className="text-neutral-700">{review.comment}</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* About Tab */}
          <TabsContent value="about" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-neutral-700">User Type</label>
                    <p className="capitalize">{user?.userType?.replace('_', ' ') || 'Individual'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-neutral-700">Member Since</label>
                    <p>{formatDate(user?.createdAt)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-neutral-700">Location</label>
                    <p>{user?.location || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-neutral-700">Verification Status</label>
                    <div className="flex items-center gap-2">
                      {user?.isVerified ? (
                        <Badge className="bg-accent text-white">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      ) : (
                        <Badge variant="outline">Not Verified</Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                {user?.bio && (
                  <div>
                    <label className="text-sm font-medium text-neutral-700">About</label>
                    <p className="mt-1 text-neutral-700 leading-relaxed">
                      {user.bio}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Statistics */}
            <Card>
              <CardHeader>
                <CardTitle>Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {cars.length}
                    </div>
                    <div className="text-sm text-neutral-600">Active Listings</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {reviews?.length || 0}
                    </div>
                    <div className="text-sm text-neutral-600">Reviews</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {userRating > 0 ? user.rating : 'N/A'}
                    </div>
                    <div className="text-sm text-neutral-600">Avg Rating</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {formatNumber(
                        cars.reduce((total, car) => total + (car.viewCount || 0), 0)
                      )}
                    </div>
                    <div className="text-sm text-neutral-600">Total Views</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
