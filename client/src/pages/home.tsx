import { useQuery } from "@tanstack/react-query";
import HeroSection from "@/components/hero-section";
import TrustIndicators from "@/components/trust-indicators";
import HowItWorks from "@/components/how-it-works";
import MpesaSection from "@/components/mpesa-section";
import BlogSection from "@/components/blog-section";
import CtaSection from "@/components/cta-section";
import CarCard from "@/components/car-card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "wouter";
import type { CarWithSeller } from "@/lib/types";

export default function Home() {
  const { data: featuredCars, isLoading } = useQuery({
    queryKey: ["/api/cars/featured?limit=6"],
  });

  return (
    <div>
      <HeroSection />
      <TrustIndicators />
      
      {/* Featured Cars Section */}
      <section className="py-16 bg-neutral-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-neutral-900 mb-4">Featured Cars</h2>
            <p className="text-neutral-600 max-w-2xl mx-auto">
              Discover our handpicked selection of quality vehicles from verified sellers across Kenya
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
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
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredCars?.map((car: CarWithSeller) => (
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

          <div className="text-center mt-12">
            <Button asChild>
              <Link href="/cars">
                View All Cars <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <HowItWorks />
      <MpesaSection />
      <BlogSection />
      <CtaSection />
    </div>
  );
}
