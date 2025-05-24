import { CheckCircle, Shield, Smartphone, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MpesaSection() {
  const features = [
    { icon: CheckCircle, text: "Instant payment processing" },
    { icon: Shield, text: "Bank-level security" },
    { icon: Smartphone, text: "Pay from your mobile phone" },
    { icon: Receipt, text: "Instant transaction receipts" },
  ];

  return (
    <section className="py-16 bg-accent text-white">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold">Secure Payments with M-Pesa</h2>
            <p className="text-lg text-green-100">
              Pay for your car listings, premium features, and deposits using M-Pesa, 
              Kenya's most trusted mobile payment platform.
            </p>
            <div className="space-y-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <feature.icon className="h-5 w-5 flex-shrink-0" />
                  <span>{feature.text}</span>
                </div>
              ))}
            </div>
            <Button variant="secondary" className="bg-white text-accent hover:bg-green-50">
              Learn More About Payments
            </Button>
          </div>
          
          <div className="relative">
            <img 
              src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400"
              alt="Mobile payment M-Pesa Kenya" 
              className="rounded-xl shadow-2xl w-full h-auto object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-accent/20 to-transparent rounded-xl"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
