import { Search, MessageCircle, Handshake } from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      icon: Search,
      title: "Search & Browse",
      description: "Browse thousands of verified cars with detailed photos and specifications. Use our advanced filters to find exactly what you're looking for.",
      color: "primary"
    },
    {
      icon: MessageCircle,
      title: "Connect & Negotiate",
      description: "Chat directly with verified sellers through our secure messaging system. Ask questions, request more photos, and negotiate the best price.",
      color: "secondary"
    },
    {
      icon: Handshake,
      title: "Buy Securely",
      description: "Complete your purchase with confidence using M-Pesa and other trusted payment methods. All transactions are protected and secure.",
      color: "accent"
    }
  ];

  const getColorClasses = (color: string) => {
    switch (color) {
      case "primary":
        return "bg-primary text-white";
      case "secondary":
        return "bg-secondary text-white";
      case "accent":
        return "bg-accent text-white";
      default:
        return "bg-primary text-white";
    }
  };

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-neutral-900 mb-4">How CarHub Works</h2>
          <p className="text-neutral-600 max-w-2xl mx-auto">
            Simple, secure, and trusted by thousands of Kenyans
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="text-center space-y-4">
              <div className={`w-16 h-16 ${getColorClasses(step.color)} rounded-full flex items-center justify-center mx-auto`}>
                <step.icon className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-neutral-900">{step.title}</h3>
              <p className="text-neutral-600">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
