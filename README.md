# ChefConnect - Foodie V2 Backend

A Django REST API backend for ChefConnect, the "Uber for Chefs" platform that connects clients with freelance chefs for personal meals, events, and home dining experiences.

## 🚀 Features

### Core Features (MVP)
- **User Management**: Role-based authentication (Client, Chef, Admin)
- **Chef Discovery**: Filter by cuisine, location, price, and ratings
- **Booking System**: 3-tap flow (Date → Chef/Menu → Payment)
- **Real-time Chat**: Client-Chef messaging for event planning
- **Secure Payments**: Stripe integration with automated payouts
- **AI Assistant**: Gemini-powered recommendations for chefs and menus

### Advanced Features
- **AI-Powered Recommendations**: Personalized chef and menu suggestions
- **Review System**: Comprehensive rating system for chefs
- **Menu Management**: Chefs can create and manage their menu items
- **Analytics Dashboard**: Performance metrics for chefs and admins
- **Multi-language Support**: Ready for English + Swahili

## 🛠 Tech Stack

- **Backend**: Django 5.0.7 + Django REST Framework
- **Database**: SQLite (development) / PostgreSQL (production)
- **Authentication**: Token-based authentication
- **AI Integration**: Google Gemini API
- **Payment Processing**: Stripe
- **Real-time Features**: Django Channels + Redis
- **API Documentation**: Swagger/OpenAPI
- **File Storage**: Local (development) / Cloudinary (production)

## 📁 Project Structure

```
chefconnect/
├── users/          # User management and authentication
├── chefs/          # Chef profiles, reviews, certifications
├── bookings/       # Booking system and menu items
├── chat/           # Real-time messaging
├── payments/       # Payment processing and payouts
├── ai/             # AI recommendations and chat
├── chefconnect/    # Main project settings
├── media/          # Uploaded files
├── static/         # Static files
└── logs/           # Application logs
```

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- pip
- Virtual environment

### Installation

1. **Clone and setup**
   ```bash
   cd foodie-v2
   source venv/bin/activate
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Environment Configuration**
   Copy `.env` and update with your settings:
   ```bash
   SECRET_KEY=your_secret_key
   DEBUG=True
   GEMINI_API_KEY=your_gemini_api_key
   STRIPE_SECRET_KEY=your_stripe_secret_key
   CLOUDINARY_API_KEY=your_cloudinary_key
   ```

4. **Database Setup**
   ```bash
   python manage.py migrate
   python manage.py createsuperuser
   ```

5. **Run Development Server**
   ```bash
   python manage.py runserver
   ```

## 📚 API Documentation

Once the server is running, access the API documentation at:
- **Swagger UI**: http://localhost:8000/swagger/
- **ReDoc**: http://localhost:8000/redoc/
- **Admin Panel**: http://localhost:8000/admin/

## 🔗 API Endpoints

### Authentication
- `POST /api/users/register/` - User registration
- `POST /api/users/login/` - User login
- `POST /api/users/logout/` - User logout
- `GET /api/users/profile/` - Get user profile
- `GET /api/users/dashboard/` - User dashboard

### Chef Management
- `GET /api/chefs/` - List all chefs
- `GET /api/chefs/search/` - Search chefs with filters
- `GET /api/chefs/<id>/` - Chef details
- `POST /api/chefs/profile/` - Create/update chef profile
- `GET /api/chefs/<id>/reviews/` - Chef reviews

### Booking System
- `GET /api/bookings/` - List user bookings
- `POST /api/bookings/create/` - Create new booking
- `GET /api/bookings/<id>/` - Booking details
- `PATCH /api/bookings/<id>/status/` - Update booking status
- `GET /api/bookings/menu-items/` - Available menu items

### Chat System
- `GET /api/chat/rooms/` - List chat rooms
- `POST /api/chat/rooms/create/` - Create chat room
- `GET /api/chat/rooms/<id>/messages/` - Get messages
- `POST /api/chat/messages/create/` - Send message

### Payments
- `POST /api/payments/create-intent/` - Create payment intent
- `POST /api/payments/confirm/` - Confirm payment
- `GET /api/payments/` - List payments
- `POST /api/payments/refunds/create/` - Request refund

### AI Features
- `POST /api/ai/recommendations/chefs/` - Get chef recommendations
- `POST /api/ai/recommendations/menus/` - Get menu recommendations
- `POST /api/ai/chat/sessions/create/` - Start AI chat session
- `POST /api/ai/chat/messages/create/` - Send message to AI

## 🔧 Configuration

### Environment Variables
```bash
# Django Settings
SECRET_KEY=your_django_secret_key
DEBUG=True/False
ALLOWED_HOSTS=localhost,127.0.0.1,yourdomain.com

# Database (PostgreSQL for production)
DATABASE_URL=postgresql://username:password@localhost:5432/chefconnect_db

# External Services
GEMINI_API_KEY=your_gemini_api_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key
STRIPE_SECRET_KEY=sk_test_your_stripe_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Redis (for Channels and Celery)
REDIS_URL=redis://localhost:6379/0

# CORS (for frontend integration)
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

### Database Models

#### Core Models
- **User**: Custom user model with role-based access
- **ChefProfile**: Extended chef information and ratings
- **ClientProfile**: Client preferences and history
- **Booking**: Main booking entity with status tracking
- **MenuItem**: Chef's menu items with dietary information
- **Payment**: Payment transactions and processing
- **ChatRoom/Message**: Real-time messaging system

#### AI Models
- **AIRecommendation**: AI-generated recommendations
- **ChatSession**: AI chat conversations
- **UserPreferenceLearning**: ML-based preference learning

## 🧪 Testing

Run tests with:
```bash
python manage.py test
```

## 🚀 Deployment

### Production Setup
1. Set `DEBUG=False` in environment
2. Configure PostgreSQL database
3. Set up Redis for Channels/Celery
4. Configure Cloudinary for file storage
5. Set up proper CORS origins
6. Use gunicorn for WSGI server

### Docker Deployment (Optional)
```dockerfile
# Dockerfile example
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["gunicorn", "chefconnect.wsgi:application"]
```

## 🔐 Security Features

- Token-based authentication
- CORS protection
- Input validation and sanitization
- Secure payment processing
- Rate limiting (to be implemented)
- Data encryption for sensitive information

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact: contact@chefconnect.com

## 🚧 Roadmap

### Phase 1 (Current)
- ✅ Core API endpoints
- ✅ Authentication system
- ✅ Basic AI integration
- 🔄 Frontend integration

### Phase 2 (Next)
- [ ] Real-time chat with WebSockets
- [ ] Advanced AI features
- [ ] Mobile app API optimization
- [ ] Performance optimization

### Phase 3 (Future)
- [ ] Multi-language support
- [ ] Advanced analytics
- [ ] Chef community features
- [ ] Loyalty program API
