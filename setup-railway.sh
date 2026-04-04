#!/bin/bash
# ============================================================
# NCTIRS — Railway Deployment Setup Script
# Run this from your project root: bash setup-railway.sh
# ============================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color
BOLD='\033[1m'

print_step() { echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"; echo -e "${GREEN}${BOLD}  STEP $1: $2${NC}"; echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"; }
print_info() { echo -e "${CYAN}  ℹ  $1${NC}"; }
print_success() { echo -e "${GREEN}  ✓  $1${NC}"; }
print_warning() { echo -e "${YELLOW}  ⚠  $1${NC}"; }
print_error() { echo -e "${RED}  ✗  $1${NC}"; }

echo -e "${GREEN}${BOLD}"
echo "  ┌─────────────────────────────────────────────┐"
echo "  │      NCTIRS — Railway Deployment Setup       │"
echo "  │   National Cyber Threat Intelligence System   │"
echo "  └─────────────────────────────────────────────┘"
echo -e "${NC}"

# ─── STEP 1: Check Prerequisites ───────────────────────────
print_step "1" "Checking Prerequisites"

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    print_success "Node.js installed: $NODE_VERSION"
    
    # Check minimum version (v20+)
    MAJOR=$(echo "$NODE_VERSION" | sed 's/v//' | cut -d. -f1)
    if [ "$MAJOR" -lt 20 ]; then
        print_error "Node.js v20+ required. You have $NODE_VERSION"
        print_info "Install via: curl -fsSL https://fnm.vercel.app/install | bash && fnm use 20"
        exit 1
    fi
else
    print_error "Node.js not found!"
    print_info "Install via: curl -fsSL https://fnm.vercel.app/install | bash && fnm install 20"
    exit 1
fi

# Check npm
if command -v npm &> /dev/null; then
    print_success "npm installed: $(npm -v)"
else
    print_error "npm not found!"
    exit 1
fi

# Check git
if command -v git &> /dev/null; then
    print_success "Git installed: $(git --version | cut -d' ' -f3)"
else
    print_error "Git not found!"
    exit 1
fi

# ─── STEP 2: Install Turso CLI ─────────────────────────────
print_step "2" "Setting Up Turso Database"

if command -v turso &> /dev/null; then
    print_success "Turso CLI already installed"
else
    print_info "Installing Turso CLI..."
    curl -sSfL https://get.tur.so/install.sh | bash
    export PATH="$HOME/.turso:$PATH"
    
    if command -v turso &> /dev/null; then
        print_success "Turso CLI installed successfully"
    else
        print_error "Turso CLI installation failed"
        print_info "Try manually: curl -sSfL https://get.tur.so/install.sh | bash"
        print_info "Then add to PATH: export PATH=\"\$HOME/.turso:\$PATH\""
        exit 1
    fi
fi

# Check if already logged in
if turso auth status &> /dev/null 2>&1; then
    print_success "Already authenticated with Turso"
else
    print_info "Opening Turso login (browser will open)..."
    turso auth login
    print_success "Turso authentication complete"
fi

# Create database
print_info "Creating production database..."
DB_NAME="nctirs-prod"

if turso db show "$DB_NAME" &> /dev/null 2>&1; then
    print_warning "Database '$DB_NAME' already exists — using existing one"
else
    turso db create "$DB_NAME"
    print_success "Database '$DB_NAME' created"
fi

# Get credentials
DB_URL=$(turso db show "$DB_NAME" --url 2>/dev/null)
DB_TOKEN=$(turso db tokens create "$DB_NAME" 2>/dev/null)

print_success "Database URL: $DB_URL"
print_success "Auth token generated (saved for later)"

# ─── STEP 3: Push Schema to Turso ──────────────────────────
print_step "3" "Pushing Prisma Schema to Production Database"

print_info "Installing project dependencies..."
npm ci

print_info "Generating Prisma client..."
npx prisma generate

print_info "Pushing schema to Turso..."
DATABASE_URL="$DB_URL" TURSO_AUTH_TOKEN="$DB_TOKEN" npx prisma db push --accept-data-loss

print_success "Schema pushed to production database"

# ─── STEP 4: Seed the Database ─────────────────────────────
print_step "4" "Seeding Production Database"

echo -e "${YELLOW}  Do you want to seed the database with demo data? (y/n)${NC}"
read -r SEED_ANSWER

