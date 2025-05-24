export const CAR_MAKES = [
  "Toyota", "Nissan", "Honda", "Volkswagen", "BMW", "Mercedes-Benz", 
  "Audi", "Ford", "Mazda", "Hyundai", "Kia", "Mitsubishi", "Subaru",
  "Isuzu", "Land Rover", "Peugeot", "Suzuki", "Jeep", "Volvo", "Lexus"
];

export const BODY_TYPES = [
  "Sedan", "SUV", "Hatchback", "Station Wagon", "Pickup", "Coupe", 
  "Convertible", "Van", "Truck", "Crossover"
];

export const FUEL_TYPES = [
  "Petrol", "Diesel", "Electric", "Hybrid"
];

export const TRANSMISSIONS = [
  "Manual", "Automatic"
];

export const CONDITIONS = [
  "New", "Used", "Certified Pre-Owned"
];

export const KENYAN_COUNTIES = [
  "Nairobi", "Mombasa", "Nakuru", "Eldoret", "Kisumu", "Thika", "Malindi",
  "Kitale", "Garissa", "Kakamega", "Machakos", "Meru", "Nyeri", "Kericho",
  "Kiambu", "Embu", "Isiolo", "Homa Bay", "Kilifi", "Kwale", "Lamu",
  "Mandera", "Marsabit", "Migori", "Mwingi", "Narok", "Nyandarua",
  "Nyamira", "Samburu", "Siaya", "Taita Taveta", "Tana River", "Tharaka Nithi",
  "Trans Nzoia", "Turkana", "Uasin Gishu", "Vihiga", "Wajir", "West Pokot"
];

export const PRICE_RANGES = [
  { label: "Under KSh 500K", min: 0, max: 500000 },
  { label: "KSh 500K - 1M", min: 500000, max: 1000000 },
  { label: "KSh 1M - 2M", min: 1000000, max: 2000000 },
  { label: "KSh 2M - 5M", min: 2000000, max: 5000000 },
  { label: "Over KSh 5M", min: 5000000, max: null },
];

export const BLOG_CATEGORIES = [
  { value: "buying-guide", label: "Buying Guide" },
  { value: "finance", label: "Finance" },
  { value: "market-trends", label: "Market Trends" },
  { value: "maintenance", label: "Maintenance" },
  { value: "insurance", label: "Insurance" },
  { value: "news", label: "News" },
];

export const USER_TYPES = [
  { value: "individual", label: "Individual Seller" },
  { value: "dealer", label: "Car Dealer" },
  { value: "broker", label: "Car Broker" },
];

export const PAYMENT_METHODS = [
  { value: "mpesa", label: "M-Pesa" },
  { value: "airtel", label: "Airtel Money" },
  { value: "card", label: "Credit/Debit Card" },
  { value: "bank", label: "Bank Transfer" },
];

export const formatPrice = (price: number | string): string => {
  const num = typeof price === "string" ? parseFloat(price) : price;
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
};

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat("en-KE").format(num);
};

export const formatDate = (date: Date | string): string => {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-KE", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(d);
};

export const formatDateTime = (date: Date | string): string => {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-KE", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
};
