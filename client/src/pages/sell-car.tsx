import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertCircle, Car } from "lucide-react";
import CarForm from "@/components/car-form";
import { apiRequest } from "@/lib/queryClient";
import type { InsertCar } from "@shared/schema";

export default function SellCar() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<Partial<InsertCar>>({});

  const createCarMutation = useMutation({
    mutationFn: async (carData: InsertCar) => {
      const response = await apiRequest("POST", "/api/cars", carData);
      return response.json();
    },
    onSuccess: (newCar) => {
      queryClient.invalidateQueries({ queryKey: ["/api/cars"] });
      setLocation(`/cars/${newCar.id}`);
    },
  });

  const handleSubmit = (carData: InsertCar) => {
    createCarMutation.mutate(carData);
  };

  const benefits = [
    {
      icon: CheckCircle,
      title: "Reach Thousands of Buyers",
      description: "Your listing will be visible to thousands of potential buyers across Kenya."
    },
    {
      icon: CheckCircle,
      title: "Secure Transactions",
      description: "All payments are processed securely through M-Pesa and other trusted methods."
    },
    {
      icon: CheckCircle,
      title: "Verified Buyer Network",
      description: "Connect with verified buyers who are serious about purchasing."
    },
    {
      icon: CheckCircle,
      title: "Professional Support",
      description: "Get help from our team throughout the selling process."
    }
  ];

  const sellingTips = [
    "Take high-quality photos from multiple angles",
    "Write a detailed and honest description",
    "Set a competitive price based on market research",
    "Be responsive to buyer inquiries",
    "Keep all vehicle documents ready",
    "Consider professional inspection reports"
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Car className="h-12 w-12 text-primary mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-neutral-900 mb-4">Sell Your Car</h1>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            List your car on Kenya's premier automotive marketplace and reach thousands of verified buyers.
          </p>
        </div>

        {/* Error Alert */}
        {createCarMutation.error && (
          <Alert className="mb-6 border-destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to create car listing. Please check your information and try again.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Car Details</CardTitle>
              </CardHeader>
              <CardContent>
                <CarForm
                  onSubmit={handleSubmit}
                  isLoading={createCarMutation.isPending}
                  initialData={formData}
                  onDataChange={setFormData}
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Benefits */}
            <Card>
              <CardHeader>
                <CardTitle>Why Sell on CarHub?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <benefit.icon className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-sm">{benefit.title}</div>
                      <div className="text-xs text-neutral-600 mt-1">
                        {benefit.description}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Selling Tips */}
            <Card>
              <CardHeader>
                <CardTitle>Selling Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {sellingTips.map((tip, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Pricing Information */}
            <Card>
              <CardHeader>
                <CardTitle>Listing Packages</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border rounded-lg p-4">
                  <div className="font-medium">Basic Listing</div>
                  <div className="text-2xl font-bold text-primary">Free</div>
                  <div className="text-sm text-neutral-600 mt-2">
                    • 30 days visibility
                    • Basic support
                    • Standard placement
                  </div>
                </div>
                
                <div className="border rounded-lg p-4 border-secondary bg-secondary/5">
                  <div className="font-medium">Premium Listing</div>
                  <div className="text-2xl font-bold text-secondary">KSh 2,500</div>
                  <div className="text-sm text-neutral-600 mt-2">
                    • 60 days visibility
                    • Featured placement
                    • Priority support
                    • Promoted in search
                  </div>
                  <Button variant="outline" size="sm" className="w-full mt-3">
                    Upgrade After Listing
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
