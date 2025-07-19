#!/bin/bash

echo "🤖 AI Avatar Chat - Setup Script"
echo "================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    echo "Visit: https://nodejs.org/"
    exit 1
fi

# Check Node.js version
node_version=$(node -v | cut -c2-)
required_version="18.0.0"

if [ "$(printf '%s\n' "$required_version" "$node_version" | sort -V | head -n1)" != "$required_version" ]; then
    echo "❌ Node.js version $node_version found, but version 18+ is required."
    exit 1
fi

echo "✅ Node.js version $node_version detected"
echo ""

echo "📦 Installing dependencies..."
echo ""

# Install backend dependencies
echo "🔧 Installing backend dependencies..."
cd backend
if npm install; then
    echo "✅ Backend dependencies installed successfully"
else
    echo "❌ Failed to install backend dependencies"
    exit 1
fi
cd ..

echo ""

# Install frontend dependencies
echo "🎨 Installing frontend dependencies..."
cd frontend
if npm install; then
    echo "✅ Frontend dependencies installed successfully"
else
    echo "❌ Failed to install frontend dependencies"
    exit 1
fi
cd ..

echo ""
echo "🎉 Installation completed successfully!"
echo ""

# Create example environment file
echo "⚙️  Setting up environment configuration..."
cat > backend/.env.example << 'EOF'
# Google Cloud API Configuration
GOOGLE_API_KEY=your_gemini_api_key_here

# For local development with Application Default Credentials
# Run: gcloud auth application-default login
# DO NOT set GOOGLE_APPLICATION_CREDENTIALS when using keyless auth

# Server Configuration
PORT=3001
FRONTEND_URL=http://localhost:3000

# Optional: Node Environment
NODE_ENV=development
EOF

echo "✅ Created backend/.env.example"
echo ""

echo "🚀 Setup Complete!"
echo ""
echo "⚠️  IMPORTANT: Google Cloud Authentication Setup"
echo ""
echo "If you got an error about service account key creation being disabled,"
echo "your organization uses secure keyless authentication (recommended!)."
echo ""
echo "📖 Choose your authentication method:"
echo ""
echo "🔐 SECURE METHOD (No JSON Keys - Recommended):"
echo "   Follow: docs/google-cloud-setup-no-keys.md"
echo ""
echo "🔑 TRADITIONAL METHOD (JSON Keys - If allowed):"
echo "   Follow: docs/google-cloud-setup.md"
echo ""
echo "Next steps:"
echo "1. Follow the appropriate Google Cloud setup guide above"
echo "2. Get your Gemini API key from Google AI Studio"
echo "3. For local development:"
echo "   • Copy backend/.env.example to backend/.env"
echo "   • Add your Gemini API key"
echo "   • Run: gcloud auth application-default login"
echo ""
echo "4. Start the application:"
echo "   Terminal 1: cd backend && npm run dev"
echo "   Terminal 2: cd frontend && npm start"
echo ""
echo "5. Open http://localhost:3000 in your browser"
echo ""
echo "📖 For detailed setup instructions, see README.md"
echo ""
echo "Happy chatting with your AI avatar! 🤖✨" 