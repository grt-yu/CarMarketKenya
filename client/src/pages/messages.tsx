import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  MessageCircle, Send, ArrowLeft, User, 
  Car, Phone, Search, MoreVertical 
} from "lucide-react";
import { formatDate, formatDateTime } from "@/lib/constants";
import { apiRequest } from "@/lib/queryClient";
import MessageChat from "@/components/message-chat";
import type { MessageWithUsers } from "@/lib/types";

export default function Messages() {
  const queryClient = useQueryClient();
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [isMobileView, setIsMobileView] = useState(false);
  
  // Mock user ID - in real app this would come from auth context
  const userId = 1;

  const { data: conversations, isLoading: conversationsLoading } = useQuery({
    queryKey: [`/api/messages/conversations/${userId}`],
  });

  const { data: messages, isLoading: messagesLoading } = useQuery({
    queryKey: [`/api/messages/${userId}/${selectedConversation?.user.id}`],
    enabled: !!selectedConversation,
    queryFn: async () => {
      const response = await fetch(`/api/messages/${userId}/${selectedConversation.user.id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch messages");
      }
      return response.json();
    },
  });

  // Check mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const markAsReadMutation = useMutation({
    mutationFn: async (messageId: number) => {
      return apiRequest("PUT", `/api/messages/${messageId}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/messages/conversations/${userId}`] });
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: { receiverId: number; content: string; carId?: number }) => {
      return apiRequest("POST", "/api/messages", {
        senderId: userId,
        ...messageData,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/messages/${userId}/${selectedConversation?.user.id}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/messages/conversations/${userId}`] });
    },
  });

  const handleSelectConversation = (conversation: any) => {
    setSelectedConversation(conversation);
    
    // Mark unread messages as read
    if (conversation.unreadCount > 0) {
      // In a real app, you'd mark specific messages as read
      // For now, we'll just invalidate the conversations query
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: [`/api/messages/conversations/${userId}`] });
      }, 1000);
    }
  };

  const handleSendMessage = (content: string) => {
    if (!selectedConversation || !content.trim()) return;
    
    sendMessageMutation.mutate({
      receiverId: selectedConversation.user.id,
      content: content.trim(),
    });
  };

  const handleBackToList = () => {
    setSelectedConversation(null);
  };

  if (conversationsLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <Card className="h-[600px]">
            <CardContent className="p-6">
              <div className="flex h-full">
                <div className="w-1/3 border-r pr-4 space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center gap-3 animate-pulse">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-48" />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex-1 flex items-center justify-center">
                  <Skeleton className="h-32 w-48" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Mobile view with selected conversation
  if (isMobileView && selectedConversation) {
    return (
      <div className="h-screen flex flex-col">
        {/* Mobile Header */}
        <div className="bg-white border-b p-4 flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={handleBackToList}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Avatar className="h-8 w-8">
            <AvatarImage src={selectedConversation.user.profileImage} />
            <AvatarFallback>
              {selectedConversation.user.firstName[0]}{selectedConversation.user.lastName[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="font-medium">
              {selectedConversation.user.firstName} {selectedConversation.user.lastName}
            </div>
            <div className="text-xs text-neutral-600">
              {selectedConversation.user.userType}
            </div>
          </div>
          <Button variant="ghost" size="sm">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>

        {/* Chat */}
        <div className="flex-1">
          <MessageChat
            messages={messages || []}
            currentUserId={userId}
            isLoading={messagesLoading}
            onSendMessage={handleSendMessage}
            isSending={sendMessageMutation.isPending}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <MessageCircle className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">Messages</h1>
            <p className="text-neutral-600">
              Communicate with buyers and sellers securely
            </p>
          </div>
        </div>

        <Card className="h-[600px]">
          <CardContent className="p-0 h-full">
            <div className="flex h-full">
              {/* Conversations List */}
              <div className={`${isMobileView ? 'w-full' : 'w-1/3'} border-r`}>
                <CardHeader className="border-b">
                  <CardTitle className="text-lg">Conversations</CardTitle>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                    <Input placeholder="Search conversations..." className="pl-10" />
                  </div>
                </CardHeader>
                
                <div className="overflow-y-auto h-[calc(100%-140px)]">
                  {!conversations || conversations.length === 0 ? (
                    <div className="p-6 text-center">
                      <MessageCircle className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                      <h3 className="font-semibold text-neutral-900 mb-2">No conversations yet</h3>
                      <p className="text-sm text-neutral-600">
                        Start messaging by contacting a car seller
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1 p-2">
                      {conversations.map((conversation: any) => (
                        <div
                          key={conversation.user.id}
                          onClick={() => handleSelectConversation(conversation)}
                          className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors hover:bg-neutral-50 ${
                            selectedConversation?.user.id === conversation.user.id 
                              ? 'bg-primary/10 border-l-4 border-primary' 
                              : ''
                          }`}
                        >
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={conversation.user.profileImage} />
                            <AvatarFallback>
                              {conversation.user.firstName[0]}{conversation.user.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <div className="font-medium text-neutral-900 truncate">
                                {conversation.user.firstName} {conversation.user.lastName}
                              </div>
                              <div className="text-xs text-neutral-500">
                                {formatDateTime(conversation.lastMessage.createdAt)}
                              </div>
                            </div>
                            
                            <p className="text-sm text-neutral-600 truncate">
                              {conversation.lastMessage.content}
                            </p>
                            
                            <div className="flex items-center justify-between mt-1">
                              <Badge variant="outline" className="text-xs">
                                {conversation.user.userType}
                              </Badge>
                              {conversation.unreadCount > 0 && (
                                <Badge className="text-xs">
                                  {conversation.unreadCount}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Chat Area */}
              {!isMobileView && (
                <div className="flex-1 flex flex-col">
                  {selectedConversation ? (
                    <>
                      {/* Chat Header */}
                      <div className="border-b p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={selectedConversation.user.profileImage} />
                            <AvatarFallback>
                              {selectedConversation.user.firstName[0]}{selectedConversation.user.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">
                              {selectedConversation.user.firstName} {selectedConversation.user.lastName}
                            </div>
                            <div className="text-sm text-neutral-600 capitalize">
                              {selectedConversation.user.userType?.replace('_', ' ')}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {selectedConversation.user.phone && (
                            <Button variant="outline" size="sm" asChild>
                              <a href={`tel:${selectedConversation.user.phone}`}>
                                <Phone className="h-4 w-4" />
                              </a>
                            </Button>
                          )}
                          <Button variant="outline" size="sm">
                            <User className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Chat Messages */}
                      <div className="flex-1">
                        <MessageChat
                          messages={messages || []}
                          currentUserId={userId}
                          isLoading={messagesLoading}
                          onSendMessage={handleSendMessage}
                          isSending={sendMessageMutation.isPending}
                        />
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex items-center justify-center">
                      <div className="text-center">
                        <MessageCircle className="h-16 w-16 text-neutral-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                          Select a conversation
                        </h3>
                        <p className="text-neutral-600">
                          Choose a conversation from the list to start messaging
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