if [ "$SEED_ANSWER" = "y" ] || [ "$SEED_ANSWER" = "Y" ]; then
    print_info "Seeding database..."
    DATABASE_URL="$DB_URL" TURSO_AUTH_TOKEN="$DB_TOKEN" npx tsx scripts/seed.ts
    print_success "Database seeded with demo data"
else
    print_info "Skipping database seeding"
fi

# ─── STEP 5: Install Railway CLI ───────────────────────────
print_step "5" "Setting Up Railway CLI"

if command -v railway &> /dev/null; then
    print_success "Railway CLI already installed"
else
    print_info "Installing Railway CLI..."
    npm install -g @railway/cli
    
    if command -v railway &> /dev/null; then
        print_success "Railway CLI installed"
    else
        print_error "Railway CLI installation failed"
        print_info "Try: npm install -g @railway/cli"
        print_info "Or use the Railway dashboard instead (see DEPLOY_RAILWAY.md)"
        exit 1
    fi
fi

# Login to Railway
print_info "Logging into Railway (browser will open)..."
railway login
print_success "Railway authentication complete"

# ─── STEP 6: Create Railway Project ────────────────────────
print_step "6" "Creating Railway Project & Setting Variables"

print_info "Initializing new Railway project..."
railway init

print_info "Setting environment variables..."
railway variables set NODE_ENV=production
railway variables set PORT=3000
railway variables set DATABASE_URL="$DB_URL"
railway variables set TURSO_AUTH_TOKEN="$DB_TOKEN"

echo ""
echo -e "${YELLOW}  Do you have an Ably API key for real-time features? (y/n)${NC}"
read -r ABLY_ANSWER

if [ "$ABLY_ANSWER" = "y" ] || [ "$ABLY_ANSWER" = "Y" ]; then
    echo -e "${CYAN}  Enter your Ably API key:${NC}"
    read -r ABLY_KEY
    railway variables set NEXT_PUBLIC_ABLY_API_KEY="$ABLY_KEY"
    print_success "Ably API key set"
else
    print_info "Skipping Ably — real-time features will use polling fallback"
fi

# ─── STEP 7: Deploy ────────────────────────────────────────
print_step "7" "Deploying to Railway"

print_info "Pushing to Railway..."
railway up --detach

print_success "Deployment initiated!"

# ─── STEP 8: Generate Domain ───────────────────────────────
print_step "8" "Generating Public Domain"

print_info "Generating public URL..."
railway domain

# Get the domain and set it as an env var
echo ""
echo -e "${YELLOW}  Enter the domain Railway generated (e.g., nctirs-production.up.railway.app):${NC}"
read -r RAILWAY_DOMAIN

if [ -n "$RAILWAY_DOMAIN" ]; then
    railway variables set NEXT_PUBLIC_APP_URL="https://$RAILWAY_DOMAIN"
    railway variables set NEXT_PUBLIC_SOCKET_URL="https://$RAILWAY_DOMAIN"
    print_success "App URL set to https://$RAILWAY_DOMAIN"
    
    # Trigger redeploy with new vars
    print_info "Redeploying with updated URL..."
    railway up --detach
fi

# ─── DONE ───────────────────────────────────────────────────
echo ""
echo -e "${GREEN}${BOLD}"
echo "  ┌─────────────────────────────────────────────┐"
echo "  │          DEPLOYMENT COMPLETE!                │"
echo "  └─────────────────────────────────────────────┘"
echo -e "${NC}"
echo -e "${CYAN}  Your NCTIRS instance is deploying to Railway.${NC}"
echo ""
echo -e "${BOLD}  Quick Reference:${NC}"
echo -e "  ${CYAN}App URL:${NC}      https://$RAILWAY_DOMAIN"
echo -e "  ${CYAN}Dashboard:${NC}    https://railway.com/dashboard"
echo -e "  ${CYAN}View logs:${NC}    railway logs"
echo -e "  ${CYAN}Open app:${NC}     railway open"
echo -e "  ${CYAN}Redeploy:${NC}     railway up --detach"
echo ""
echo -e "${BOLD}  Database Credentials (save these!):${NC}"
echo -e "  ${CYAN}DB URL:${NC}       $DB_URL"
echo -e "  ${CYAN}DB Token:${NC}     $DB_TOKEN"
echo ""
echo -e "${YELLOW}  ⚠  Save your DB token somewhere secure — you won't see it again!${NC}"
echo ""
