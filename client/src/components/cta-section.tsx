import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Link } from "wouter";

export default function CtaSection() {
  return (
    <section className="py-16 gradient-primary text-white">
      <div className="container mx-auto px-4 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-3xl lg:text-4xl font-bold text-balance">
            Ready to Sell Your Car?
          </h2>
          <p className="text-xl text-blue-100">
            Join thousands of satisfied sellers who've found buyers on CarHub Kenya. 
            List your car today and reach verified buyers instantly.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/sell">
                <Plus className="h-5 w-5 mr-2" />
                List Your Car
              </Link>
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              Learn More
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
