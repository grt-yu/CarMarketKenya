import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertCarSchema, 
  insertMessageSchema, 
  insertBlogPostSchema,
  insertFavoriteSchema,
  insertReviewSchema,
  insertPaymentSchema,
  insertNegotiationSchema,
  insertChatRoomSchema,
  insertChatMessageSchema,
  insertMpesaTransactionSchema
} from "@shared/schema";
import bcrypt from "bcrypt";
import { z } from "zod";
import { AICarPricing } from "./ai-pricing";
import { MpesaIntegration, createMpesaTransaction } from "./mpesa-integration";
import { MailService } from '@sendgrid/mail';

// Auth schemas
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const registerSchema = insertUserSchema.extend({
  password: z.string().min(6),
});

// Initialize services
const aiPricing = new AICarPricing();
const mpesa = new MpesaIntegration();
const mailService = new MailService();

if (process.env.SENDGRID_API_KEY) {
  mailService.setApiKey(process.env.SENDGRID_API_KEY);
}

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

  // AI-Powered Car Pricing Routes
  app.post("/api/cars/:id/ai-pricing", async (req, res) => {
    try {
      const carId = parseInt(req.params.id);
      const car = await storage.getCarById(carId);
      
      if (!car) {
        return res.status(404).json({ message: "Car not found" });
      }

      const pricingResult = await aiPricing.analyzePricing({
        make: car.make,
        model: car.model,
        year: car.year,
        mileage: car.mileage,
        condition: car.condition,
        fuelType: car.fuelType,
        transmission: car.transmission,
        bodyType: car.bodyType,
        location: car.location,
        features: car.features
      });

      res.json(pricingResult);
    } catch (error) {
      console.error("AI pricing error:", error);
      res.status(500).json({ message: "AI pricing analysis failed" });
    }
  });

  // AI Car Comparison Route
  app.post("/api/ai/compare-cars", async (req, res) => {
    try {
      const { mainCarId, compareCarIds } = req.body;
      
      const mainCar = await storage.getCarById(mainCarId);
      if (!mainCar) {
        return res.status(404).json({ message: "Main car not found" });
      }

      const compareCars = await Promise.all(
        compareCarIds.map((id: number) => storage.getCarById(id))
      );

      const validCompareCars = compareCars.filter(car => car !== undefined);
      
      const aiPricing = new AICarPricing();
      const comparison = await aiPricing.compareCars(
        {
          make: mainCar.make,
          model: mainCar.model,
          year: mainCar.year,
          mileage: mainCar.mileage,
          condition: mainCar.condition,
          fuelType: mainCar.fuelType,
          transmission: mainCar.transmission,
          bodyType: mainCar.bodyType,
          location: mainCar.location,
          features: mainCar.features || []
        },
        validCompareCars.map(car => ({
          make: car.make,
          model: car.model,
          year: car.year,
          mileage: car.mileage,
          condition: car.condition,
          fuelType: car.fuelType,
          transmission: car.transmission,
          bodyType: car.bodyType,
          location: car.location,
          features: car.features || []
        }))
      );

      res.json(comparison);
    } catch (error) {
      console.error("AI comparison error:", error);
      res.status(500).json({ message: "Car comparison analysis failed" });
    }
  });

  // AI Car History Route
  app.post("/api/ai/car-history", async (req, res) => {
    try {
      const { carId } = req.body;
      
      const car = await storage.getCarById(carId);
      if (!car) {
        return res.status(404).json({ message: "Car not found" });
      }

      const aiPricing = new AICarPricing();
      const history = await aiPricing.getCarHistory({
        make: car.make,
        model: car.model,
        year: car.year,
        mileage: car.mileage,
        condition: car.condition,
        fuelType: car.fuelType,
        transmission: car.transmission,
        bodyType: car.bodyType,
        location: car.location,
        features: car.features || []
      });

      res.json(history);
    } catch (error) {
      console.error("AI history error:", error);
      res.status(500).json({ message: "Car history analysis failed" });
    }
  });

  // M-Pesa Payment Routes
  app.post("/api/mpesa/initiate", async (req, res) => {
    try {
      const { phoneNumber, amount, carId, transactionType } = req.body;
      
      if (!mpesa.validatePhoneNumber(phoneNumber)) {
        return res.status(400).json({ message: "Invalid phone number format" });
      }

      const formattedPhone = mpesa.formatPhoneNumber(phoneNumber);
      let transactionData;

      switch (transactionType) {
        case 'car_deposit':
          transactionData = createMpesaTransaction.carDeposit(carId, amount);
          break;
        case 'premium_upgrade':
          transactionData = createMpesaTransaction.premiumUpgrade(req.body.userId, req.body.duration);
          break;
        case 'car_payment':
          transactionData = createMpesaTransaction.carPayment(carId, amount);
          break;
        default:
          return res.status(400).json({ message: "Invalid transaction type" });
      }

      const result = await mpesa.initiateSTKPush({
        phoneNumber: formattedPhone,
        amount: transactionData.amount,
        accountReference: transactionData.accountReference,
        transactionDesc: transactionData.transactionDesc
      });

      res.json(result);
    } catch (error) {
      console.error("M-Pesa initiation error:", error);
      res.status(500).json({ message: "Payment initiation failed" });
    }
  });

  app.post("/api/mpesa/callback", async (req, res) => {
    try {
      const callbackData = req.body;
      const result = mpesa.processCallback(callbackData);
      
      if (result.success) {
        // Update payment status in database
        console.log("Payment successful:", result);
        // Add logic to update relevant records
      } else {
        console.log("Payment failed:", result.error);
      }
      
      res.json({ ResultCode: 0, ResultDesc: "Accepted" });
    } catch (error) {
      console.error("M-Pesa callback error:", error);
      res.status(500).json({ message: "Callback processing failed" });
    }
  });

  // Real-time Chat Routes
  app.get("/api/chat/rooms/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      // Add chat room logic here once storage is updated
      res.json([]);
    } catch (error) {
      console.error("Get chat rooms error:", error);
      res.status(500).json({ message: "Failed to fetch chat rooms" });
    }
  });

  app.post("/api/chat/rooms", async (req, res) => {
    try {
      const roomData = insertChatRoomSchema.parse(req.body);
      // Add chat room creation logic here once storage is updated
      res.json({ message: "Chat room created" });
    } catch (error) {
      console.error("Create chat room error:", error);
      res.status(400).json({ message: "Invalid chat room data" });
    }
  });

  // Seller Verification Routes
  app.post("/api/verification/upload-id", async (req, res) => {
    try {
      const { userId, documentType, documentUrl } = req.body;
      
      // Update user verification status
      await storage.updateUser(userId, {
        idDocument: documentUrl,
        idDocumentType: documentType,
        idVerificationStatus: "pending"
      });

      // Send notification email to admin
      if (process.env.SENDGRID_API_KEY) {
        await mailService.send({
          to: process.env.ADMIN_EMAIL || "admin@carmarket.com",
          from: process.env.FROM_EMAIL || "noreply@carmarket.com",
          subject: "New ID Verification Request",
          html: `<p>User ${userId} has submitted ID verification documents for review.</p>`
        });
      }

      res.json({ message: "ID verification submitted successfully" });
    } catch (error) {
      console.error("ID verification error:", error);
      res.status(500).json({ message: "ID verification failed" });
    }
  });

  app.put("/api/verification/approve/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const { status } = req.body; // approved, rejected
      
      await storage.updateUser(userId, {
        idVerificationStatus: status,
        isVerified: status === "approved"
      });

      res.json({ message: `Verification ${status}` });
    } catch (error) {
      console.error("Verification approval error:", error);
      res.status(500).json({ message: "Verification update failed" });
    }
  });

  // Analytics Dashboard Routes
  app.get("/api/analytics/seller/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      
      // Get seller analytics data
      const analytics = {
        totalListings: 0,
        totalViews: 0,
        totalInquiries: 0,
        totalFavorites: 0,
        activeListings: 0,
        soldListings: 0,
        averageResponseTime: "2 hours",
        conversionRate: "12%",
        monthlyStats: [],
        topPerformingCars: [],
        recentActivity: []
      };

      res.json(analytics);
    } catch (error) {
      console.error("Analytics error:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // Negotiation Routes
  app.post("/api/negotiations", async (req, res) => {
    try {
      const negotiationData = insertNegotiationSchema.parse(req.body);
      // Add negotiation creation logic here once storage is updated
      res.json({ message: "Negotiation created" });
    } catch (error) {
      console.error("Create negotiation error:", error);
      res.status(400).json({ message: "Invalid negotiation data" });
    }
  });

  app.get("/api/negotiations/car/:carId", async (req, res) => {
    try {
      const carId = parseInt(req.params.carId);
      // Add negotiation fetching logic here once storage is updated
      res.json([]);
    } catch (error) {
      console.error("Get negotiations error:", error);
      res.status(500).json({ message: "Failed to fetch negotiations" });
    }
  });

  // WebSocket setup for real-time chat
  const httpServer = createServer(app);
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws: WebSocket) => {
    console.log('New WebSocket connection established');

    ws.on('message', (message: string) => {
      try {
        const data = JSON.parse(message.toString());
        
        // Handle different message types
        switch (data.type) {
          case 'join_room':
            // Join chat room logic
            break;
          case 'send_message':
            // Send message to room participants
            wss.clients.forEach(client => {
              if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({
                  type: 'new_message',
                  data: data.message
                }));
              }
            });
            break;
          case 'typing':
            // Handle typing indicators
            break;
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      console.log('WebSocket connection closed');
    });
  });

  // Demo data endpoint to populate with 3 sellers and cars
  app.post("/api/demo/populate", async (req, res) => {
    try {
      const bcrypt = require('bcrypt');
      
      // Create 3 demo sellers with enhanced authentication
      const sellers = await Promise.all([
        storage.createUser({
          email: "john.dealer@automart.co.ke",
          password: await bcrypt.hash("password123", 10),
          firstName: "John",
          lastName: "Mwangi", 
          phone: "+254712345678",
          location: "Nairobi",
          userType: "dealer",
          isVerified: true
        }),
        storage.createUser({
          email: "sarah.seller@gmail.com",
          password: await bcrypt.hash("password123", 10),
          firstName: "Sarah",
          lastName: "Kimani",
          phone: "+254723456789", 
          location: "Mombasa",
          userType: "individual",
          isVerified: true
        }),
        storage.createUser({
          email: "peter.motors@outlook.com", 
          password: await bcrypt.hash("password123", 10),
          firstName: "Peter",
          lastName: "Otieno",
          phone: "+254734567890",
          location: "Kisumu", 
          userType: "dealer",
          isVerified: true
        })
      ]);

      // Create cars for each seller
      const cars = await Promise.all([
        // John's premium SUV (Nairobi Dealer)
        storage.createCar({
          sellerId: sellers[0].id,
          title: "2019 Toyota Land Cruiser V8 - Premium SUV",
          make: "Toyota",
          model: "Land Cruiser", 
          year: 2019,
          price: "8500000",
          mileage: 35000,
          fuelType: "Petrol",
          transmission: "Automatic",
          bodyType: "SUV",
          condition: "Excellent",
          description: "Pristine Toyota Land Cruiser V8 with full service history. Perfect for both city and off-road adventures.",
          location: "Nairobi",
          county: "Nairobi",
          images: ["https://images.unsplash.com/photo-1549924231-f129b911e442?w=800&h=600&fit=crop"],
          features: ["Leather Seats", "Sunroof", "4WD", "Navigation System"],
          status: "available"
        }),
        
        // Sarah's family car (Mombasa Individual)
        storage.createCar({
          sellerId: sellers[1].id,
          title: "2018 Nissan X-Trail - Family SUV", 
          make: "Nissan",
          model: "X-Trail",
          year: 2018,
          price: "3800000",
          mileage: 48000,
          fuelType: "Petrol", 
          transmission: "CVT",
          bodyType: "SUV",
          condition: "Very Good",
          description: "Well-maintained family SUV with excellent safety rating. Perfect for growing families.",
          location: "Mombasa",
          county: "Mombasa", 
          images: ["https://images.unsplash.com/photo-1563720223185-11003d516935?w=800&h=600&fit=crop"],
          features: ["7 Seater", "Reverse Camera", "Cruise Control", "Alloy Wheels"],
          status: "available"
        }),
        
        // Peter's modern SUV (Kisumu Dealer)
        storage.createCar({
          sellerId: sellers[2].id,
          title: "2021 Mazda CX-5 - Modern Design SUV",
          make: "Mazda", 
          model: "CX-5",
          year: 2021,
          price: "4500000", 
          mileage: 18000,
          fuelType: "Petrol",
          transmission: "Automatic",
          bodyType: "SUV",
          condition: "Like New",
          description: "Nearly new Mazda CX-5 with stunning design and premium features. Low mileage, still under warranty.",
          location: "Kisumu",
          county: "Kisumu",
          images: ["https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&h=600&fit=crop"], 
          features: ["Skyactiv Technology", "Bose Audio", "Head-Up Display", "Smart Key"],
          status: "available"
        })
      ]);

      res.json({
        message: "Demo data created successfully!", 
        data: {
          sellers: sellers.length,
          cars: cars.length,
          details: {
            sellers: sellers.map(s => ({ name: `${s.firstName} ${s.lastName}`, location: s.location, type: s.userType })),
            cars: cars.map(c => ({ title: c.title, price: c.price, location: c.location }))
          }
        }
      });
    } catch (error) {
      console.error("Demo data creation error:", error);
      res.status(500).json({ 
        message: "Failed to create demo data",
        error: error.message 
      });
    }
  });

  return httpServer;
}
