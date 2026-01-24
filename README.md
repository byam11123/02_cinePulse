# CinePulse Backend

A robust, scalable, and production-ready backend for a movie and TV show discovery application built with the MERN stack.

## 🚀 Features

### Backend Engineering Excellence
- **Rate Limiting**: Protects API endpoints from abuse with configurable limits
- **Comprehensive Logging**: Detailed request/response logging with Winston
- **Centralized Error Handling**: Unified error management with custom error classes
- **Caching Strategy**: Dual-layer caching with Redis (primary) and memory (fallback)
- **Database Optimization**: Connection pooling and optimized queries
- **Service Layer Architecture**: Clean separation of concerns with reusable services
- **API Versioning**: Built-in versioning support for future scalability
- **Input Validation & Sanitization**: Joi-based validation with XSS protection
- **Health Checks**: Monitoring endpoints for system status

### Authentication & Security
- **JWT-based Authentication**: Secure token-based authentication
- **Cookie Management**: HttpOnly, secure cookies for token storage
- **Password Hashing**: BCrypt for secure password storage
- **Rate Limiting**: Protection against brute force attacks

### Performance & Scalability
- **Redis Caching**: High-performance caching for frequent queries
- **Database Connection Pooling**: Optimized MongoDB connections
- **Query Optimization**: Efficient database queries with proper indexing
- **Memory Cache Fallback**: Automatic fallback when Redis is unavailable

## 🛠️ Tech Stack

- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM
- **Redis** - In-memory data structure store
- **Joi** - Validation library
- **Winston** - Logging library
- **BCrypt** - Password hashing

## 📦 Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd 07_cinepulse
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory with the following:
```
PORT=5000
NODE_ENV=development
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
REDIS_URL=redis://localhost:6379  # Optional, for caching
TMDB_API_KEY=your_tmdb_api_key
```

4. Start the development server:
```bash
npm run dev
```

## 🏗️ Architecture

### Directory Structure
```
backend/
├── config/           # Configuration files
├── controllers/      # Request handlers
├── middleware/       # Custom middleware
│   ├── rateLimiter.js
│   ├── requestLogger.js
│   ├── errorHandler.js
│   ├── apiVersioning.js
│   └── validation.js
├── models/           # Database models
├── routes/           # API routes
│   └── v1/           # Versioned routes
├── services/         # Business logic
│   ├── BaseService.js
│   ├── UserService.js
│   ├── AuthService.js
│   └── SearchService.js
├── utils/            # Utility functions
│   ├── cache.js
│   ├── logger.js
│   ├── errors.js
│   └── dbOptimization.js
└── server.js         # Entry point
```

### Service Layer Architecture
- **BaseService**: Common CRUD operations
- **UserService**: User-specific operations
- **AuthService**: Authentication logic
- **SearchService**: Search operations with caching

## 🌐 API Endpoints

### Authentication
- `POST /api/v1/auth/signup` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/logout` - User logout
- `GET /api/v1/auth/authCheck` - Verify authentication

### Movies
- `GET /api/v1/movie/trending` - Trending movies
- `GET /api/v1/movie/:id/details` - Movie details
- `GET /api/v1/movie/:id/trailers` - Movie trailers
- `GET /api/v1/movie/:id/similar` - Similar movies
- `GET /api/v1/movie/:category` - Category-based movies

### TV Shows
- `GET /api/v1/tv/trending` - Trending TV shows
- `GET /api/v1/tv/:id/details` - TV show details
- `GET /api/v1/tv/:id/trailers` - TV show trailers
- `GET /api/v1/tv/:id/similar` - Similar TV shows
- `GET /api/v1/tv/:category` - Category-based TV shows

### Search
- `GET /api/v1/search/person/:query` - Search for people
- `GET /api/v1/search/movie/:query` - Search for movies
- `GET /api/v1/search/tv/:query` - Search for TV shows
- `GET /api/v1/search/history` - Get search history
- `DELETE /api/v1/search/history/:id` - Remove from history

### Health Checks
- `GET /api/v1/health` - Application health
- `GET /api/v1/info` - System information
- `GET /api/v1/service/:service` - Service-specific health
- `GET /api/v1/live` - Liveness probe
- `GET /api/v1/ready` - Readiness probe

## 🔒 Security Features

- **Rate Limiting**: Prevents API abuse and DDoS attacks
- **Input Validation**: Joi-based validation for all inputs
- **XSS Protection**: Input sanitization
- **Secure Cookies**: HttpOnly, SameSite, and secure flags
- **Password Hashing**: BCrypt with salt rounds
- **JWT Validation**: Token verification and expiration

## 📊 Monitoring & Logging

- **Request Logging**: Every request is logged with unique ID
- **Response Logging**: Response status and duration
- **Error Logging**: Detailed error information
- **Health Monitoring**: System and service health checks
- **Performance Metrics**: Response times and throughput

## 🚀 Deployment

### Environment Variables for Production
```
NODE_ENV=production
MONGO_URI=your_production_mongodb_uri
JWT_SECRET=your_strong_jwt_secret
REDIS_URL=your_redis_instance_url  # Recommended for production
TMDB_API_KEY=your_tmdb_api_key
```

### Production Build
```bash
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For support, please open an issue in the repository.