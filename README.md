# 🚗 Kenya Car Marketplace

A comprehensive car marketplace platform specifically designed for the Kenyan market, featuring AI-powered pricing, M-Pesa integration, and real-time messaging.

## 🌟 Features

### 🔍 **Smart Car Discovery**
- Advanced search with multiple filters (make, model, price, location, etc.)
- Featured car listings on homepage
- County-based location filtering across Kenya
- Real-time availability status

### 🤖 **AI-Powered Tools**
- **Intelligent Pricing**: Get accurate market valuations using DeepSeek AI
- **Car Comparison**: Side-by-side analysis of multiple vehicles
- **History Analysis**: Comprehensive reliability and market insights
- **Market Trends**: Real-time pricing and popularity data

### 💬 **Communication & Messaging**
- Real-time chat between buyers and sellers
- WebSocket-powered instant messaging
- Message history and conversation management
- Mobile-optimized messaging interface

### 💳 **Payment Integration**
- **M-Pesa Integration**: Native Kenyan mobile payment support
- Secure transaction processing
- Payment history and receipts
- Multiple payment options for deposits and full purchases

### 👤 **User Management**
- **Seller Verification**: ID document upload and verification system
- User profiles with ratings and reviews
- Individual and dealer account types
- Profile image and contact management

### 📊 **Analytics Dashboard**
- Seller performance metrics
- Car listing analytics
- View tracking and engagement data
- Market insights and trends

### 📝 **Content Management**
- Blog system for automotive content
- SEO-optimized articles
- Category-based content organization
- Featured articles and guides

## 🏗️ Architecture

### Frontend (React + TypeScript)
```
client/src/
├── components/           # Reusable UI components
│   ├── ui/              # Base UI components (shadcn/ui)
│   ├── car-card.tsx     # Car listing display
│   ├── search-form.tsx  # Advanced search interface
│   ├── ai-pricing-widget.tsx  # AI pricing tool
│   └── mpesa-payment.tsx      # M-Pesa integration
├── pages/               # Route components
│   ├── home.tsx         # Landing page
│   ├── cars.tsx         # Car listings
│   ├── car-details.tsx  # Individual car view
│   ├── sell-car.tsx     # Car listing form
│   ├── messages.tsx     # Messaging interface
│   └── blog.tsx         # Blog system
├── hooks/               # Custom React hooks
└── lib/                 # Utilities and types
```

### Backend (Express + TypeScript)
```
server/
├── routes.ts            # API route definitions
├── storage.ts           # Database operations
├── db.ts               # Database connection
├── ai-pricing.ts       # DeepSeek AI integration
├── mpesa-integration.ts # M-Pesa payment processing
└── seed-data.ts        # Demo data population
```

### Database Schema (PostgreSQL + Drizzle ORM)
```
shared/schema.ts         # Complete database schema
├── users               # User accounts and profiles
├── cars                # Vehicle listings
├── messages            # Chat system
├── blog_posts          # Content management
├── favorites           # User saved cars
├── reviews             # User ratings
├── payments            # Transaction records
├── negotiations        # Price negotiations
└── mpesa_transactions  # M-Pesa payment logs
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- DeepSeek API key (for AI features)
- M-Pesa API credentials (for payments)

### Installation

1. **Clone and Install**
```bash
git clone <repository-url>
cd kenya-car-marketplace
npm install
```

2. **Environment Setup**
```bash
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/carmarketplace

# AI Integration
DEEPSEEK_API_KEY=your_deepseek_api_key

# M-Pesa (Optional)
MPESA_CONSUMER_KEY=your_mpesa_consumer_key
MPESA_CONSUMER_SECRET=your_mpesa_consumer_secret
MPESA_SHORTCODE=your_business_shortcode
MPESA_PASSKEY=your_mpesa_passkey
```

3. **Database Setup**
```bash
npm run db:push
```

4. **Start Development**
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## 📱 Mobile Optimization

The platform is fully responsive and optimized for mobile devices:
- Touch-friendly interface
- Mobile-first design approach
- Optimized images and loading
- Native mobile payment integration

## 🔧 API Endpoints

### Car Management
- `GET /api/cars` - List cars with filters
- `GET /api/cars/:id` - Get car details
- `POST /api/cars` - Create car listing
- `PUT /api/cars/:id` - Update car listing
- `DELETE /api/cars/:id` - Delete car listing

### AI Features
- `POST /api/ai/pricing` - Get AI price analysis
- `POST /api/ai/compare-cars` - Compare multiple cars
- `POST /api/ai/car-history` - Get car history analysis

### Messaging
- `GET /api/messages` - Get conversations
- `POST /api/messages` - Send message
- WebSocket endpoint for real-time chat

### Payments
- `POST /api/mpesa/initiate` - Start M-Pesa payment
- `POST /api/mpesa/callback` - Handle payment callback
- `GET /api/payments/:userId` - Get payment history

## 🎨 UI Components

Built with modern UI components:
- **shadcn/ui** - Base component library
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Beautiful icons
- **Framer Motion** - Smooth animations

## 🔒 Security Features

- Input validation with Zod schemas
- SQL injection prevention with Drizzle ORM
- Secure password hashing with bcrypt
- Environment variable protection
- CSRF protection

## 🌍 Kenyan Market Features

### Localization
- Kenya-specific car makes and models
- County-based location filtering
- KES currency formatting
- Local phone number validation

### Market Intelligence
- Kenya-specific pricing models
- Popular car trends analysis
- Import duty considerations
- Local market insights

## 📈 Performance

- Server-side rendering optimized
- Image optimization and lazy loading
- Database query optimization
- Caching strategies implemented
- Mobile performance prioritized

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the documentation
- Review the API endpoints
- Contact the development team

---

**Built with ❤️ for the Kenyan automotive market**