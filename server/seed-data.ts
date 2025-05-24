import { db } from "./db";
import { users, cars, blogPosts, favorites, reviews } from "@shared/schema";

export async function seedDatabase() {
  try {
    console.log("Starting database seeding...");

    // Create demo users
    const demoUsers = await db.insert(users).values([
      {
        email: "john.doe@example.com",
        firstName: "John",
        lastName: "Doe",
        phone: "+254712345678",
        location: "Nairobi",
        userType: "individual",
        isVerified: true,
        profileImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
      },
      {
        email: "jane.smith@example.com",
        firstName: "Jane",
        lastName: "Smith",
        phone: "+254723456789",
        location: "Mombasa",
        userType: "dealer",
        isVerified: true,
        profileImage: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face"
      },
      {
        email: "peter.kiptoo@example.com",
        firstName: "Peter",
        lastName: "Kiptoo",
        phone: "+254734567890",
        location: "Eldoret",
        userType: "individual",
        isVerified: false,
        profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
      },
      {
        email: "sarah.wanjiku@example.com",
        firstName: "Sarah",
        lastName: "Wanjiku",
        phone: "+254745678901",
        location: "Nakuru",
        userType: "dealer",
        isVerified: true,
        profileImage: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face"
      }
    ]).returning();

    console.log("Demo users created:", demoUsers.length);

    // Create demo cars
    const demoCars = await db.insert(cars).values([
      {
        sellerId: demoUsers[0].id,
        title: "2018 Toyota Prado - Excellent Condition",
        make: "Toyota",
        model: "Prado",
        year: 2018,
        price: "4500000",
        mileage: 45000,
        fuelType: "Diesel",
        transmission: "Automatic",
        bodyType: "SUV",
        condition: "Excellent",
        description: "Well maintained Toyota Prado with full service history. Perfect for family use and off-road adventures.",
        location: "Nairobi",
        county: "Nairobi",
        images: [
          "https://images.unsplash.com/photo-1549924231-f129b911e442?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&h=600&fit=crop"
        ],
        features: ["Air Conditioning", "Power Steering", "Leather Seats", "Sunroof", "4WD"],
        status: "available"
      },
      {
        sellerId: demoUsers[1].id,
        title: "2020 Honda Fit - Fuel Efficient City Car",
        make: "Honda",
        model: "Fit",
        year: 2020,
        price: "1800000",
        mileage: 25000,
        fuelType: "Petrol",
        transmission: "CVT",
        bodyType: "Hatchback",
        condition: "Very Good",
        description: "Economical Honda Fit perfect for city driving. Low mileage and excellent fuel economy.",
        location: "Mombasa",
        county: "Mombasa",
        images: [
          "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&h=600&fit=crop"
        ],
        features: ["Air Conditioning", "Power Steering", "Central Locking", "Electric Windows"],
        status: "available"
      },
      {
        sellerId: demoUsers[0].id,
        title: "2017 Nissan X-Trail - Family SUV",
        make: "Nissan",
        model: "X-Trail",
        year: 2017,
        price: "3200000",
        mileage: 68000,
        fuelType: "Petrol",
        transmission: "CVT",
        bodyType: "SUV",
        condition: "Good",
        description: "Spacious family SUV with 7 seats. Perfect for family trips and daily commuting.",
        location: "Nairobi",
        county: "Nairobi",
        images: [
          "https://images.unsplash.com/photo-1549924231-f129b911e442?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&h=600&fit=crop"
        ],
        features: ["Air Conditioning", "Power Steering", "7 Seats", "Reverse Camera", "Bluetooth"],
        status: "available"
      },
      {
        sellerId: demoUsers[3].id,
        title: "2019 Mercedes-Benz C-Class - Luxury Sedan",
        make: "Mercedes-Benz",
        model: "C-Class",
        year: 2019,
        price: "6800000",
        mileage: 32000,
        fuelType: "Petrol",
        transmission: "Automatic",
        bodyType: "Sedan",
        condition: "Excellent",
        description: "Luxurious Mercedes-Benz C-Class with premium features and impeccable condition.",
        location: "Nakuru",
        county: "Nakuru",
        images: [
          "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&h=600&fit=crop"
        ],
        features: ["Leather Seats", "Sunroof", "Navigation System", "Premium Audio", "Climate Control"],
        status: "available"
      },
      {
        sellerId: demoUsers[2].id,
        title: "2016 Mazda Demio - Reliable City Car",
        make: "Mazda",
        model: "Demio",
        year: 2016,
        price: "1200000",
        mileage: 85000,
        fuelType: "Petrol",
        transmission: "Manual",
        bodyType: "Hatchback",
        condition: "Good",
        description: "Reliable Mazda Demio perfect for first-time car owners. Well maintained and economical.",
        location: "Eldoret",
        county: "Uasin Gishu",
        images: [
          "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&h=600&fit=crop"
        ],
        features: ["Air Conditioning", "Power Steering", "Central Locking"],
        status: "available"
      },
      {
        sellerId: demoUsers[1].id,
        title: "2021 Toyota Hilux - Workhorse Pickup",
        make: "Toyota",
        model: "Hilux",
        year: 2021,
        price: "5200000",
        mileage: 18000,
        fuelType: "Diesel",
        transmission: "Manual",
        bodyType: "Pickup",
        condition: "Excellent",
        description: "Nearly new Toyota Hilux perfect for business and personal use. Exceptional build quality.",
        location: "Mombasa",
        county: "Mombasa",
        images: [
          "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&h=600&fit=crop"
        ],
        features: ["4WD", "Power Steering", "Air Conditioning", "Tow Bar", "Load Bed"],
        status: "available"
      }
    ]).returning();

    console.log("Demo cars created:", demoCars.length);

    // Create demo blog posts
    const demoBlogPosts = await db.insert(blogPosts).values([
      {
        authorId: demoUsers[1].id,
        title: "Complete Guide to Buying Your First Car in Kenya",
        slug: "guide-buying-first-car-kenya",
        excerpt: "Everything you need to know about purchasing your first vehicle in Kenya, from budgeting to paperwork.",
        content: `
# Complete Guide to Buying Your First Car in Kenya

Buying your first car is an exciting milestone, but it can also be overwhelming. Here's everything you need to know to make the right choice.

## Setting Your Budget

Before you start looking at cars, determine how much you can afford:

- **Purchase Price**: Don't spend more than 20% of your annual income
- **Insurance**: Budget 3-5% of the car's value annually
- **Maintenance**: Set aside 10-15% of the car's value per year
- **Fuel**: Consider your daily commute and fuel efficiency

## Popular First Cars in Kenya

### Toyota Vitz
- Excellent fuel economy
- Reliable and affordable parts
- Perfect for city driving

### Nissan March
- Compact and easy to park
- Good resale value
- Modern features

### Mazda Demio
- Sporty design
- Reliable engine
- Affordable maintenance

## Inspection Checklist

When viewing a car:

1. **Exterior**: Check for rust, dents, and paint consistency
2. **Interior**: Test all electronics and comfort features
3. **Engine**: Listen for unusual noises
4. **Test Drive**: Check brakes, steering, and transmission
5. **Documentation**: Verify logbook and service history

## Final Tips

- Always negotiate the price
- Get a pre-purchase inspection
- Verify the car's history
- Have financing pre-approved
- Read the contract carefully

Happy car hunting!
        `,
        category: "Buying Guide",
        published: true,
        featuredImage: "https://images.unsplash.com/photo-1549924231-f129b911e442?w=800&h=600&fit=crop"
      },
      {
        authorId: demoUsers[0].id,
        title: "Top 5 Most Reliable Cars in Kenya 2024",
        slug: "top-5-reliable-cars-kenya-2024",
        excerpt: "Discover the most dependable vehicles that offer great value for money in the Kenyan market.",
        content: `
# Top 5 Most Reliable Cars in Kenya 2024

Based on market data and owner feedback, here are the most reliable cars you can buy in Kenya this year.

## 1. Toyota Corolla
The gold standard for reliability. Parts are readily available and mechanics know these cars inside out.

## 2. Honda Fit
Exceptional fuel economy and proven reliability make this a top choice for city driving.

## 3. Nissan Note
Modern features combined with Japanese reliability. Great for families.

## 4. Mazda Axela
Sporty yet practical, with excellent build quality and driving dynamics.

## 5. Toyota Prado
For those needing an SUV, the Prado offers unmatched reliability and resale value.

## Why These Cars Top the List

- **Parts Availability**: Easy to find genuine parts
- **Service Network**: Widespread service centers
- **Fuel Efficiency**: All offer excellent fuel economy
- **Resale Value**: Strong resale values protect your investment
        `,
        category: "Reviews",
        published: true,
        featuredImage: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&h=600&fit=crop"
      },
      {
        authorId: demoUsers[3].id,
        title: "Electric Vehicles in Kenya: Are We Ready?",
        slug: "electric-vehicles-kenya-ready",
        excerpt: "Exploring the current state and future prospects of electric vehicles in the Kenyan automotive market.",
        content: `
# Electric Vehicles in Kenya: Are We Ready?

As the world moves towards sustainable transportation, Kenya is gradually warming up to electric vehicles. But are we ready for this transition?

## Current State

The Kenyan government has shown commitment to EVs:
- Reduced import duty on electric vehicles
- Plans for charging infrastructure
- Partnership with international EV manufacturers

## Challenges

- **Limited Charging Infrastructure**: Few charging stations outside major cities
- **High Initial Cost**: EVs are still expensive compared to conventional cars
- **Range Anxiety**: Concerns about battery life and charging availability
- **Technical Expertise**: Limited local knowledge for maintenance

## Opportunities

- **Government Support**: Favorable policies and incentives
- **Environmental Benefits**: Reduced emissions and pollution
- **Lower Operating Costs**: Cheaper electricity vs. fuel
- **Technology Advancement**: Improving battery technology

## The Road Ahead

While challenges exist, Kenya is making steady progress towards EV adoption. The key is gradual infrastructure development and public awareness.
        `,
        category: "Industry News",
        published: true,
        featuredImage: "https://images.unsplash.com/photo-1593941707882-a5bac6861d75?w=800&h=600&fit=crop"
      }
    ]).returning();

    console.log("Demo blog posts created:", demoBlogPosts.length);

    // Create some favorites
    await db.insert(favorites).values([
      { userId: demoUsers[0].id, carId: demoCars[1].id },
      { userId: demoUsers[0].id, carId: demoCars[3].id },
      { userId: demoUsers[2].id, carId: demoCars[0].id },
      { userId: demoUsers[2].id, carId: demoCars[5].id }
    ]);

    // Create some reviews
    await db.insert(reviews).values([
      {
        reviewerId: demoUsers[2].id,
        reviewedUserId: demoUsers[1].id,
        carId: demoCars[1].id,
        rating: 5,
        comment: "Excellent service! Jane was very professional and the car was exactly as described. Highly recommended!"
      },
      {
        reviewerId: demoUsers[0].id,
        reviewedUserId: demoUsers[3].id,
        carId: demoCars[3].id,
        rating: 4,
        comment: "Great car and smooth transaction. Sarah was helpful throughout the process."
      }
    ]);

    console.log("Database seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}