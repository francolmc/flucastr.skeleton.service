#!/bin/bash

# Flucastr Lleva - Service Skeleton Setup Script
# This script helps initialize a new microservice from the skeleton template

set -e

echo "🚀 Flucastr Lleva - Service Skeleton Setup"
echo "=========================================="

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -f "prisma/schema.prisma" ]; then
    echo "❌ Error: This script must be run from the skeleton root directory"
    exit 1
fi

# Get service name from user
read -p "Enter the new service name (e.g., notification, payment, user): " service_name

if [ -z "$service_name" ]; then
    echo "❌ Error: Service name cannot be empty"
    exit 1
fi

# Validate service name (lowercase, no spaces, no special chars)
if ! echo "$service_name" | grep -qE '^[a-z][a-z0-9_-]*$'; then
    echo "❌ Error: Service name must be lowercase, start with a letter, and contain only letters, numbers, hyphens, and underscores"
    exit 1
fi

echo "📦 Setting up service: $service_name"

# Update package.json
sed -i "s/flucastr.lleva.service.skeleton/flucastr.lleva.$service_name.service/g" package.json
sed -i "s/Microservicio skeleton para la plataforma Lleva - Template base para nuevos microservicios/Microservicio de $service_name para la plataforma Flucastr Lleva/g" package.json

# Update Dockerfile
sed -i "s/flucastr.lleva.service.skeleton/flucastr.lleva.$service_name.service/g" Dockerfile

# Update main.ts
sed -i "s/Flucastr Lleva - Service API/Flucastr Lleva - $service_name Service API/g" src/main.ts
sed -i "s/API del microservicio para la plataforma Flucastr Lleva/API del microservicio de $service_name para la plataforma Flucastr Lleva/g" src/main.ts
sed -i "s/Flucastr Lleva - Service/Flucastr Lleva - $service_name Service/g" src/main.ts

# Update health controller
sed -i "s/Flucastr Lleva - Service/Flucastr Lleva - $service_name Service/g" src/modules/health/health.controller.ts

# Update README
sed -i "s/Service Skeleton/$service_name Service/g" README.md

# Update docs
sed -i "s/Service Documentation/$service_name Service Documentation/g" docs/PROJECT_COD.md

echo "✅ Service setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Update DATABASE_URL in .env file"
echo "2. Define your database schema in prisma/schema.prisma"
echo "3. Run: pnpm install"
echo "4. Run: pnpm prisma:generate"
echo "5. Run: pnpm prisma:migrate:dev"
echo "6. Start developing your service!"
echo ""
echo "🎉 Happy coding!"