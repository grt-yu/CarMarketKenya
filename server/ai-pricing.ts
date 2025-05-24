import { DeepSeekApi } from "./deepseek-api";

interface CarPricingData {
  make: string;
  model: string;
  year: number;
  mileage: number;
  condition: string;
  fuelType: string;
  transmission: string;
  bodyType: string;
  location: string;
  features: string[];
}

interface PricingResult {
  estimatedPrice: number;
  confidence: number;
  marketAnalysis: {
    averagePrice: number;
    priceRange: { min: number; max: number };
    marketTrend: string;
    comparisons: Array<{
      description: string;
      price: number;
      similarity: number;
    }>;
    insights: string[];
  };
}

export class AICarPricing {
  private deepseek: DeepSeekApi;

  constructor() {
    this.deepseek = new DeepSeekApi();
  }

  async analyzePricing(carData: CarPricingData): Promise<PricingResult> {
    const prompt = this.buildPricingPrompt(carData);
    
    try {
      const response = await this.deepseek.chat([
        {
          role: "system",
          content: "You are an expert car valuation AI with deep knowledge of the Kenyan automotive market. Provide accurate pricing analysis based on current market conditions, depreciation curves, and local demand patterns."
        },
        {
          role: "user",
          content: prompt
        }
      ]);

      return this.parsePricingResponse(response, carData);
    } catch (error) {
      console.error("AI pricing analysis failed:", error);
      return this.getFallbackPricing(carData);
    }
  }

  private buildPricingPrompt(car: CarPricingData): string {
    return `
Analyze and provide pricing for this vehicle in the Kenyan market:

Vehicle Details:
- Make: ${car.make}
- Model: ${car.model}
- Year: ${car.year}
- Mileage: ${car.mileage.toLocaleString()} km
- Condition: ${car.condition}
- Fuel Type: ${car.fuelType}
- Transmission: ${car.transmission}
- Body Type: ${car.bodyType}
- Location: ${car.location}
- Features: ${car.features.join(", ")}

Please provide a comprehensive analysis including:
1. Estimated market value in KES
2. Confidence level (0-100%)
3. Price range (min-max)
4. Market trend (rising/stable/declining)
5. Key factors affecting pricing
6. Comparable vehicles analysis
7. Location-specific adjustments
8. Depreciation considerations

Format your response as JSON with the following structure:
{
  "estimatedPrice": number,
  "confidence": number,
  "marketAnalysis": {
    "averagePrice": number,
    "priceRange": {"min": number, "max": number},
    "marketTrend": "string",
    "insights": ["insight1", "insight2", ...],
    "locationFactor": number,
    "depreciationRate": number
  }
}`;
  }

  private parsePricingResponse(response: string, carData: CarPricingData): PricingResult {
    try {
      const parsed = JSON.parse(response);
      
      return {
        estimatedPrice: parsed.estimatedPrice,
        confidence: Math.min(100, Math.max(0, parsed.confidence)),
        marketAnalysis: {
          averagePrice: parsed.marketAnalysis.averagePrice,
          priceRange: parsed.marketAnalysis.priceRange,
          marketTrend: parsed.marketAnalysis.marketTrend,
          comparisons: this.generateComparisons(carData, parsed.estimatedPrice),
          insights: parsed.marketAnalysis.insights || []
        }
      };
    } catch (error) {
      console.error("Failed to parse AI response:", error);
      return this.getFallbackPricing(carData);
    }
  }

  private generateComparisons(car: CarPricingData, basePrice: number) {
    // Generate realistic comparison vehicles
    return [
      {
        description: `Similar ${car.make} ${car.model} (${car.year - 1})`,
        price: basePrice * 1.1,
        similarity: 85
      },
      {
        description: `${car.make} ${car.model} (${car.year + 1})`,
        price: basePrice * 0.9,
        similarity: 80
      },
      {
        description: `Comparable ${car.bodyType} in ${car.location}`,
        price: basePrice * 1.05,
        similarity: 75
      }
    ];
  }

