#!/bin/bash

# ChefConnect Deployment Script
# This script handles the deployment of ChefConnect to production

set -e  # Exit on any error

echo "🚀 Starting ChefConnect Deployment"
echo "=================================="

# Configuration
ENVIRONMENT=${1:-production}
BACKUP_DB=${2:-true}

echo "📋 Deployment Configuration:"
echo "   Environment: $ENVIRONMENT"
echo "   Backup Database: $BACKUP_DB"
echo ""

# Pre-deployment checks
echo "🔍 Running pre-deployment checks..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if environment file exists
if [ ! -f ".env.$ENVIRONMENT" ]; then
    echo "❌ Environment file .env.$ENVIRONMENT not found!"
    exit 1
fi

echo "✅ Pre-deployment checks passed"

# Backup database (if requested)
if [ "$BACKUP_DB" = "true" ]; then
    echo "💾 Creating database backup..."
    BACKUP_FILE="backup_$(date +%Y%m%d_%H%M%S).sql"
    docker-compose exec -T db pg_dump -U chefconnect_user chefconnect_db > "backups/$BACKUP_FILE"
    echo "✅ Database backup created: $BACKUP_FILE"
fi

# Pull latest code (if in git repository)
if [ -d ".git" ]; then
    echo "📥 Pulling latest code..."
    git pull origin main
    echo "✅ Code updated"
fi

# Copy environment file
echo "⚙️  Setting up environment..."
cp ".env.$ENVIRONMENT" .env
echo "✅ Environment configured"

# Build and deploy
echo "🏗️  Building and deploying containers..."

# Stop existing containers
docker-compose down

# Build new images
docker-compose build --no-cache

# Start services
docker-compose up -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be ready..."
sleep 30

# Run database migrations
echo "🗄️  Running database migrations..."
docker-compose exec backend python manage.py migrate

# Collect static files
echo "📦 Collecting static files..."
docker-compose exec backend python manage.py collectstatic --noinput

# Create superuser (if needed)
echo "👤 Checking for superuser..."
docker-compose exec backend python manage.py shell -c "
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(is_superuser=True).exists():
    User.objects.create_superuser('admin@chefconnect.com', 'admin', 'changeme123')
    print('Superuser created: admin@chefconnect.com / changeme123')
else:
    print('Superuser already exists')
"

# Health checks
echo "🏥 Running health checks..."

# Check backend health
if curl -f http://localhost:8000/api/ > /dev/null 2>&1; then
    echo "✅ Backend is healthy"
else
    echo "❌ Backend health check failed"
    exit 1
fi

# Check database connection
if docker-compose exec backend python manage.py check --database default > /dev/null 2>&1; then
    echo "✅ Database connection is healthy"
else
    echo "❌ Database health check failed"
    exit 1
fi

# Check Redis connection
if docker-compose exec redis redis-cli ping > /dev/null 2>&1; then
    echo "✅ Redis is healthy"
else
    echo "❌ Redis health check failed"
    exit 1
fi

# Run tests (optional)
echo "🧪 Running critical tests..."
docker-compose exec backend python manage.py test tests.test_authentication --verbosity=0

# Display deployment summary
echo ""
echo "🎉 Deployment Complete!"
echo "======================"
echo "📊 Deployment Summary:"
echo "   Environment: $ENVIRONMENT"
echo "   Timestamp: $(date)"
echo "   Backend URL: http://localhost:8000"
echo "   Admin Panel: http://localhost:8000/admin/"
echo "   API Documentation: http://localhost:8000/swagger/"
echo ""
echo "🔗 Service Status:"
docker-compose ps

echo ""
echo "📝 Next Steps:"
echo "   1. Update DNS records to point to this server"
echo "   2. Configure SSL certificates"
echo "   3. Set up monitoring and logging"
echo "   4. Configure backup schedules"
echo "   5. Update environment variables with production values"
echo ""
echo "⚠️  Important Security Notes:"
echo "   - Change default superuser password immediately"
echo "   - Review and update all API keys and secrets"
echo "   - Enable proper firewall rules"
echo "   - Set up SSL/TLS certificates"

# Optional: Send deployment notification
if [ -n "$SLACK_WEBHOOK_URL" ]; then
    curl -X POST -H 'Content-type: application/json' \
        --data "{\"text\":\"🚀 ChefConnect deployed successfully to $ENVIRONMENT at $(date)\"}" \
        $SLACK_WEBHOOK_URL
fi

echo ""
echo "✨ ChefConnect is now live and ready to connect food lovers with amazing chefs!"
