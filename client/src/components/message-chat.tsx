import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Send, Smile, Paperclip, Image, Phone, Video, 
  MoreVertical, Check, CheckCheck, Clock
} from "lucide-react";
import { formatDateTime, formatDate } from "@/lib/constants";
import type { MessageWithUsers } from "@/lib/types";

interface MessageChatProps {
  messages: MessageWithUsers[];
  currentUserId: number;
  isLoading?: boolean;
  onSendMessage: (content: string) => void;
  isSending?: boolean;
}

export default function MessageChat({ 
  messages, 
  currentUserId, 
  isLoading = false, 
  onSendMessage, 
  isSending = false 
}: MessageChatProps) {
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = () => {
    if (newMessage.trim() && !isSending) {
      onSendMessage(newMessage.trim());
      setNewMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatMessageTime = (date: Date | string) => {
    const messageDate = new Date(date);
    const now = new Date();
    const diffInHours = (now.getTime() - messageDate.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return messageDate.toLocaleTimeString("en-KE", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffInHours < 168) { // 7 days
      return messageDate.toLocaleDateString("en-KE", {
        weekday: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
    } else {
      return formatDate(messageDate);
    }
  };

  const groupMessagesByDate = (messages: MessageWithUsers[]) => {
    const groups: { [key: string]: MessageWithUsers[] } = {};
    
    messages.forEach((message) => {
      const date = new Date(message.createdAt).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    
    return groups;
  };

  const getDateLabel = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    
    if (dateString === today) return "Today";
    if (dateString === yesterday) return "Yesterday";
    return date.toLocaleDateString("en-KE", { 
      weekday: "long", 
      year: "numeric", 
      month: "long", 
      day: "numeric" 
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        {/* Loading Messages */}
        <div className="flex-1 p-4 space-y-4 overflow-y-auto">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
              <div className="flex items-start gap-2 max-w-xs">
                {i % 2 !== 0 && <Skeleton className="h-8 w-8 rounded-full" />}
                <div className="space-y-2">
                  <Skeleton className="h-16 w-48 rounded-lg" />
                  <Skeleton className="h-3 w-20" />
                </div>
                {i % 2 === 0 && <Skeleton className="h-8 w-8 rounded-full" />}
              </div>
            </div>
          ))}
        </div>
        
        {/* Loading Input */}
        <div className="border-t p-4">
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      </div>
    );
  }

  const messageGroups = groupMessagesByDate(messages);
  const sortedDates = Object.keys(messageGroups).sort((a, b) => 
    new Date(a).getTime() - new Date(b).getTime()
  );

  return (
    <div className="flex flex-col h-full bg-neutral-50">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 bg-neutral-200 rounded-full flex items-center justify-center mb-4">
              <Send className="h-8 w-8 text-neutral-400" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">
              Start the conversation
            </h3>
            <p className="text-neutral-600 max-w-sm">
              Send your first message to begin discussing the car details, 
              arrange a viewing, or negotiate the price.
            </p>
          </div>
        ) : (
          <>
            {sortedDates.map((dateString) => (
              <div key={dateString}>
                {/* Date Separator */}
                <div className="flex items-center justify-center mb-4">
                  <Badge variant="outline" className="bg-white">
                    {getDateLabel(dateString)}
                  </Badge>
                </div>
                
                {/* Messages for this date */}
                <div className="space-y-4">
                  {messageGroups[dateString].map((message, index) => {
                    const isCurrentUser = message.senderId === currentUserId;
                    const showAvatar = index === 0 || 
                      messageGroups[dateString][index - 1]?.senderId !== message.senderId;
                    
                    return (
                      <div
                        key={message.id}
                        className={`flex items-end gap-2 ${
                          isCurrentUser ? "justify-end" : "justify-start"
                        }`}
                      >
                        {/* Sender Avatar (for received messages) */}
                        {!isCurrentUser && (
                          <Avatar className={`h-8 w-8 ${showAvatar ? 'visible' : 'invisible'}`}>
                            <AvatarImage src={message.sender.profileImage} />
                            <AvatarFallback className="text-xs">
                              {message.sender.firstName[0]}{message.sender.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        
                        {/* Message Content */}
                        <div className={`max-w-xs lg:max-w-md ${isCurrentUser ? 'order-1' : ''}`}>
                          <Card
                            className={`p-3 ${
                              isCurrentUser
                                ? "bg-primary text-primary-foreground ml-auto"
                                : "bg-white"
                            }`}
                          >
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">
                              {message.content}
                            </p>
                          </Card>
                          
                          {/* Message Meta */}
                          <div className={`flex items-center gap-1 mt-1 text-xs text-neutral-500 ${
                            isCurrentUser ? 'justify-end' : 'justify-start'
                          }`}>
                            <span>{formatMessageTime(message.createdAt)}</span>
                            {isCurrentUser && (
                              <div className="flex items-center">
                                {message.isRead ? (
                                  <CheckCheck className="h-3 w-3 text-blue-500" />
                                ) : (
                                  <Check className="h-3 w-3" />
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Current User Avatar */}
                        {isCurrentUser && (
                          <Avatar className={`h-8 w-8 ${showAvatar ? 'visible' : 'invisible'}`}>
                            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                              You
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
            
            {/* Scroll anchor */}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t bg-white p-4">
        <div className="flex items-end gap-2">
          {/* Attachment Button */}
          <Button variant="ghost" size="sm" className="flex-shrink-0">
            <Paperclip className="h-4 w-4" />
          </Button>
          
          {/* Message Input */}
          <div className="flex-1 relative">
            <Input
              ref={inputRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              disabled={isSending}
              className="pr-12 resize-none"
              maxLength={1000}
            />
            
            {/* Emoji Button */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 h-6 w-6"
            >
              <Smile className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Send Button */}
          <Button 
            onClick={handleSend}
            disabled={!newMessage.trim() || isSending}
            size="sm"
            className="flex-shrink-0"
          >
            {isSending ? (
              <Clock className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        
        {/* Character Count */}
        {newMessage.length > 800 && (
          <div className="text-xs text-neutral-500 mt-2 text-right">
            {newMessage.length}/1000
          </div>
        )}
      </div>
    </div>
  );
}
