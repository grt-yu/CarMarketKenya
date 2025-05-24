import { formatNumber } from "@/lib/constants";

export default function TrustIndicators() {
  const stats = [
    { value: 15000, label: "Cars Available" },
    { value: 2500, label: "Verified Dealers" },
    { value: 50000, label: "Happy Customers" },
    { value: "M-Pesa", label: "Secure Payments", isText: true },
  ];

  return (
    <section className="py-8 bg-white border-b">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((stat, index) => (
            <div key={index} className="space-y-2">
              <div className={`text-2xl font-bold ${stat.isText ? 'text-accent' : 'text-primary'}`}>
                {stat.isText ? stat.value : `${formatNumber(stat.value as number)}+`}
              </div>
              <div className="text-neutral-600 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