  private getFallbackPricing(car: CarPricingData): PricingResult {
    // Basic depreciation calculation as fallback
    const currentYear = new Date().getFullYear();
    const age = currentYear - car.year;
    const depreciationRate = 0.15; // 15% per year
    
    // Rough base prices by category (in KES)
    const basePrices: Record<string, number> = {
      "Toyota": 2500000,
      "Nissan": 2200000,
      "Honda": 2300000,
      "Mazda": 2000000,
      "Subaru": 2400000,
      "Mercedes-Benz": 4500000,
      "BMW": 4200000,
      "Audi": 4000000,
      "Volkswagen": 2800000,
    };

    const basePrice = basePrices[car.make] || 2000000;
    const depreciatedPrice = basePrice * Math.pow(1 - depreciationRate, age);
    
    // Adjust for mileage
    const mileageAdjustment = car.mileage > 100000 ? 0.8 : 1.0;
    const estimatedPrice = depreciatedPrice * mileageAdjustment;

    return {
      estimatedPrice: Math.round(estimatedPrice),
      confidence: 60,
      marketAnalysis: {
        averagePrice: estimatedPrice,
        priceRange: {
          min: Math.round(estimatedPrice * 0.85),
          max: Math.round(estimatedPrice * 1.15)
        },
        marketTrend: "stable",
        comparisons: this.generateComparisons(car, estimatedPrice),
        insights: [
          "Pricing based on standard depreciation model",
          "Consider market conditions for final pricing",
          "Location and condition significantly affect value"
        ]
      }
    };
  }

  async compareCars(mainCar: CarPricingData, compareCars: CarPricingData[]): Promise<{
    comparison: Array<{
      car: CarPricingData;
      valueScore: number;
      pros: string[];
      cons: string[];
      priceComparison: string;
    }>;
    recommendation: string;
  }> {
    try {
      const prompt = `Compare these cars for a buyer in Kenya:

MAIN CAR:
${JSON.stringify(mainCar, null, 2)}

COMPARISON CARS:
${compareCars.map((car, i) => `Car ${i + 1}: ${JSON.stringify(car, null, 2)}`).join('\n\n')}

Provide a detailed comparison with:
1. Value score (1-10) for each comparison car
2. Pros and cons for each car vs the main car
3. Price comparison analysis
4. Overall recommendation

Return JSON in this format:
{
  "comparison": [
    {
      "car": {...},
      "valueScore": 8.5,
      "pros": ["Better fuel economy", "Lower maintenance"],
      "cons": ["Higher price", "Older model"],
      "priceComparison": "15% more expensive but better value"
    }
  ],
  "recommendation": "Overall recommendation text"
}`;

      const response = await this.deepseek.chat([
        {
          role: "system",
          content: "You are an expert automotive advisor specializing in the Kenyan market. Provide practical, unbiased car comparisons."
        },
        {
          role: "user",
          content: prompt
        }
      ]);

      return JSON.parse(response);
    } catch (error) {
      console.error('Car comparison failed:', error);
      return {
        comparison: compareCars.map(car => ({
          car,
          valueScore: 7.0,
          pros: ["Standard features"],
          cons: ["Limited comparison data"],
          priceComparison: "Similar pricing range"
        })),
        recommendation: "Unable to perform detailed comparison at this time."
      };
    }
  }

  async getCarHistory(carData: CarPricingData): Promise<{
    historyScore: number;
    riskFactors: string[];
    positiveFactors: string[];
    recommendations: string[];
    marketHistory: {
      depreciation: string;
      popularityTrend: string;
      reliabilityRating: string;
    };
  }> {
    try {
      const prompt = `Analyze the history and reliability of this car for the Kenyan market:

CAR DETAILS:
Make: ${carData.make}
Model: ${carData.model}
Year: ${carData.year}
Mileage: ${carData.mileage} km
Condition: ${carData.condition}
Location: ${carData.location}

Provide analysis on:
1. Known issues for this make/model/year
2. Expected depreciation in Kenya
3. Parts availability and service costs
4. Market popularity and resale value
5. Risk factors and positive aspects

Return JSON format:
{
  "historyScore": 8.2,
  "riskFactors": ["High service costs", "Parts availability"],
  "positiveFactors": ["Reliable engine", "Good resale value"],
  "recommendations": ["Check service history", "Verify mileage"],
  "marketHistory": {
    "depreciation": "15% per year average",
    "popularityTrend": "Increasing demand",
    "reliabilityRating": "Above average"
  }
}`;

      const response = await this.deepseek.chat([
        {
          role: "system",
          content: "You are a car history and reliability expert with extensive knowledge of the Kenyan automotive market, insurance claims, and common vehicle issues."
        },
        {
          role: "user",
          content: prompt
        }
      ]);

      return JSON.parse(response);
    } catch (error) {
      console.error('Car history analysis failed:', error);
      return {
        historyScore: 7.0,
        riskFactors: ["Limited history data available"],
        positiveFactors: ["Standard market vehicle"],
        recommendations: ["Conduct thorough inspection", "Verify documentation"],
        marketHistory: {
          depreciation: "Standard market rate",
          popularityTrend: "Stable demand",
          reliabilityRating: "Average"
        }
      };
    }
  }
}