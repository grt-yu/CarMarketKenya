import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Clock, Calendar, TrendingUp, BookOpen, Eye } from "lucide-react";
import { BLOG_CATEGORIES, formatDate, formatNumber } from "@/lib/constants";
import type { BlogPostWithAuthor } from "@/lib/types";

export default function Blog() {
  const [location] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const { data: blogData, isLoading, error } = useQuery({
    queryKey: ["/api/blog", { 
      published: true, 
      category: selectedCategory, 
      page: currentPage,
      limit: 12 
    }],
    queryFn: async () => {
      const params = new URLSearchParams({
        published: "true",
        page: currentPage.toString(),
        limit: "12"
      });
      
      if (selectedCategory) {
        params.set("category", selectedCategory);
      }
      
      const response = await fetch(`/api/blog?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch blog posts");
      }
      return response.json();
    },
  });

  const { data: featuredPosts } = useQuery({
    queryKey: ["/api/blog", { featured: true, limit: 3 }],
    queryFn: async () => {
      const response = await fetch("/api/blog?published=true&limit=3");
      if (!response.ok) {
        throw new Error("Failed to fetch featured posts");
      }
      return response.json();
    },
  });

  const posts = blogData?.posts || [];
  const total = blogData?.total || 0;
  const totalPages = Math.ceil(total / 12);

  // Filter posts by search query
  const filteredPosts = posts.filter((post: BlogPostWithAuthor) =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold text-destructive mb-4">Error Loading Blog</h2>
            <p className="text-neutral-600 mb-4">
              We encountered an error while fetching the blog posts. Please try again later.
            </p>
            <Button onClick={() => window.location.reload()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <BookOpen className="h-12 w-12 text-primary mx-auto mb-4" />
        <h1 className="text-4xl font-bold text-neutral-900 mb-4">CarHub Blog</h1>
        <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
          Expert tips, market insights, and helpful guides for car buyers and sellers in Kenya
        </p>
      </div>

      {/* Featured Posts */}
      {featuredPosts?.posts?.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold text-neutral-900">Featured Articles</h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredPosts.posts.slice(0, 3).map((post: BlogPostWithAuthor) => (
              <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                {post.featuredImage && (
                  <Link href={`/blog/${post.slug}`}>
                    <img
                      src={post.featuredImage}
                      alt={post.title}
                      className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </Link>
                )}
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge className="bg-primary/10 text-primary">Featured</Badge>
                    <div className="flex items-center text-xs text-neutral-500">
                      <Clock className="h-3 w-3 mr-1" />
                      {post.readTime} min read
                    </div>
                  </div>
                  
                  <Link href={`/blog/${post.slug}`}>
                    <h3 className="text-lg font-semibold text-neutral-900 mb-3 hover:text-primary transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                  </Link>
                  
                  <p className="text-neutral-600 text-sm mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={post.author.profileImage} />
                        <AvatarFallback>
                          {post.author.firstName[0]}{post.author.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-neutral-600">
                        {post.author.firstName} {post.author.lastName}
                      </span>
                    </div>
                    <span className="text-xs text-neutral-500">
                      {formatDate(post.createdAt)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <Input
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="md:w-48">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {BLOG_CATEGORIES.map((category) => (
              <SelectItem key={category.value} value={category.value}>
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Articles Grid */}
      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(9)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="w-full h-48" />
              <CardContent className="p-6 space-y-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-4 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredPosts.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Search className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-neutral-900 mb-2">No articles found</h3>
            <p className="text-neutral-600 mb-4">
              {searchQuery 
                ? `No articles match "${searchQuery}". Try different keywords.`
                : "No articles available in this category."
              }
            </p>
            <Button 
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("");
              }} 
              variant="outline"
            >
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post: BlogPostWithAuthor) => (
              <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                {post.featuredImage && (
                  <Link href={`/blog/${post.slug}`}>
                    <img
                      src={post.featuredImage}
                      alt={post.title}
                      className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </Link>
                )}
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="secondary">{post.category}</Badge>
                    <div className="flex items-center text-xs text-neutral-500">
                      <Clock className="h-3 w-3 mr-1" />
                      {post.readTime} min read
                    </div>
                    {post.viewCount > 0 && (
                      <div className="flex items-center text-xs text-neutral-500">
                        <Eye className="h-3 w-3 mr-1" />
                        {formatNumber(post.viewCount)}
                      </div>
                    )}
                  </div>
                  
                  <Link href={`/blog/${post.slug}`}>
                    <h3 className="text-lg font-semibold text-neutral-900 mb-3 hover:text-primary transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                  </Link>
                  
                  <p className="text-neutral-600 text-sm mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={post.author.profileImage} />
                        <AvatarFallback>
                          {post.author.firstName[0]}{post.author.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-neutral-600">
                        {post.author.firstName} {post.author.lastName}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-neutral-500">
                      <Calendar className="h-3 w-3" />
                      {formatDate(post.createdAt)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <Button
                variant="outline"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                Previous
              </Button>
              
              {[...Array(totalPages)].map((_, i) => {
                const page = i + 1;
                const isCurrentPage = page === currentPage;
                
                if (
                  page === 1 || 
                  page === totalPages || 
                  (page >= currentPage - 2 && page <= currentPage + 2)
                ) {
                  return (
                    <Button
                      key={page}
                      variant={isCurrentPage ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  );
                }
                
                if (page === currentPage - 3 || page === currentPage + 3) {
                  return <span key={page} className="px-2">...</span>;
                }
                
                return null;
              })}
              
              <Button
                variant="outline"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
