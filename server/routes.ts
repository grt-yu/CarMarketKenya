import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertCarSchema, 
  insertMessageSchema, 
  insertBlogPostSchema,
  insertFavoriteSchema,
  insertReviewSchema,
  insertPaymentSchema
} from "@shared/schema";
import bcrypt from "bcrypt";
import { z } from "zod";

// Auth schemas
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const registerSchema = insertUserSchema.extend({
  password: z.string().min(6),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = registerSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      // Create user
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
      });

      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      console.error("Registration error:", error);
      res.status(400).json({ message: "Invalid registration data" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Login error:", error);
      res.status(400).json({ message: "Invalid login data" });
    }
  });

  // Car routes
  app.get("/api/cars", async (req, res) => {
    try {
      const {
        make,
        priceMin,
        priceMax,
        location,
        county,
        fuelType,
        transmission,
        bodyType,
        year,
        page = "1",
        limit = "20"
      } = req.query;

      const filters = {
        make: make as string,
        priceMin: priceMin ? parseInt(priceMin as string) : undefined,
        priceMax: priceMax ? parseInt(priceMax as string) : undefined,
        location: location as string,
        county: county as string,
        fuelType: fuelType as string,
        transmission: transmission as string,
        bodyType: bodyType as string,
        year: year ? parseInt(year as string) : undefined,
        limit: parseInt(limit as string),
        offset: (parseInt(page as string) - 1) * parseInt(limit as string),
      };

      const result = await storage.getCars(filters);
      res.json(result);
    } catch (error) {
      console.error("Get cars error:", error);
      res.status(500).json({ message: "Failed to fetch cars" });
    }
  });

  app.get("/api/cars/featured", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 6;
      const cars = await storage.getFeaturedCars(limit);
      res.json(cars);
    } catch (error) {
      console.error("Get featured cars error:", error);
      res.status(500).json({ message: "Failed to fetch featured cars" });
    }
  });

  app.get("/api/cars/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const car = await storage.getCarById(id);
      
      if (!car) {
        return res.status(404).json({ message: "Car not found" });
      }

      // Increment view count
      await storage.incrementCarViews(id);
      
      res.json(car);
    } catch (error) {
      console.error("Get car error:", error);
      res.status(500).json({ message: "Failed to fetch car" });
    }
  });

  app.post("/api/cars", async (req, res) => {
    try {
      const carData = insertCarSchema.parse(req.body);
      const car = await storage.createCar(carData);
      res.status(201).json(car);
    } catch (error) {
      console.error("Create car error:", error);
      res.status(400).json({ message: "Invalid car data" });
    }
  });

  app.put("/api/cars/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = insertCarSchema.partial().parse(req.body);
      const car = await storage.updateCar(id, updates);
      res.json(car);
    } catch (error) {
      console.error("Update car error:", error);
      res.status(400).json({ message: "Invalid car data" });
    }
  });

  app.delete("/api/cars/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteCar(id);
      res.status(204).send();
    } catch (error) {
      console.error("Delete car error:", error);
      res.status(500).json({ message: "Failed to delete car" });
    }
  });

  // Message routes
  app.get("/api/messages/conversations/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const conversations = await storage.getConversations(userId);
      res.json(conversations);
    } catch (error) {
      console.error("Get conversations error:", error);
      res.status(500).json({ message: "Failed to fetch conversations" });
    }
  });

  app.get("/api/messages/:senderId/:receiverId", async (req, res) => {
    try {
      const senderId = parseInt(req.params.senderId);
      const receiverId = parseInt(req.params.receiverId);
      const carId = req.query.carId ? parseInt(req.query.carId as string) : undefined;
      
      const messages = await storage.getMessages(senderId, receiverId, carId);
      res.json(messages);
    } catch (error) {
      console.error("Get messages error:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post("/api/messages", async (req, res) => {
    try {
      const messageData = insertMessageSchema.parse(req.body);
      const message = await storage.createMessage(messageData);
      res.status(201).json(message);
    } catch (error) {
      console.error("Create message error:", error);
      res.status(400).json({ message: "Invalid message data" });
    }
  });

  app.put("/api/messages/:id/read", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.markMessageAsRead(id);
      res.status(204).send();
    } catch (error) {
      console.error("Mark message read error:", error);
      res.status(500).json({ message: "Failed to mark message as read" });
    }
  });

  // Blog routes
  app.get("/api/blog", async (req, res) => {
    try {
      const {
        category,
        published,
        page = "1",
        limit = "10"
      } = req.query;

      const filters = {
        category: category as string,
        published: published === "true",
        limit: parseInt(limit as string),
        offset: (parseInt(page as string) - 1) * parseInt(limit as string),
      };

      const result = await storage.getBlogPosts(filters);
      res.json(result);
    } catch (error) {
      console.error("Get blog posts error:", error);
      res.status(500).json({ message: "Failed to fetch blog posts" });
    }
  });

  app.get("/api/blog/:slug", async (req, res) => {
    try {
      const slug = req.params.slug;
      const post = await storage.getBlogPostBySlug(slug);
      
      if (!post) {
        return res.status(404).json({ message: "Blog post not found" });
      }

      // Increment view count
      await storage.incrementBlogPostViews(post.id);
      
      res.json(post);
    } catch (error) {
      console.error("Get blog post error:", error);
      res.status(500).json({ message: "Failed to fetch blog post" });
    }
  });

  app.post("/api/blog", async (req, res) => {
    try {
      const postData = insertBlogPostSchema.parse(req.body);
      const post = await storage.createBlogPost(postData);
      res.status(201).json(post);
    } catch (error) {
      console.error("Create blog post error:", error);
      res.status(400).json({ message: "Invalid blog post data" });
    }
  });

  // Favorite routes
  app.get("/api/favorites/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const favorites = await storage.getFavorites(userId);
      res.json(favorites);
    } catch (error) {
      console.error("Get favorites error:", error);
      res.status(500).json({ message: "Failed to fetch favorites" });
    }
  });

  app.post("/api/favorites", async (req, res) => {
    try {
      const favoriteData = insertFavoriteSchema.parse(req.body);
      const favorite = await storage.createFavorite(favoriteData);
      res.status(201).json(favorite);
    } catch (error) {
      console.error("Create favorite error:", error);
      res.status(400).json({ message: "Invalid favorite data" });
    }
  });

  app.delete("/api/favorites/:userId/:carId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const carId = parseInt(req.params.carId);
      await storage.deleteFavorite(userId, carId);
      res.status(204).send();
    } catch (error) {
      console.error("Delete favorite error:", error);
      res.status(500).json({ message: "Failed to delete favorite" });
    }
  });

  app.get("/api/favorites/:userId/:carId/check", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const carId = parseInt(req.params.carId);
      const isFavorite = await storage.isFavorite(userId, carId);
      res.json({ isFavorite });
    } catch (error) {
      console.error("Check favorite error:", error);
      res.status(500).json({ message: "Failed to check favorite" });
    }
  });

  // Review routes
  app.get("/api/reviews/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const reviews = await storage.getUserReviews(userId);
      res.json(reviews);
    } catch (error) {
      console.error("Get reviews error:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  app.post("/api/reviews", async (req, res) => {
    try {
      const reviewData = insertReviewSchema.parse(req.body);
      const review = await storage.createReview(reviewData);
      res.status(201).json(review);
    } catch (error) {
      console.error("Create review error:", error);
      res.status(400).json({ message: "Invalid review data" });
    }
  });

  // Payment routes
  app.post("/api/payments", async (req, res) => {
    try {
      const paymentData = insertPaymentSchema.parse(req.body);
      
      // Simulate M-Pesa payment processing
      const payment = await storage.createPayment({
        ...paymentData,
        paymentReference: `MPESA${Date.now()}`,
        status: "completed", // In real implementation, this would be pending until confirmed
      });
      
      res.status(201).json(payment);
    } catch (error) {
      console.error("Create payment error:", error);
      res.status(400).json({ message: "Invalid payment data" });
    }
  });

  app.get("/api/payments/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const payments = await storage.getUserPayments(userId);
      res.json(payments);
    } catch (error) {
      console.error("Get payments error:", error);
      res.status(500).json({ message: "Failed to fetch payments" });
    }
  });

  app.put("/api/payments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = insertPaymentSchema.partial().parse(req.body);
      const payment = await storage.updatePayment(id, updates);
      res.json(payment);
    } catch (error) {
      console.error("Update payment error:", error);
      res.status(400).json({ message: "Invalid payment data" });
    }
  });

  // User routes
  app.get("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.getUser(id);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.put("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = insertUserSchema.partial().parse(req.body);
      
      // If password is being updated, hash it
      if (updates.password) {
        updates.password = await bcrypt.hash(updates.password, 10);
      }
      
      const user = await storage.updateUser(id, updates);
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Update user error:", error);
      res.status(400).json({ message: "Invalid user data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
