# ChefConnect Deployment Guide

Complete deployment guide for the ChefConnect platform with Django backend, React frontend, and production infrastructure.

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Load Balancer │    │      Nginx      │    │   Django App    │
│   (Cloudflare)  │───▶│  Reverse Proxy  │───▶│   (Backend)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │                       │
                                ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Static Files  │    │   PostgreSQL    │
│  (React/Next)   │    │   (Nginx)       │    │   Database      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                       │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Celery        │    │     Redis       │    │   Cloudinary    │
│   Workers       │───▶│   (Cache/Queue) │    │  (File Storage) │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Quick Deployment

### **Option 1: Docker Compose (Recommended)**

```bash
# Clone repository
git clone <repository-url>
cd foodie-v2

# Set up environment
cp .env.production .env
# Edit .env with your production values

# Deploy
./deploy.sh production

# Access your application
# Backend: http://localhost:8000
# Admin: http://localhost:8000/admin/
# API Docs: http://localhost:8000/swagger/
```

### **Option 2: Manual Deployment**

```bash
# 1. Set up Python environment
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# 2. Set up database
createdb chefconnect_db
python manage.py migrate

# 3. Collect static files
python manage.py collectstatic

# 4. Create superuser
python manage.py createsuperuser

# 5. Run with production server
daphne -b 0.0.0.0 -p 8000 chefconnect.asgi:application
```

## 🔧 Infrastructure Setup

### **1. Server Requirements**

**Minimum Requirements:**
- **CPU**: 2 cores
- **RAM**: 4GB
- **Storage**: 50GB SSD
- **OS**: Ubuntu 20.04+ or CentOS 8+

**Recommended for Production:**
- **CPU**: 4+ cores
- **RAM**: 8GB+
- **Storage**: 100GB+ SSD
- **Load Balancer**: Nginx or Cloudflare

### **2. Dependencies Installation**

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Nginx (if not using Docker)
sudo apt install nginx -y

# Install PostgreSQL (if not using Docker)
sudo apt install postgresql postgresql-contrib -y

# Install Redis (if not using Docker)
sudo apt install redis-server -y
```

### **3. SSL/TLS Setup**

```bash
# Using Let's Encrypt (Certbot)
sudo apt install certbot python3-certbot-nginx -y

# Generate certificates
sudo certbot --nginx -d chefconnect.com -d www.chefconnect.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 🌍 Environment Configuration

### **Production Environment Variables**

```bash
# Core Django Settings
SECRET_KEY=your-super-secure-secret-key
DEBUG=False
ALLOWED_HOSTS=chefconnect.com,www.chefconnect.com
CORS_ALLOWED_ORIGINS=https://chefconnect.com

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/chefconnect_db

# Redis
REDIS_URL=redis://localhost:6379/0

# File Storage (Cloudinary)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Payment Processing
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# M-Pesa (African Payments)
MPESA_ENVIRONMENT=production
MPESA_CONSUMER_KEY=your_consumer_key
MPESA_CONSUMER_SECRET=your_consumer_secret
MPESA_BUSINESS_SHORT_CODE=your_shortcode
MPESA_PASSKEY=your_passkey

# AI Integration
GEMINI_API_KEY=your_gemini_api_key

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_HOST_USER=noreply@chefconnect.com
EMAIL_HOST_PASSWORD=your_app_password

# Security
SECURE_SSL_REDIRECT=True
SECURE_HSTS_SECONDS=31536000
SESSION_COOKIE_SECURE=True
CSRF_COOKIE_SECURE=True
```

### **Development vs Production**

| Setting | Development | Production |
|---------|-------------|------------|
| DEBUG | True | False |
| Database | SQLite | PostgreSQL |
| Cache | Dummy | Redis |
| File Storage | Local | Cloudinary |
| Email | Console | SMTP |
| SSL | False | True |
| Logging | Console | File + Sentry |

## 🗄️ Database Setup

### **PostgreSQL Configuration**

```sql
-- Create database and user
CREATE DATABASE chefconnect_db;
CREATE USER chefconnect_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE chefconnect_db TO chefconnect_user;
ALTER USER chefconnect_user CREATEDB;
```

### **Database Migrations**

```bash
# Run migrations
python manage.py migrate

# Create initial data
python manage.py loaddata fixtures/initial_data.json

# Create superuser
python manage.py createsuperuser
```

### **Database Backup & Restore**

```bash
# Backup
pg_dump -U chefconnect_user -h localhost chefconnect_db > backup.sql

# Restore
psql -U chefconnect_user -h localhost chefconnect_db < backup.sql

# Automated backup script
#!/bin/bash
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump -U chefconnect_user chefconnect_db > "$BACKUP_DIR/backup_$DATE.sql"
find $BACKUP_DIR -name "backup_*.sql" -mtime +7 -delete
```

## 🔄 CI/CD Pipeline

### **GitHub Actions Workflow**

