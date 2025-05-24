import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Car, Plus, Eye, Heart, MessageCircle, TrendingUp,
  Settings, User, CreditCard, AlertCircle, Edit, Trash2 
} from "lucide-react";
import { Link } from "wouter";
import CarCard from "@/components/car-card";
import { formatPrice, formatNumber, formatDate } from "@/lib/constants";
import { apiRequest } from "@/lib/queryClient";
import type { CarWithSeller, FavoriteWithCar, Payment } from "@/lib/types";

export default function Dashboard() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");
  
  // Mock user ID - in real app this would come from auth context
  const userId = 1;

  const { data: userCars, isLoading: carsLoading } = useQuery({
    queryKey: ["/api/cars", { sellerId: userId }],
    queryFn: async () => {
      const response = await fetch(`/api/cars?sellerId=${userId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch user cars");
      }
      return response.json();
    },
  });

  const { data: favorites, isLoading: favoritesLoading } = useQuery({
    queryKey: [`/api/favorites/${userId}`],
  });

  const { data: conversations } = useQuery({
    queryKey: [`/api/messages/conversations/${userId}`],
  });

  const { data: payments } = useQuery({
    queryKey: [`/api/payments/${userId}`],
  });

  const deleteCarMutation = useMutation({
    mutationFn: async (carId: number) => {
      return apiRequest("DELETE", `/api/cars/${carId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cars"] });
    },
  });

  const cars = userCars?.cars || [];
  const totalViews = cars.reduce((sum: number, car: CarWithSeller) => sum + (car.viewCount || 0), 0);
  const totalListings = cars.length;
  const activeListings = cars.filter((car: CarWithSeller) => car.isAvailable).length;

  const handleDeleteCar = (carId: number) => {
    if (confirm("Are you sure you want to delete this listing?")) {
      deleteCarMutation.mutate(carId);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">Dashboard</h1>
            <p className="text-neutral-600 mt-1">
              Manage your listings, messages, and account settings
            </p>
          </div>
          <Button asChild>
            <Link href="/sell">
              <Plus className="h-4 w-4 mr-2" />
              List New Car
            </Link>
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="listings">My Listings</TabsTrigger>
            <TabsTrigger value="favorites">Favorites</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-neutral-600">Total Listings</p>
                      <p className="text-2xl font-bold text-primary">{totalListings}</p>
                    </div>
                    <Car className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-neutral-600">Active Listings</p>
                      <p className="text-2xl font-bold text-accent">{activeListings}</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-accent" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-neutral-600">Total Views</p>
                      <p className="text-2xl font-bold text-secondary">{formatNumber(totalViews)}</p>
                    </div>
                    <Eye className="h-8 w-8 text-secondary" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-neutral-600">Favorites</p>
                      <p className="text-2xl font-bold text-pink-600">{favorites?.length || 0}</p>
                    </div>
                    <Heart className="h-8 w-8 text-pink-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Listings</CardTitle>
              </CardHeader>
              <CardContent>
                {carsLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center gap-4 p-4 border rounded-lg animate-pulse">
                        <div className="w-16 h-16 bg-neutral-200 rounded"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-neutral-200 rounded w-1/3"></div>
                          <div className="h-3 bg-neutral-200 rounded w-1/4"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : cars.length === 0 ? (
                  <div className="text-center py-8">
                    <Car className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-neutral-900 mb-2">No listings yet</h3>
                    <p className="text-neutral-600 mb-4">Start by listing your first car</p>
                    <Button asChild>
                      <Link href="/sell">List Your Car</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cars.slice(0, 5).map((car: CarWithSeller) => (
                      <div key={car.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-neutral-50 transition-colors">
                        <img
                          src={car.images?.[0] || "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100"}
                          alt={car.title}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-neutral-900">{car.title}</h4>
                          <p className="text-sm text-neutral-600">{formatPrice(parseFloat(car.price))}</p>
                          <div className="flex items-center gap-4 mt-1 text-xs text-neutral-500">
                            <span>{formatDate(car.createdAt)}</span>
                            <span className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              {formatNumber(car.viewCount || 0)} views
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={car.isAvailable ? "default" : "secondary"}>
                            {car.isAvailable ? "Active" : "Inactive"}
                          </Badge>
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/cars/${car.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Listings Tab */}
          <TabsContent value="listings" className="space-y-6">
            {carsLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse">
                    <div className="w-full h-48 bg-neutral-200"></div>
                    <div className="p-6 space-y-3">
                      <div className="h-6 bg-neutral-200 rounded"></div>
                      <div className="h-4 bg-neutral-200 rounded w-2/3"></div>
                      <div className="h-16 bg-neutral-200 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : cars.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Car className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-neutral-900 mb-2">No listings yet</h3>
                  <p className="text-neutral-600 mb-4">
                    Start selling by creating your first car listing
                  </p>
                  <Button asChild>
                    <Link href="/sell">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Listing
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cars.map((car: CarWithSeller) => (
                  <div key={car.id} className="relative">
                    <CarCard 
                      car={car}
                      onFavoriteToggle={(carId, isFavorite) => {
                        console.log("Favorite toggled:", carId, isFavorite);
                      }}
                      onMessage={(sellerId, carId) => {
                        console.log("Message clicked:", sellerId, carId);
                      }}
                    />
                    {/* Owner Actions */}
                    <div className="absolute top-2 right-2 flex gap-1">
                      <Button variant="ghost" size="sm" className="bg-white/90 hover:bg-white">
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="bg-white/90 hover:bg-white text-destructive hover:text-destructive"
                        onClick={() => handleDeleteCar(car.id)}
                        disabled={deleteCarMutation.isPending}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Favorites Tab */}
          <TabsContent value="favorites" className="space-y-6">
            {favoritesLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse">
                    <div className="w-full h-48 bg-neutral-200"></div>
                    <div className="p-6 space-y-3">
                      <div className="h-6 bg-neutral-200 rounded"></div>
                      <div className="h-4 bg-neutral-200 rounded w-2/3"></div>
                      <div className="h-16 bg-neutral-200 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : !favorites || favorites.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Heart className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-neutral-900 mb-2">No favorites yet</h3>
                  <p className="text-neutral-600 mb-4">
                    Save cars you're interested in to keep track of them
                  </p>
                  <Button asChild>
                    <Link href="/cars">Browse Cars</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favorites.map((favorite: FavoriteWithCar) => (
                  <CarCard 
                    key={favorite.id}
                    car={favorite.car}
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

          {/* Messages Tab */}
          <TabsContent value="messages" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Messages
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!conversations || conversations.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageCircle className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-neutral-900 mb-2">No messages yet</h3>
                    <p className="text-neutral-600">
                      When you start messaging with buyers or sellers, conversations will appear here
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {conversations.map((conversation: any) => (
                      <div key={conversation.user.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-neutral-50 transition-colors cursor-pointer">
                        <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white">
                          {conversation.user.firstName[0]}{conversation.user.lastName[0]}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-neutral-900">
                              {conversation.user.firstName} {conversation.user.lastName}
                            </h4>
                            <span className="text-xs text-neutral-500">
                              {formatDate(conversation.lastMessage.createdAt)}
                            </span>
                          </div>
                          <p className="text-sm text-neutral-600 line-clamp-1">
                            {conversation.lastMessage.content}
                          </p>
                          {conversation.unreadCount > 0 && (
                            <Badge className="mt-1" variant="secondary">
                              {conversation.unreadCount} new
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!payments || payments.length === 0 ? (
                  <div className="text-center py-8">
                    <CreditCard className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-neutral-900 mb-2">No payments yet</h3>
                    <p className="text-neutral-600">
                      Your payment history will appear here when you make transactions
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {payments.map((payment: Payment) => (
                      <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <div className="font-medium text-neutral-900">
                            {payment.purpose.replace('_', ' ')}
                          </div>
                          <div className="text-sm text-neutral-600">
                            {payment.paymentMethod} • {payment.paymentReference}
                          </div>
                          <div className="text-xs text-neutral-500">
                            {formatDate(payment.createdAt)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-lg">
                            {formatPrice(parseFloat(payment.amount))}
                          </div>
                          <Badge variant={payment.status === "completed" ? "default" : "secondary"}>
                            {payment.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
