import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Loader2, TrendingUp, TrendingDown, Minus, Brain, DollarSign } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatPrice } from "@/lib/constants";

interface PricingAnalysis {
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

interface AIPricingWidgetProps {
  carId: number;
  currentPrice?: number;
}

export default function AIPricingWidget({ carId, currentPrice }: AIPricingWidgetProps) {
  const [analysis, setAnalysis] = useState<PricingAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const analyzePrice = async () => {
    setIsLoading(true);
    try {
      const result = await apiRequest("POST", `/api/cars/${carId}/ai-pricing`);
      setAnalysis(result);
      toast({
        title: "AI Analysis Complete",
        description: "Market pricing analysis has been generated successfully."
      });
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: "Unable to generate pricing analysis. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend.toLowerCase()) {
      case "rising":
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case "declining":
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return "text-green-600";
    if (confidence >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-blue-600" />
          AI-Powered Price Analysis
        </CardTitle>
        <CardDescription>
          Get intelligent market insights and pricing recommendations powered by DeepSeek AI
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!analysis ? (
          <Button 
            onClick={analyzePrice} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing Market Data...
              </>
            ) : (
              <>
                <Brain className="mr-2 h-4 w-4" />
                Analyze Price with AI
              </>
            )}
          </Button>
        ) : (
          <div className="space-y-6">
            {/* Main Price Analysis */}
            <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">AI Estimated Value</div>
              <div className="text-3xl font-bold text-gray-900">
                {formatPrice(analysis.estimatedPrice)}
              </div>
              <div className="flex items-center justify-center gap-2 mt-2">
                <span className="text-sm text-gray-600">Confidence:</span>
                <span className={`font-semibold ${getConfidenceColor(analysis.confidence)}`}>
                  {analysis.confidence}%
                </span>
                <Progress value={analysis.confidence} className="w-20 h-2" />
              </div>
            </div>

            {/* Price Comparison */}
            {currentPrice && (
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Current Listed Price</span>
                  <span className="font-semibold">{formatPrice(currentPrice)}</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm text-gray-600">Price Difference</span>
                  <span className={`font-semibold ${
                    currentPrice > analysis.estimatedPrice ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {currentPrice > analysis.estimatedPrice ? '+' : ''}
                    {formatPrice(currentPrice - analysis.estimatedPrice)}
                  </span>
                </div>
              </div>
            )}

            {/* Market Analysis */}
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">Market Analysis</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600">Market Average</div>
                  <div className="font-semibold">{formatPrice(analysis.marketAnalysis.averagePrice)}</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600 flex items-center gap-1">
                    Market Trend
                    {getTrendIcon(analysis.marketAnalysis.marketTrend)}
                  </div>
                  <div className="font-semibold capitalize">{analysis.marketAnalysis.marketTrend}</div>
                </div>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-2">Price Range</div>
                <div className="flex items-center justify-between text-sm">
                  <span>Min: {formatPrice(analysis.marketAnalysis.priceRange.min)}</span>
                  <span>Max: {formatPrice(analysis.marketAnalysis.priceRange.max)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full"
                    style={{
                      width: `${((analysis.estimatedPrice - analysis.marketAnalysis.priceRange.min) / 
                        (analysis.marketAnalysis.priceRange.max - analysis.marketAnalysis.priceRange.min)) * 100}%`
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Comparisons */}
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">Similar Vehicles</h4>
              {analysis.marketAnalysis.comparisons.map((comp, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="text-sm font-medium">{comp.description}</div>
                    <div className="text-xs text-gray-600">
                      {comp.similarity}% similarity
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{formatPrice(comp.price)}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* AI Insights */}
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">AI Insights</h4>
              {analysis.marketAnalysis.insights.map((insight, index) => (
                <div key={index} className="p-3 bg-blue-50 border-l-4 border-blue-400 rounded">
                  <p className="text-sm text-blue-800">{insight}</p>
                </div>
              ))}
            </div>

            {/* Re-analyze Button */}
            <Button 
              onClick={analyzePrice} 
              disabled={isLoading}
              variant="outline"
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Re-analyzing...
                </>
              ) : (
                "Update Analysis"
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}