import { pgTable, text, serial, integer, boolean, timestamp, decimal, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  phone: text("phone"),
  profileImage: text("profile_image"),
  isVerified: boolean("is_verified").default(false),
  location: text("location"),
  userType: text("user_type").notNull().default("individual"), // individual, dealer, broker
  bio: text("bio"),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0"),
  totalRatings: integer("total_ratings").default(0),
  // Advanced seller verification
  idDocument: text("id_document"), // URL to uploaded ID
  idDocumentType: text("id_document_type"), // passport, national_id, driving_license
  idVerificationStatus: text("id_verification_status").default("pending"), // pending, verified, rejected
  businessLicense: text("business_license"), // For dealers
  dealershipName: text("dealership_name"),
  // M-Pesa integration
  mpesaPhoneNumber: text("mpesa_phone_number"),
  // Premium features
  isPremiumSeller: boolean("is_premium_seller").default(false),
  premiumExpiresAt: timestamp("premium_expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Cars table
export const cars = pgTable("cars", {
  id: serial("id").primaryKey(),
  sellerId: integer("seller_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  make: text("make").notNull(),
  model: text("model").notNull(),
  year: integer("year").notNull(),
  price: decimal("price", { precision: 12, scale: 2 }).notNull(),
  mileage: integer("mileage").notNull(),
  fuelType: text("fuel_type").notNull(), // petrol, diesel, electric, hybrid
  transmission: text("transmission").notNull(), // manual, automatic
  bodyType: text("body_type").notNull(), // sedan, suv, hatchback, etc.
  color: text("color").notNull(),
  condition: text("condition").notNull(), // new, used, certified
  description: text("description").notNull(),
  features: text("features").array().default([]),
  images: text("images").array().default([]),
  location: text("location").notNull(),
  county: text("county").notNull(),
  isAvailable: boolean("is_available").default(true),
  isFeatured: boolean("is_featured").default(false),
  isPremium: boolean("is_premium").default(false),
  viewCount: integer("view_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Messages table
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id").notNull().references(() => users.id),
  receiverId: integer("receiver_id").notNull().references(() => users.id),
  carId: integer("car_id").references(() => cars.id),
  content: text("content").notNull(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Blog posts table
export const blogPosts = pgTable("blog_posts", {
  id: serial("id").primaryKey(),
  authorId: integer("author_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  excerpt: text("excerpt").notNull(),
  content: text("content").notNull(),
  featuredImage: text("featured_image"),
  category: text("category").notNull(), // buying-guide, finance, market-trends, etc.
  tags: text("tags").array().default([]),
  isPublished: boolean("is_published").default(false),
  readTime: integer("read_time").notNull(), // in minutes
  viewCount: integer("view_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Favorites table
export const favorites = pgTable("favorites", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  carId: integer("car_id").notNull().references(() => cars.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Reviews table
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  reviewerId: integer("reviewer_id").notNull().references(() => users.id),
  reviewedUserId: integer("reviewed_user_id").notNull().references(() => users.id),
  carId: integer("car_id").references(() => cars.id),
  rating: integer("rating").notNull(), // 1-5
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Payments table (for listing fees, premium features)
export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  carId: integer("car_id").references(() => cars.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").default("KES"),
  paymentMethod: text("payment_method").notNull(), // mpesa, card, etc.
  paymentReference: text("payment_reference").notNull(),
  status: text("status").notNull().default("pending"), // pending, completed, failed
  purpose: text("purpose").notNull(), // listing_fee, premium_feature, etc.
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  cars: many(cars),
  sentMessages: many(messages, { relationName: "sender" }),
  receivedMessages: many(messages, { relationName: "receiver" }),
  blogPosts: many(blogPosts),
  favorites: many(favorites),
  givenReviews: many(reviews, { relationName: "reviewer" }),
  receivedReviews: many(reviews, { relationName: "reviewed" }),
  payments: many(payments),
}));

export const carsRelations = relations(cars, ({ one, many }) => ({
  seller: one(users, {
    fields: [cars.sellerId],
    references: [users.id],
  }),
  messages: many(messages),
  favorites: many(favorites),
  reviews: many(reviews),
  payments: many(payments),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
    relationName: "sender",
  }),
  receiver: one(users, {
    fields: [messages.receiverId],
    references: [users.id],
    relationName: "receiver",
  }),
  car: one(cars, {
    fields: [messages.carId],
    references: [cars.id],
  }),
}));

export const blogPostsRelations = relations(blogPosts, ({ one }) => ({
  author: one(users, {
    fields: [blogPosts.authorId],
    references: [users.id],
  }),
}));

export const favoritesRelations = relations(favorites, ({ one }) => ({
  user: one(users, {
    fields: [favorites.userId],
    references: [users.id],
  }),
  car: one(cars, {
    fields: [favorites.carId],
    references: [cars.id],
  }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  reviewer: one(users, {
    fields: [reviews.reviewerId],
    references: [users.id],
    relationName: "reviewer",
  }),
  reviewedUser: one(users, {
    fields: [reviews.reviewedUserId],
    references: [users.id],
    relationName: "reviewed",
  }),
  car: one(cars, {
    fields: [reviews.carId],
    references: [cars.id],
  }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  user: one(users, {
    fields: [payments.userId],
    references: [users.id],
  }),
  car: one(cars, {
    fields: [payments.carId],
    references: [cars.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCarSchema = createInsertSchema(cars).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  viewCount: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
  isRead: true,
});

export const insertBlogPostSchema = createInsertSchema(blogPosts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  viewCount: true,
});

export const insertFavoriteSchema = createInsertSchema(favorites).omit({
  id: true,
  createdAt: true,
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
});

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true,
});

// Types
// Car negotiations table
export const negotiations = pgTable("negotiations", {
  id: serial("id").primaryKey(),
  carId: integer("car_id").notNull().references(() => cars.id),
  buyerId: integer("buyer_id").notNull().references(() => users.id),
  sellerId: integer("seller_id").notNull().references(() => users.id),
  offerPrice: decimal("offer_price", { precision: 12, scale: 2 }).notNull(),
  message: text("message"),
  status: text("status").notNull().default("pending"), // pending, accepted, rejected, countered
  counterOffer: decimal("counter_offer", { precision: 12, scale: 2 }),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Real-time chat table
export const chatRooms = pgTable("chat_rooms", {
  id: serial("id").primaryKey(),
  carId: integer("car_id").references(() => cars.id),
  buyerId: integer("buyer_id").notNull().references(() => users.id),
  sellerId: integer("seller_id").notNull().references(() => users.id),
  isActive: boolean("is_active").default(true),
  lastMessageAt: timestamp("last_message_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  roomId: integer("room_id").notNull().references(() => chatRooms.id),
  senderId: integer("sender_id").notNull().references(() => users.id),
  message: text("message").notNull(),
  messageType: text("message_type").default("text"), // text, image, offer, document
  isRead: boolean("is_read").default(false),
  attachmentUrl: text("attachment_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Car analytics for sellers
export const carAnalytics = pgTable("car_analytics", {
  id: serial("id").primaryKey(),
  carId: integer("car_id").notNull().references(() => cars.id),
  date: timestamp("date").notNull(),
  views: integer("views").default(0),
  inquiries: integer("inquiries").default(0),
  favorites: integer("favorites").default(0),
  shares: integer("shares").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// M-Pesa transactions
export const mpesaTransactions = pgTable("mpesa_transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  carId: integer("car_id").references(() => cars.id),
  transactionId: text("transaction_id").notNull().unique(),
  phoneNumber: text("phone_number").notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  transactionType: text("transaction_type").notNull(), // payment, deposit, premium_upgrade
  status: text("status").notNull().default("pending"), // pending, completed, failed
  mpesaReceiptNumber: text("mpesa_receipt_number"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Advanced schema definitions
export const insertNegotiationSchema = createInsertSchema(negotiations);
export const insertChatRoomSchema = createInsertSchema(chatRooms);
export const insertChatMessageSchema = createInsertSchema(chatMessages);
export const insertCarAnalyticsSchema = createInsertSchema(carAnalytics);
export const insertMpesaTransactionSchema = createInsertSchema(mpesaTransactions);

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Car = typeof cars.$inferSelect;
export type InsertCar = z.infer<typeof insertCarSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type BlogPost = typeof blogPosts.$inferSelect;
export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;
export type Favorite = typeof favorites.$inferSelect;
export type InsertFavorite = z.infer<typeof insertFavoriteSchema>;
export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Payment = typeof payments.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Negotiation = typeof negotiations.$inferSelect;
export type InsertNegotiation = z.infer<typeof insertNegotiationSchema>;
export type ChatRoom = typeof chatRooms.$inferSelect;
export type InsertChatRoom = z.infer<typeof insertChatRoomSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type CarAnalytics = typeof carAnalytics.$inferSelect;
export type InsertCarAnalytics = z.infer<typeof insertCarAnalyticsSchema>;
export type MpesaTransaction = typeof mpesaTransactions.$inferSelect;
export type InsertMpesaTransaction = z.infer<typeof insertMpesaTransactionSchema>;