```yaml
# .github/workflows/deploy.yml
name: Deploy ChefConnect

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.12'
      - name: Install dependencies
        run: |
          pip install -r requirements.txt
      - name: Run tests
        run: |
          python manage.py test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to server
        uses: appleboy/ssh-action@v0.1.5
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd /var/www/chefconnect
            git pull origin main
            ./deploy.sh production
```

### **Deployment Checklist**

- [ ] **Code Quality**
  - [ ] All tests passing
  - [ ] Code review completed
  - [ ] Security scan passed
  - [ ] Performance benchmarks met

- [ ] **Infrastructure**
  - [ ] Server provisioned and configured
  - [ ] SSL certificates installed
  - [ ] Firewall rules configured
  - [ ] Monitoring set up

- [ ] **Configuration**
  - [ ] Environment variables set
  - [ ] Database configured
  - [ ] Redis configured
  - [ ] File storage configured

- [ ] **Security**
  - [ ] Secret keys rotated
  - [ ] API keys configured
  - [ ] Access controls verified
  - [ ] Security headers enabled

- [ ] **Monitoring**
  - [ ] Health checks configured
  - [ ] Logging set up
  - [ ] Error tracking enabled
  - [ ] Performance monitoring active

## 📊 Monitoring & Logging

### **Health Checks**

```python
# health_check.py
import requests
import sys

def check_api():
    try:
        response = requests.get('http://localhost:8000/api/')
        return response.status_code == 200
    except:
        return False

def check_database():
    # Database connectivity check
    pass

def check_redis():
    # Redis connectivity check
    pass

if __name__ == '__main__':
    checks = [check_api(), check_database(), check_redis()]
    if all(checks):
        print("All systems healthy")
        sys.exit(0)
    else:
        print("System health check failed")
        sys.exit(1)
```

### **Logging Configuration**

```python
# settings.py
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': '/var/log/chefconnect/django.log',
            'formatter': 'verbose',
        },
        'console': {
            'level': 'DEBUG',
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
    },
    'root': {
        'handlers': ['file', 'console'],
        'level': 'INFO',
    },
}
```

## 🔒 Security Considerations

### **Security Checklist**

- [ ] **Authentication & Authorization**
  - [ ] Strong password policies
  - [ ] JWT token expiration
  - [ ] Role-based access control
  - [ ] API rate limiting

- [ ] **Data Protection**
  - [ ] HTTPS everywhere
  - [ ] Database encryption
  - [ ] Secure file uploads
  - [ ] PII data handling

- [ ] **Infrastructure Security**
  - [ ] Firewall configuration
  - [ ] SSH key authentication
  - [ ] Regular security updates
  - [ ] Intrusion detection

- [ ] **Application Security**
  - [ ] Input validation
  - [ ] SQL injection prevention
  - [ ] XSS protection
  - [ ] CSRF protection

### **Security Headers**

```nginx
# nginx.conf security headers
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
add_header Content-Security-Policy "default-src 'self'" always;
add_header Strict-Transport-Security "max-age=31536000" always;
```

## 🚨 Troubleshooting

### **Common Issues**

**1. Database Connection Issues**
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Check connection
psql -U chefconnect_user -h localhost -d chefconnect_db

# Reset password
sudo -u postgres psql
\password chefconnect_user
```

**2. Redis Connection Issues**
```bash
# Check Redis status
sudo systemctl status redis

# Test connection
redis-cli ping

# Check logs
sudo journalctl -u redis
```

**3. WebSocket Issues**
```bash
# Check if Daphne is running
ps aux | grep daphne

# Test WebSocket connection
wscat -c ws://localhost:8000/ws/chat/1/
```

**4. Static Files Not Loading**
```bash
# Collect static files
python manage.py collectstatic --noinput

# Check Nginx configuration
sudo nginx -t
sudo systemctl reload nginx
```

### **Performance Optimization**

**Database Optimization:**
```sql
-- Add indexes for frequently queried fields
CREATE INDEX idx_bookings_event_date ON bookings_booking(event_date);
CREATE INDEX idx_messages_created_at ON chat_message(created_at);

-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM bookings_booking WHERE event_date > NOW();
```

**Caching Strategy:**
```python
# Redis caching
from django.core.cache import cache

# Cache chef profiles
cache.set(f'chef_profile_{chef_id}', chef_data, 3600)

# Cache API responses
@cache_page(60 * 15)  # 15 minutes
def chef_list_view(request):
    pass
```

## 📈 Scaling Considerations

### **Horizontal Scaling**

```yaml
# docker-compose.scale.yml
version: '3.8'
services:
  backend:
    deploy:
      replicas: 3
  
  celery:
    deploy:
      replicas: 2
```

### **Load Balancing**

```nginx
# nginx load balancer
upstream backend {
    server backend1:8000;
    server backend2:8000;
    server backend3:8000;
}
```

### **Database Scaling**

- **Read Replicas**: For read-heavy workloads
- **Connection Pooling**: Using pgbouncer
- **Partitioning**: For large tables
- **Caching**: Redis for frequently accessed data

---

**ChefConnect Deployment** - Bringing culinary excellence to the world! 🍳✨
