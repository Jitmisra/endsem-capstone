#!/bin/bash

echo "🚀 Setting up EduStore Backend..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "⚠️  Please update .env with your database URL and JWT secret"
else
    echo "✅ .env file already exists"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Generate Prisma Client
echo "🔧 Generating Prisma Client..."
npm run prisma:generate

# Run migrations
echo "🗄️  Running database migrations..."
echo "⚠️  Make sure your DATABASE_URL is set in .env before running migrations"
read -p "Do you want to run migrations now? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    npm run prisma:migrate
else
    echo "⏭️  Skipping migrations. Run 'npm run prisma:migrate' when ready."
fi

echo "✅ Setup complete!"
echo "📚 Next steps:"
echo "   1. Update .env with your database URL"
echo "   2. Run 'npm run prisma:migrate' to set up the database"
echo "   3. Run 'npm run dev' to start the development server"
