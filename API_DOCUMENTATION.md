# 🚗 Kenya Car Marketplace API Documentation

## Base URL
```
http://localhost:5000/api
```

## 🚙 Car Management

### List Cars
```http
GET /api/cars
```

**Query Parameters:**
- `make` (string): Filter by car make (Toyota, Honda, Nissan, etc.)
- `priceMin` (number): Minimum price in KES
- `priceMax` (number): Maximum price in KES
- `location` (string): Filter by location
- `county` (string): Filter by Kenyan county
- `fuelType` (string): petrol, diesel, hybrid, electric
- `transmission` (string): manual, automatic, cvt
- `bodyType` (string): sedan, hatchback, suv, pickup
- `year` (number): Manufacturing year
- `limit` (number): Results per page (default: 20)
- `offset` (number): Page offset

### Featured Cars
```http
GET /api/cars/featured
```

### Get Car Details
```http
GET /api/cars/:id
```

### Create Car Listing
```http
POST /api/cars
```

## 🤖 AI-Powered Features

### Get AI Pricing Analysis
```http
POST /api/ai/pricing
```
Provides intelligent market valuation using DeepSeek AI

### Compare Cars
```http
POST /api/ai/compare-cars
```
Side-by-side AI-powered car comparison with pros/cons analysis

### Car History Analysis
```http
POST /api/ai/car-history
```
Comprehensive reliability and market history insights

## 💬 Real-Time Messaging

### WebSocket Connection
```javascript
const ws = new WebSocket('ws://localhost:5000/ws');
```

### Get Conversations
```http
GET /api/messages/conversations
```

### Send Message
```http
POST /api/messages
```

## 💳 M-Pesa Integration

### Initiate Payment
```http
POST /api/mpesa/initiate
```

**Request Body:**
```json
{
  "phoneNumber": "254712345678",
  "amount": 50000,
  "carId": 1,
  "transactionType": "car_deposit"
}
```

## 📝 Content Management

### Blog Posts
```http
GET /api/blog
GET /api/blog/:slug
POST /api/blog
```

### User Reviews
```http
GET /api/users/:id/reviews
POST /api/reviews
```

## ❤️ User Features

### Favorites
```http
GET /api/favorites
POST /api/favorites
DELETE /api/favorites/:carId
```

### User Verification
```http
POST /api/verification/upload-id
PUT /api/verification/approve/:userId
```

## 📊 Analytics Dashboard

### Seller Analytics
```http
GET /api/analytics/seller/:userId
```

Returns comprehensive metrics including:
- Total listings and views
- Inquiry conversion rates
- Performance trends
- Market insights

---

## 🔒 Security Features

- Input validation with Zod schemas
- SQL injection prevention
- Secure password hashing
- Session management
- CSRF protection

## 🌍 Kenya-Specific Features

- County-based location filtering (47 counties)
- KES currency formatting
- Local phone number validation (+254)
- Kenya-specific car makes and models
- Import duty considerations in pricing