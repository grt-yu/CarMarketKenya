import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowRight, Clock } from "lucide-react";
import { formatDate } from "@/lib/constants";
import type { BlogPostWithAuthor } from "@/lib/types";

export default function BlogSection() {
  const { data: blogData, isLoading } = useQuery({
    queryKey: ["/api/blog?published=true&limit=3"],
  });

  if (isLoading) {
    return (
      <section className="py-16 bg-neutral-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-neutral-900 mb-4">Latest from Our Blog</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <div className="w-full h-48 bg-neutral-200"></div>
                <CardContent className="p-6 space-y-3">
                  <div className="h-4 bg-neutral-200 rounded"></div>
                  <div className="h-6 bg-neutral-200 rounded"></div>
                  <div className="h-16 bg-neutral-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  const posts = blogData?.posts || [];

  return (
    <section className="py-16 bg-neutral-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-neutral-900 mb-4">Latest from Our Blog</h2>
          <p className="text-neutral-600 max-w-2xl mx-auto">
            Expert tips, market insights, and helpful guides for car buyers and sellers in Kenya
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post: BlogPostWithAuthor) => (
            <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
              {post.featuredImage && (
                <img 
                  src={post.featuredImage}
                  alt={post.title}
                  className="w-full h-48 object-cover"
                />
              )}
              <CardContent className="p-6">
                <div className="flex items-center space-x-2 mb-3">
                  <Badge variant="secondary">{post.category}</Badge>
                  <div className="flex items-center text-xs text-neutral-500">
                    <Clock className="h-3 w-3 mr-1" />
                    {post.readTime} min read
                  </div>
                </div>
                
                <h3 className="text-lg font-semibold text-neutral-900 mb-3 line-clamp-2">
                  {post.title}
                </h3>
                
                <p className="text-neutral-600 text-sm mb-4 line-clamp-3">
                  {post.excerpt}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={post.author.profileImage} />
                      <AvatarFallback>
                        {post.author.firstName[0]}{post.author.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-sm font-medium">
                        {post.author.firstName} {post.author.lastName}
                      </div>
                      <div className="text-xs text-neutral-500">
                        {formatDate(post.createdAt)}
                      </div>
                    </div>
                  </div>
                  
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/blog/${post.slug}`}>
                      Read More <ArrowRight className="h-3 w-3 ml-1" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button asChild>
            <Link href="/blog">
              Visit Our Blog <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
