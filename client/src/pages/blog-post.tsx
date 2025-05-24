import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { 
  Calendar, Clock, Eye, Share2, ArrowLeft, 
  Facebook, Twitter, Linkedin, AlertCircle 
} from "lucide-react";
import { Link } from "wouter";
import { formatDate, formatNumber } from "@/lib/constants";
import type { BlogPostWithAuthor } from "@/lib/types";

export default function BlogPost() {
  const { slug } = useParams();

  const { data: post, isLoading, error } = useQuery({
    queryKey: [`/api/blog/${slug}`],
    enabled: !!slug,
  });

  const { data: relatedPosts } = useQuery({
    queryKey: ["/api/blog", { 
      category: post?.category, 
      published: true, 
      limit: 3 
    }],
    enabled: !!post?.category,
    queryFn: async () => {
      const response = await fetch(`/api/blog?category=${post.category}&published=true&limit=4`);
      if (!response.ok) {
        throw new Error("Failed to fetch related posts");
      }
      const data = await response.json();
      // Filter out current post
      return {
        ...data,
        posts: data.posts.filter((p: BlogPostWithAuthor) => p.id !== post.id).slice(0, 3)
      };
    },
  });

  const handleShare = async (platform?: string) => {
    const url = window.location.href;
    const title = post?.title || "";
    const text = post?.excerpt || "";

    if (platform === "facebook") {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
    } else if (platform === "twitter") {
      window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`, '_blank');
    } else if (platform === "linkedin") {
      window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
    } else if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch (error) {
        console.log("Share failed:", error);
      }
    } else {
      navigator.clipboard.writeText(url);
    }
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-destructive mb-4">Article Not Found</h2>
            <p className="text-neutral-600 mb-4">
              The article you're looking for doesn't exist or has been removed.
            </p>
            <Button asChild>
              <Link href="/blog">Back to Blog</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-64 w-full rounded-xl" />
          <div className="space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }

  const postData = post as BlogPostWithAuthor;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/blog">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Blog
          </Link>
        </Button>

        {/* Article Header */}
        <header className="mb-8">
          {postData.featuredImage && (
            <img
              src={postData.featuredImage}
              alt={postData.title}
              className="w-full h-64 md:h-96 object-cover rounded-xl mb-6"
            />
          )}
          
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="secondary">{postData.category}</Badge>
              <div className="flex items-center text-sm text-neutral-600 gap-4">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {formatDate(postData.createdAt)}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {postData.readTime} min read
                </div>
                {postData.viewCount > 0 && (
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    {formatNumber(postData.viewCount)} views
                  </div>
                )}
              </div>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 leading-tight">
              {postData.title}
            </h1>
            
            <p className="text-lg text-neutral-600 leading-relaxed">
              {postData.excerpt}
            </p>
          </div>
        </header>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <article className="lg:col-span-3">
            <div 
              className="prose prose-lg max-w-none prose-headings:text-neutral-900 prose-p:text-neutral-700 prose-a:text-primary hover:prose-a:text-primary/80"
              dangerouslySetInnerHTML={{ __html: postData.content }}
            />
            
            {/* Tags */}
            {postData.tags && postData.tags.length > 0 && (
              <div className="mt-8 pt-6 border-t">
                <h3 className="text-sm font-medium text-neutral-900 mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {postData.tags.map((tag, index) => (
                    <Badge key={index} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </article>

          {/* Sidebar */}
          <aside className="lg:col-span-1 space-y-6">
            {/* Author Card */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={postData.author.profileImage} />
                    <AvatarFallback className="bg-primary text-white">
                      {postData.author.firstName[0]}{postData.author.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold">
                      {postData.author.firstName} {postData.author.lastName}
                    </div>
                    <div className="text-sm text-neutral-600">Author</div>
                  </div>
                </div>
                
                {postData.author.bio && (
                  <p className="text-sm text-neutral-600 mb-4">
                    {postData.author.bio}
                  </p>
                )}
                
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link href={`/profile/${postData.author.id}`}>
                    View Profile
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Share */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Share Article</h3>
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start"
                    onClick={() => handleShare("facebook")}
                  >
                    <Facebook className="h-4 w-4 mr-2" />
                    Facebook
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start"
                    onClick={() => handleShare("twitter")}
                  >
                    <Twitter className="h-4 w-4 mr-2" />
                    Twitter
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start"
                    onClick={() => handleShare("linkedin")}
                  >
                    <Linkedin className="h-4 w-4 mr-2" />
                    LinkedIn
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start"
                    onClick={() => handleShare()}
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Copy Link
                  </Button>
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>

        {/* Related Articles */}
        {relatedPosts?.posts?.length > 0 && (
          <section className="mt-12 pt-8 border-t">
            <h2 className="text-2xl font-bold text-neutral-900 mb-6">Related Articles</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedPosts.posts.map((relatedPost: BlogPostWithAuthor) => (
                <Card key={relatedPost.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                  {relatedPost.featuredImage && (
                    <Link href={`/blog/${relatedPost.slug}`}>
                      <img
                        src={relatedPost.featuredImage}
                        alt={relatedPost.title}
                        className="w-full h-32 object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </Link>
                  )}
                  <CardContent className="p-4">
                    <Badge variant="outline" className="mb-2 text-xs">
                      {relatedPost.category}
                    </Badge>
                    
                    <Link href={`/blog/${relatedPost.slug}`}>
                      <h3 className="font-semibold text-neutral-900 mb-2 hover:text-primary transition-colors line-clamp-2">
                        {relatedPost.title}
                      </h3>
                    </Link>
                    
                    <p className="text-sm text-neutral-600 line-clamp-2 mb-3">
                      {relatedPost.excerpt}
                    </p>
                    
                    <div className="flex items-center text-xs text-neutral-500">
                      <Clock className="h-3 w-3 mr-1" />
                      {relatedPost.readTime} min read
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
