import { Card } from "@/components/ui/card";
import SearchForm from "@/components/search-form";

export default function HeroSection() {
  return (
    <section className="gradient-primary text-white py-16 lg:py-24">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl lg:text-5xl font-bold leading-tight text-balance">
              Find Your Perfect Car in Kenya
            </h1>
            <p className="text-xl text-blue-100">
              Browse thousands of verified cars from trusted dealers and individuals. 
              Secure payments with M-Pesa integration.
            </p>
            
            {/* Search Form */}
            <Card className="p-6 text-neutral-900 shadow-2xl">
              <SearchForm />
            </Card>
          </div>
          
          <div className="relative">
            <img 
              src="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
              alt="Modern car dealership showroom" 
              className="rounded-xl shadow-2xl w-full h-auto object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
