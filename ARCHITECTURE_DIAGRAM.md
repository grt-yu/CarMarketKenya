# 🏗️ Kenya Car Marketplace - System Architecture

## Application Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React + TypeScript)               │
├─────────────────────────────────────────────────────────────────────┤
│  📱 Pages                    🧩 Components                          │
│  ├── Home                   ├── CarCard                             │
│  ├── Cars Listing          ├── SearchForm                          │
│  ├── Car Details           ├── AIPricingWidget                     │
│  ├── Sell Car              ├── MpesaPayment                        │
│  ├── Messages              ├── MessageChat                         │
│  ├── Blog                  └── CarForm                             │
│  └── Profile                                                       │
└─────────────────────────────────────────────────────────────────────┘
                                    │ HTTP/WebSocket
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      BACKEND (Express + TypeScript)                 │
├─────────────────────────────────────────────────────────────────────┤
│  🛣️ API Routes              🔧 Services                            │
│  ├── /api/cars             ├── AICarPricing                        │
│  ├── /api/messages         ├── MpesaIntegration                     │
│  ├── /api/blog             ├── DatabaseStorage                     │
│  ├── /api/mpesa            └── WebSocket Server                    │
│  ├── /api/ai/*                                                     │
│  └── /api/users                                                    │
└─────────────────────────────────────────────────────────────────────┘
                │                    │                    │
                ▼                    ▼                    ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   PostgreSQL    │    │   DeepSeek AI   │    │     M-Pesa      │
│    Database     │    │      API        │    │   Gateway       │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ • Users         │    │ • Car Pricing   │    │ • STK Push      │
│ • Cars          │    │ • Comparison    │    │ • Callbacks     │
│ • Messages      │    │ • History       │    │ • Validation    │
│ • Blog Posts    │    │   Analysis      │    │                 │
│ • Payments      │    │                 │    │                 │
│ • Analytics     │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Data Flow Architecture

```
┌─────────────┐    Search/Filter    ┌─────────────┐    AI Analysis    ┌─────────────┐
│    USER     │ ──────────────────► │   CAR API   │ ─────────────────► │ DEEPSEEK AI │
│ (Buyer)     │                     │             │                    │   SERVICE   │
└─────────────┘                     └─────────────┘                    └─────────────┘
      │                                    │                                   │
      │ Message                            │ Store                             │
      ▼                                    ▼                                   ▼
┌─────────────┐    Real-time        ┌─────────────┐    Pricing Data    ┌─────────────┐
│ WEBSOCKET   │ ◄─────────────────► │  DATABASE   │ ◄─────────────────► │  PRICING    │
│   SERVER    │                     │ PostgreSQL  │                     │  ANALYSIS   │
└─────────────┘                     └─────────────┘                     └─────────────┘
      │                                    │
      │ Chat Messages                      │ Payment Records
      ▼                                    ▼
┌─────────────┐    Payment          ┌─────────────┐
│    USER     │ ──────────────────► │ M-PESA API  │
│ (Seller)    │                     │             │
└─────────────┘                     └─────────────┘
```

## Feature Integration Map

```
🚗 CAR LISTINGS
├── 🔍 Advanced Search & Filters
├── 🤖 AI-Powered Pricing Analysis
├── 📊 Market Comparison Tools
├── 📈 Performance Analytics
└── 🏷️ Status Management

💬 REAL-TIME MESSAGING
├── 🔄 WebSocket Communication
├── 📱 Mobile-Optimized Interface
├── 📝 Message History
└── 🔔 Notification System

💳 PAYMENT PROCESSING
├── 📱 M-Pesa Integration
├── 💰 Multiple Payment Types
├── 🧾 Transaction Records
└── 🔒 Security Features

👤 USER MANAGEMENT
├── ✅ Seller Verification
├── ⭐ Rating System
├── 📋 Profile Management
└── 🏢 Dealer vs Individual

📝 CONTENT SYSTEM
├── 📰 Blog Management
├── 🔗 SEO Optimization
├── 📂 Category Organization
└── 🖼️ Media Management
```

## Technology Stack Visualization

```
┌─────────────────────────────────────────────────────────────────────┐
│                           TECH STACK                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Frontend:                     Backend:                             │
│  ┌─────────────┐              ┌─────────────┐                      │
│  │   React     │              │   Node.js   │                      │
│  │ TypeScript  │              │   Express   │                      │
│  │ Tailwind    │              │ TypeScript  │                      │
│  │ shadcn/ui   │              │             │                      │
│  └─────────────┘              └─────────────┘                      │
│                                                                     │
│  Database:                     AI/ML:                              │
│  ┌─────────────┐              ┌─────────────┐                      │
│  │ PostgreSQL  │              │ DeepSeek AI │                      │
│  │ Drizzle ORM │              │  Pricing    │                      │
│  │   Schemas   │              │ Comparison  │                      │
│  └─────────────┘              └─────────────┘                      │
│                                                                     │
│  Payments:                     Real-time:                          │
│  ┌─────────────┐              ┌─────────────┐                      │
│  │   M-Pesa    │              │ WebSockets  │                      │
│  │ Integration │              │    Chat     │                      │
│  │ STK Push    │              │ Messaging   │                      │
│  └─────────────┘              └─────────────┘                      │
└─────────────────────────────────────────────────────────────────────┘
```

## Security & Performance Features

```
🔒 SECURITY LAYERS
├── Input Validation (Zod Schemas)
├── SQL Injection Prevention (Drizzle ORM)
├── Password Hashing (bcrypt)
├── Session Management
├── CSRF Protection
└── Environment Variables Protection

⚡ PERFORMANCE OPTIMIZATIONS
├── Database Query Optimization
├── Image Lazy Loading
├── Component Code Splitting
├── Caching Strategies
├── Mobile-First Design
└── SEO Optimization
```