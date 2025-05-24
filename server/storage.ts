import {
  users,
  cars,
  messages,
  blogPosts,
  favorites,
  reviews,
  payments,
  type User,
  type InsertUser,
  type Car,
  type InsertCar,
  type Message,
  type InsertMessage,
  type BlogPost,
  type InsertBlogPost,
  type Favorite,
  type InsertFavorite,
  type Review,
  type InsertReview,
  type Payment,
  type InsertPayment,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, ilike, gte, lte, inArray, sql } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<InsertUser>): Promise<User>;

  // Car operations
  getCars(filters?: {
    make?: string;
    priceMin?: number;
    priceMax?: number;
    location?: string;
    county?: string;
    fuelType?: string;
    transmission?: string;
    bodyType?: string;
    year?: number;
    limit?: number;
    offset?: number;
  }): Promise<{ cars: (Car & { seller: User })[], total: number }>;
  getCarById(id: number): Promise<(Car & { seller: User }) | undefined>;
  getFeaturedCars(limit?: number): Promise<(Car & { seller: User })[]>;
  createCar(car: InsertCar): Promise<Car>;
  updateCar(id: number, updates: Partial<InsertCar>): Promise<Car>;
  deleteCar(id: number): Promise<void>;
  incrementCarViews(id: number): Promise<void>;

  // Message operations
  getConversations(userId: number): Promise<{ user: User; lastMessage: Message; unreadCount: number }[]>;
  getMessages(senderId: number, receiverId: number, carId?: number): Promise<(Message & { sender: User; receiver: User })[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  markMessageAsRead(id: number): Promise<void>;

  // Blog operations
  getBlogPosts(filters?: {
    category?: string;
    published?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<{ posts: (BlogPost & { author: User })[], total: number }>;
  getBlogPostBySlug(slug: string): Promise<(BlogPost & { author: User }) | undefined>;
  createBlogPost(post: InsertBlogPost): Promise<BlogPost>;
  updateBlogPost(id: number, updates: Partial<InsertBlogPost>): Promise<BlogPost>;
  incrementBlogPostViews(id: number): Promise<void>;

  // Favorite operations
  getFavorites(userId: number): Promise<(Favorite & { car: Car & { seller: User } })[]>;
  createFavorite(favorite: InsertFavorite): Promise<Favorite>;
  deleteFavorite(userId: number, carId: number): Promise<void>;
  isFavorite(userId: number, carId: number): Promise<boolean>;

  // Review operations
  getUserReviews(userId: number): Promise<(Review & { reviewer: User; car?: Car })[]>;
  createReview(review: InsertReview): Promise<Review>;

  // Payment operations
  createPayment(payment: InsertPayment): Promise<Payment>;
  updatePayment(id: number, updates: Partial<InsertPayment>): Promise<Payment>;
  getUserPayments(userId: number): Promise<Payment[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Car operations
  async getCars(filters: {
    make?: string;
    priceMin?: number;
    priceMax?: number;
    location?: string;
    county?: string;
    fuelType?: string;
    transmission?: string;
    bodyType?: string;
    year?: number;
    limit?: number;
    offset?: number;
  } = {}): Promise<{ cars: (Car & { seller: User })[], total: number }> {
    let query = db
      .select({
        id: cars.id,
        sellerId: cars.sellerId,
        title: cars.title,
        make: cars.make,
        model: cars.model,
        year: cars.year,
        price: cars.price,
        mileage: cars.mileage,
        fuelType: cars.fuelType,
        transmission: cars.transmission,
        bodyType: cars.bodyType,
        color: cars.color,
        condition: cars.condition,
        description: cars.description,
        features: cars.features,
        images: cars.images,
        location: cars.location,
        county: cars.county,
        isAvailable: cars.isAvailable,
        isFeatured: cars.isFeatured,
        isPremium: cars.isPremium,
        viewCount: cars.viewCount,
        createdAt: cars.createdAt,
        updatedAt: cars.updatedAt,
        seller: {
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          phone: users.phone,
          profileImage: users.profileImage,
          isVerified: users.isVerified,
          location: users.location,
          userType: users.userType,
          bio: users.bio,
          rating: users.rating,
          totalRatings: users.totalRatings,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        },
      })
      .from(cars)
      .innerJoin(users, eq(cars.sellerId, users.id))
      .where(eq(cars.isAvailable, true));

    const conditions = [];
    
    if (filters.make) {
      conditions.push(ilike(cars.make, `%${filters.make}%`));
    }
    if (filters.priceMin) {
      conditions.push(gte(cars.price, filters.priceMin.toString()));
    }
    if (filters.priceMax) {
      conditions.push(lte(cars.price, filters.priceMax.toString()));
    }
    if (filters.location) {
      conditions.push(ilike(cars.location, `%${filters.location}%`));
    }
    if (filters.county) {
      conditions.push(ilike(cars.county, `%${filters.county}%`));
    }
    if (filters.fuelType) {
      conditions.push(eq(cars.fuelType, filters.fuelType));
    }
    if (filters.transmission) {
      conditions.push(eq(cars.transmission, filters.transmission));
    }
    if (filters.bodyType) {
      conditions.push(eq(cars.bodyType, filters.bodyType));
    }
    if (filters.year) {
      conditions.push(eq(cars.year, filters.year));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Get total count
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(cars)
      .innerJoin(users, eq(cars.sellerId, users.id))
      .where(conditions.length > 0 ? and(eq(cars.isAvailable, true), ...conditions) : eq(cars.isAvailable, true));

    // Get paginated results
    const resultQuery = query
      .orderBy(desc(cars.isFeatured), desc(cars.createdAt))
      .limit(filters.limit || 20)
      .offset(filters.offset || 0);

    const result = await resultQuery;

    return {
      cars: result.map(row => ({
        ...row,
        password: undefined,
      })) as (Car & { seller: User })[],
      total: count,
    };
  }

  async getCarById(id: number): Promise<(Car & { seller: User }) | undefined> {
    const [result] = await db
      .select({
        id: cars.id,
        sellerId: cars.sellerId,
        title: cars.title,
        make: cars.make,
        model: cars.model,
        year: cars.year,
        price: cars.price,
        mileage: cars.mileage,
        fuelType: cars.fuelType,
        transmission: cars.transmission,
        bodyType: cars.bodyType,
        color: cars.color,
        condition: cars.condition,
        description: cars.description,
        features: cars.features,
        images: cars.images,
        location: cars.location,
        county: cars.county,
        isAvailable: cars.isAvailable,
        isFeatured: cars.isFeatured,
        isPremium: cars.isPremium,
        viewCount: cars.viewCount,
        createdAt: cars.createdAt,
        updatedAt: cars.updatedAt,
        seller: {
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          phone: users.phone,
          profileImage: users.profileImage,
          isVerified: users.isVerified,
          location: users.location,
          userType: users.userType,
          bio: users.bio,
          rating: users.rating,
          totalRatings: users.totalRatings,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        },
      })
      .from(cars)
      .innerJoin(users, eq(cars.sellerId, users.id))
      .where(eq(cars.id, id));

    if (!result) return undefined;

    return {
      ...result,
      seller: {
        ...result.seller,
        password: undefined,
      }
    } as Car & { seller: User };
  }

  async getFeaturedCars(limit = 6): Promise<(Car & { seller: User })[]> {
    const result = await db
      .select({
        id: cars.id,
        sellerId: cars.sellerId,
        title: cars.title,
        make: cars.make,
        model: cars.model,
        year: cars.year,
        price: cars.price,
        mileage: cars.mileage,
        fuelType: cars.fuelType,
        transmission: cars.transmission,
        bodyType: cars.bodyType,
        color: cars.color,
        condition: cars.condition,
        description: cars.description,
        features: cars.features,
        images: cars.images,
        location: cars.location,
        county: cars.county,
        isAvailable: cars.isAvailable,
        isFeatured: cars.isFeatured,
        isPremium: cars.isPremium,
        viewCount: cars.viewCount,
        createdAt: cars.createdAt,
        updatedAt: cars.updatedAt,
        seller: {
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          phone: users.phone,
          profileImage: users.profileImage,
          isVerified: users.isVerified,
          location: users.location,
          userType: users.userType,
          bio: users.bio,
          rating: users.rating,
          totalRatings: users.totalRatings,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        },
      })
      .from(cars)
      .innerJoin(users, eq(cars.sellerId, users.id))
      .where(and(eq(cars.isAvailable, true), eq(cars.isFeatured, true)))
      .orderBy(desc(cars.createdAt))
      .limit(limit);

    return result.map(row => ({
      ...row,
      seller: {
        ...row.seller,
        password: undefined,
      }
    })) as (Car & { seller: User })[];
  }

  async createCar(car: InsertCar): Promise<Car> {
    const [newCar] = await db.insert(cars).values(car).returning();
    return newCar;
  }

  async updateCar(id: number, updates: Partial<InsertCar>): Promise<Car> {
    const [car] = await db
      .update(cars)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(cars.id, id))
      .returning();
    return car;
  }

  async deleteCar(id: number): Promise<void> {
    await db.delete(cars).where(eq(cars.id, id));
  }

  async incrementCarViews(id: number): Promise<void> {
    await db
      .update(cars)
      .set({ viewCount: sql`${cars.viewCount} + 1` })
      .where(eq(cars.id, id));
  }

  // Message operations
  async getConversations(userId: number): Promise<{ user: User; lastMessage: Message; unreadCount: number }[]> {
    // This is a simplified implementation - in production you'd want a more sophisticated query
    const userMessages = await db
      .select()
      .from(messages)
      .innerJoin(users, eq(messages.senderId, users.id))
      .where(eq(messages.receiverId, userId))
      .orderBy(desc(messages.createdAt));

    // Group by sender and get latest message + unread count
    const conversations = new Map();
    
    for (const msg of userMessages) {
      const senderId = msg.messages.senderId;
      if (!conversations.has(senderId)) {
        const unreadCount = await db
          .select({ count: sql<number>`count(*)` })
          .from(messages)
          .where(and(
            eq(messages.senderId, senderId),
            eq(messages.receiverId, userId),
            eq(messages.isRead, false)
          ));
        
        conversations.set(senderId, {
          user: { ...msg.users, password: undefined },
          lastMessage: msg.messages,
          unreadCount: unreadCount[0].count,
        });
      }
    }

    return Array.from(conversations.values());
  }

  async getMessages(senderId: number, receiverId: number, carId?: number): Promise<(Message & { sender: User; receiver: User })[]> {
    let query = db
      .select({
        id: messages.id,
        senderId: messages.senderId,
        receiverId: messages.receiverId,
        carId: messages.carId,
        content: messages.content,
        isRead: messages.isRead,
        createdAt: messages.createdAt,
        sender: {
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          phone: users.phone,
          profileImage: users.profileImage,
          isVerified: users.isVerified,
          location: users.location,
          userType: users.userType,
          bio: users.bio,
          rating: users.rating,
          totalRatings: users.totalRatings,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        },
        receiver: users,
      })
      .from(messages)
      .innerJoin(users, eq(messages.senderId, users.id));

    const conditions = [
      and(
        eq(messages.senderId, senderId),
        eq(messages.receiverId, receiverId)
      ),
      and(
        eq(messages.senderId, receiverId),
        eq(messages.receiverId, senderId)
      )
    ];

    if (carId) {
      conditions.push(eq(messages.carId, carId));
    }

    const result = await query
      .where(and(...conditions))
      .orderBy(asc(messages.createdAt));

    return result.map(row => ({
      ...row,
      sender: { ...row.sender, password: undefined },
      receiver: { ...row.receiver, password: undefined },
    })) as (Message & { sender: User; receiver: User })[];
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db.insert(messages).values(message).returning();
    return newMessage;
  }

  async markMessageAsRead(id: number): Promise<void> {
    await db
      .update(messages)
      .set({ isRead: true })
      .where(eq(messages.id, id));
  }

  // Blog operations
  async getBlogPosts(filters: {
    category?: string;
    published?: boolean;
    limit?: number;
    offset?: number;
  } = {}): Promise<{ posts: (BlogPost & { author: User })[], total: number }> {
    let query = db
      .select({
        id: blogPosts.id,
        authorId: blogPosts.authorId,
        title: blogPosts.title,
        slug: blogPosts.slug,
        excerpt: blogPosts.excerpt,
        content: blogPosts.content,
        featuredImage: blogPosts.featuredImage,
        category: blogPosts.category,
        tags: blogPosts.tags,
        isPublished: blogPosts.isPublished,
        readTime: blogPosts.readTime,
        viewCount: blogPosts.viewCount,
        createdAt: blogPosts.createdAt,
        updatedAt: blogPosts.updatedAt,
        author: {
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          phone: users.phone,
          profileImage: users.profileImage,
          isVerified: users.isVerified,
          location: users.location,
          userType: users.userType,
          bio: users.bio,
          rating: users.rating,
          totalRatings: users.totalRatings,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        },
      })
      .from(blogPosts)
      .innerJoin(users, eq(blogPosts.authorId, users.id));

    const conditions = [];
    
    if (filters.category) {
      conditions.push(eq(blogPosts.category, filters.category));
    }
    if (filters.published !== undefined) {
      conditions.push(eq(blogPosts.isPublished, filters.published));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Get total count
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(blogPosts)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    // Get paginated results
    const result = await query
      .orderBy(desc(blogPosts.createdAt))
      .limit(filters.limit || 10)
      .offset(filters.offset || 0);

    return {
      posts: result.map(row => ({
        ...row,
        author: { ...row.author, password: undefined },
      })) as (BlogPost & { author: User })[],
      total: count,
    };
  }

  async getBlogPostBySlug(slug: string): Promise<(BlogPost & { author: User }) | undefined> {
    const [result] = await db
      .select({
        id: blogPosts.id,
        authorId: blogPosts.authorId,
        title: blogPosts.title,
        slug: blogPosts.slug,
        excerpt: blogPosts.excerpt,
        content: blogPosts.content,
        featuredImage: blogPosts.featuredImage,
        category: blogPosts.category,
        tags: blogPosts.tags,
        isPublished: blogPosts.isPublished,
        readTime: blogPosts.readTime,
        viewCount: blogPosts.viewCount,
        createdAt: blogPosts.createdAt,
        updatedAt: blogPosts.updatedAt,
        author: {
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          phone: users.phone,
          profileImage: users.profileImage,
          isVerified: users.isVerified,
          location: users.location,
          userType: users.userType,
          bio: users.bio,
          rating: users.rating,
          totalRatings: users.totalRatings,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        },
      })
      .from(blogPosts)
      .innerJoin(users, eq(blogPosts.authorId, users.id))
      .where(eq(blogPosts.slug, slug));

    if (!result) return undefined;

    return {
      ...result,
      author: { ...result.author, password: undefined },
    } as BlogPost & { author: User };
  }

  async createBlogPost(post: InsertBlogPost): Promise<BlogPost> {
    const [newPost] = await db.insert(blogPosts).values(post).returning();
    return newPost;
  }

  async updateBlogPost(id: number, updates: Partial<InsertBlogPost>): Promise<BlogPost> {
    const [post] = await db
      .update(blogPosts)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(blogPosts.id, id))
      .returning();
    return post;
  }

  async incrementBlogPostViews(id: number): Promise<void> {
    await db
      .update(blogPosts)
      .set({ viewCount: sql`${blogPosts.viewCount} + 1` })
      .where(eq(blogPosts.id, id));
  }

  // Favorite operations
  async getFavorites(userId: number): Promise<(Favorite & { car: Car & { seller: User } })[]> {
    const result = await db
      .select({
        id: favorites.id,
        userId: favorites.userId,
        carId: favorites.carId,
        createdAt: favorites.createdAt,
        car: {
          id: cars.id,
          sellerId: cars.sellerId,
          title: cars.title,
          make: cars.make,
          model: cars.model,
          year: cars.year,
          price: cars.price,
          mileage: cars.mileage,
          fuelType: cars.fuelType,
          transmission: cars.transmission,
          bodyType: cars.bodyType,
          color: cars.color,
          condition: cars.condition,
          description: cars.description,
          features: cars.features,
          images: cars.images,
          location: cars.location,
          county: cars.county,
          isAvailable: cars.isAvailable,
          isFeatured: cars.isFeatured,
          isPremium: cars.isPremium,
          viewCount: cars.viewCount,
          createdAt: cars.createdAt,
          updatedAt: cars.updatedAt,
          seller: {
            id: users.id,
            email: users.email,
            firstName: users.firstName,
            lastName: users.lastName,
            phone: users.phone,
            profileImage: users.profileImage,
            isVerified: users.isVerified,
            location: users.location,
            userType: users.userType,
            bio: users.bio,
            rating: users.rating,
            totalRatings: users.totalRatings,
            createdAt: users.createdAt,
            updatedAt: users.updatedAt,
          },
        },
      })
      .from(favorites)
      .innerJoin(cars, eq(favorites.carId, cars.id))
      .innerJoin(users, eq(cars.sellerId, users.id))
      .where(eq(favorites.userId, userId))
      .orderBy(desc(favorites.createdAt));

    return result.map(row => ({
      ...row,
      car: {
        ...row.car,
        seller: { ...row.car.seller, password: undefined },
      },
    })) as (Favorite & { car: Car & { seller: User } })[];
  }

  async createFavorite(favorite: InsertFavorite): Promise<Favorite> {
    const [newFavorite] = await db.insert(favorites).values(favorite).returning();
    return newFavorite;
  }

  async deleteFavorite(userId: number, carId: number): Promise<void> {
    await db
      .delete(favorites)
      .where(and(eq(favorites.userId, userId), eq(favorites.carId, carId)));
  }

  async isFavorite(userId: number, carId: number): Promise<boolean> {
    const [favorite] = await db
      .select()
      .from(favorites)
      .where(and(eq(favorites.userId, userId), eq(favorites.carId, carId)));
    return !!favorite;
  }

  // Review operations
  async getUserReviews(userId: number): Promise<(Review & { reviewer: User; car?: Car })[]> {
    const result = await db
      .select({
        id: reviews.id,
        reviewerId: reviews.reviewerId,
        reviewedUserId: reviews.reviewedUserId,
        carId: reviews.carId,
        rating: reviews.rating,
        comment: reviews.comment,
        createdAt: reviews.createdAt,
        reviewer: {
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          phone: users.phone,
          profileImage: users.profileImage,
          isVerified: users.isVerified,
          location: users.location,
          userType: users.userType,
          bio: users.bio,
          rating: users.rating,
          totalRatings: users.totalRatings,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        },
        car: cars,
      })
      .from(reviews)
      .innerJoin(users, eq(reviews.reviewerId, users.id))
      .leftJoin(cars, eq(reviews.carId, cars.id))
      .where(eq(reviews.reviewedUserId, userId))
      .orderBy(desc(reviews.createdAt));

    return result.map(row => ({
      ...row,
      reviewer: { ...row.reviewer, password: undefined },
    })) as (Review & { reviewer: User; car?: Car })[];
  }

  async createReview(review: InsertReview): Promise<Review> {
    const [newReview] = await db.insert(reviews).values(review).returning();
    return newReview;
  }

  // Payment operations
  async createPayment(payment: InsertPayment): Promise<Payment> {
    const [newPayment] = await db.insert(payments).values(payment).returning();
    return newPayment;
  }

  async updatePayment(id: number, updates: Partial<InsertPayment>): Promise<Payment> {
    const [payment] = await db
      .update(payments)
      .set(updates)
      .where(eq(payments.id, id))
      .returning();
    return payment;
  }

  async getUserPayments(userId: number): Promise<Payment[]> {
    return await db
      .select()
      .from(payments)
      .where(eq(payments.userId, userId))
      .orderBy(desc(payments.createdAt));
  }
}

export const storage = new DatabaseStorage();
