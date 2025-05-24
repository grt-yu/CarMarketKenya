import { useState } from 'react';
import { Star, StarHalf, Shield, CheckCircle, Clock, MessageCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface SellerRatingProps {
  seller: {
    id: number;
    firstName: string;
    lastName: string;
    profileImage: string | null;
    isVerified: boolean;
    userType: string;
    location: string | null;
  };
  showReviewForm?: boolean;
  carId?: number;
}

interface Review {
  id: number;
  rating: number;
  comment: string;
  createdAt: string;
  reviewer: {
    firstName: string;
    lastName: string;
  };
}

export default function SellerRatingSystem({ seller, showReviewForm = false, carId }: SellerRatingProps) {
  const [reviews, setReviews] = useState<Review[]>([
    {
      id: 1,
      rating: 5,
      comment: "Excellent seller! Very responsive and honest about the car condition. Highly recommended!",
      createdAt: "2024-01-15",
      reviewer: { firstName: "John", lastName: "K." }
    },
    {
      id: 2,
      rating: 4,
      comment: "Good experience overall. Car was as described and transaction was smooth.",
      createdAt: "2024-01-10",
      reviewer: { firstName: "Mary", lastName: "S." }
    },
    {
      id: 3,
      rating: 5,
      comment: "Professional dealer with great customer service. Would buy from again.",
      createdAt: "2024-01-05",
      reviewer: { firstName: "David", lastName: "M." }
    }
  ]);
  
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Calculate average rating
  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0;

  const ratingDistribution = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(review => review.rating === star).length,
    percentage: reviews.length > 0 ? (reviews.filter(review => review.rating === star).length / reviews.length) * 100 : 0
  }));

  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClasses = {
      sm: 'h-3 w-3',
      md: 'h-4 w-4', 
      lg: 'h-5 w-5'
    };

    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = star <= Math.floor(rating);
          const halfFilled = star === Math.ceil(rating) && rating % 1 !== 0;
          
          return (
            <div key={star} className="relative">
              {halfFilled ? (
                <StarHalf className={`${sizeClasses[size]} fill-yellow-400 text-yellow-400`} />
              ) : (
                <Star className={`${sizeClasses[size]} ${filled ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const handleSubmitReview = async () => {
    if (newRating === 0) {
      toast({
        title: "Rating Required",
        description: "Please select a star rating",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await apiRequest('POST', '/api/reviews', {
        sellerId: seller.id,
        carId: carId,
        rating: newRating,
        comment: newComment
      });

      // Add the new review to the list
      const newReview: Review = {
        id: Date.now(),
        rating: newRating,
        comment: newComment,
        createdAt: new Date().toISOString().split('T')[0],
        reviewer: { firstName: "You", lastName: "" }
      };

      setReviews([newReview, ...reviews]);
      setNewRating(0);
      setNewComment('');

      toast({
        title: "Review Submitted",
        description: "Thank you for your feedback!"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit review. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Seller Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={seller.profileImage || undefined} />
                <AvatarFallback className="text-lg">
                  {seller.firstName[0]}{seller.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="flex items-center gap-2">
                  {seller.firstName} {seller.lastName}
                  {seller.isVerified && (
                    <Shield className="h-5 w-5 text-blue-500" />
                  )}
                </CardTitle>
                <CardDescription className="flex items-center gap-4">
                  <span>{seller.userType === 'dealer' ? 'Verified Dealer' : 'Individual Seller'}</span>
                  {seller.location && <span>📍 {seller.location}</span>}
                </CardDescription>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 mb-1">
                {renderStars(averageRating, 'lg')}
                <span className="text-2xl font-bold">{averageRating.toFixed(1)}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {reviews.length} review{reviews.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {seller.isVerified && (
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                ID Verified
              </Badge>
            )}
            {seller.userType === 'dealer' && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                <Shield className="h-3 w-3 mr-1" />
                Certified Dealer
              </Badge>
            )}
            <Badge variant="secondary" className="bg-gray-100 text-gray-800">
              <Clock className="h-3 w-3 mr-1" />
              Fast Response
            </Badge>
            <Badge variant="secondary" className="bg-purple-100 text-purple-800">
              <MessageCircle className="h-3 w-3 mr-1" />
              Great Communication
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Rating Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Rating Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {ratingDistribution.map(({ star, count, percentage }) => (
              <div key={star} className="flex items-center gap-3">
                <span className="text-sm w-8">{star}★</span>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm text-muted-foreground w-8">{count}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Review Form */}
      {showReviewForm && (
        <Card>
          <CardHeader>
            <CardTitle>Leave a Review</CardTitle>
            <CardDescription>Share your experience with this seller</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Rating</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className="p-1"
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    onClick={() => setNewRating(star)}
                  >
                    <Star 
                      className={`h-6 w-6 transition-colors ${
                        star <= (hoveredRating || newRating) 
                          ? 'fill-yellow-400 text-yellow-400' 
                          : 'text-gray-300'
                      }`} 
                    />
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Comment</label>
              <Textarea
                placeholder="Share details about your experience..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={3}
              />
            </div>

            <Button 
              onClick={handleSubmitReview} 
              disabled={isSubmitting || newRating === 0}
              className="w-full"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reviews.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No reviews yet. Be the first to leave a review!
              </p>
            ) : (
              reviews.map((review) => (
                <div key={review.id} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {review.reviewer.firstName} {review.reviewer.lastName}
                      </span>
                      {renderStars(review.rating, 'sm')}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{review.comment}</p>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}