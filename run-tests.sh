#!/bin/bash

# Phase 4 Testing - Automated Pre-Testing Checks
# This script performs automated checks before manual testing begins

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║         PHASE 4 TESTING - AUTOMATED PRE-TEST CHECKS          ║"
echo "║              Revive Root Essentials E-Commerce                ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counter
PASSED=0
FAILED=0
WARNINGS=0

# Helper function
check_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ PASS${NC}: $2"
        ((PASSED++))
    else
        echo -e "${RED}❌ FAIL${NC}: $2"
        ((FAILED++))
    fi
}

check_warning() {
    echo -e "${YELLOW}⚠️  WARNING${NC}: $1"
    ((WARNINGS++))
}

# ====================================================
# TEST 1: Dependency Installation
# ====================================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}TEST 1: Dependency Verification${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Check if node_modules exist
if [ -d "node_modules" ]; then
    check_result 0 "Frontend node_modules installed"
else
    check_result 1 "Frontend node_modules missing"
fi

if [ -d "backend/node_modules" ]; then
    check_result 0 "Backend node_modules installed"
else
    check_result 1 "Backend node_modules missing"
fi

echo ""

# ====================================================
# TEST 2: Critical Files Existence
# ====================================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}TEST 2: Critical Files Verification${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Frontend pages
PAGES=(
    "src/app/pages/Home.tsx"
    "src/app/pages/Shop.tsx"
    "src/app/pages/ProductDetails.tsx"
    "src/app/pages/Cart.tsx"
    "src/app/pages/Account.tsx"
    "src/app/pages/OrderHistory.tsx"
    "src/app/pages/RefundTracking.tsx"
    "src/app/pages/AddressManagement.tsx"
)

for page in "${PAGES[@]}"; do
    if [ -f "$page" ]; then
        check_result 0 "Page exists: $page"
    else
        check_result 1 "Page missing: $page"
    fi
done

# Admin pages
ADMIN_PAGES=(
    "src/app/pages/admin/AdminProducts.tsx"
    "src/app/pages/admin/AdminOrders.tsx"
    "src/app/pages/admin/AdminUsers.tsx"
    "src/app/pages/admin/AdminCoupons.tsx"
    "src/app/pages/admin/AdminInventory.tsx"
    "src/app/pages/admin/AdminAuditLogs.tsx"
)

for page in "${ADMIN_PAGES[@]}"; do
    if [ -f "$page" ]; then
        check_result 0 "Admin page exists: $(basename $page)"
    else
        check_result 1 "Admin page missing: $(basename $page)"
    fi
done

echo ""

# ====================================================
# TEST 3: Utility & Constant Files
# ====================================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}TEST 3: International Support Files${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if [ -f "src/app/constants/countries.ts" ]; then
    check_result 0 "Countries constant file exists"
    # Count countries
    COUNTRY_COUNT=$(grep -c "name:" src/app/constants/countries.ts)
    echo "   → Contains $COUNTRY_COUNT country definitions"
else
    check_result 1 "Countries constant file missing"
fi

if [ -f "src/app/utils/localeDetection.ts" ]; then
    check_result 0 "Locale detection utility exists"
else
    check_result 1 "Locale detection utility missing"
fi

if [ -f "src/app/constants/currencies.ts" ]; then
    check_result 0 "Currencies constant file exists"
else
    check_result 1 "Currencies constant file missing"
fi

echo ""

# ====================================================
# TEST 4: Route Configuration
# ====================================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}TEST 4: Route Configuration${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

ROUTES=(
    "RefundTracking"
    "AddressManagement"
    "AdminProducts"
    "AdminOrders"
    "AdminUsers"
    "AdminCoupons"
    "AdminInventory"
    "AdminAuditLogs"
)

for route in "${ROUTES[@]}"; do
    if grep -q "import.*$route" src/app/routes.tsx; then
        check_result 0 "Route import: $route"
    else
        check_result 1 "Route import missing: $route"
    fi
done

echo ""

# ====================================================
# TEST 5: TypeScript Configuration
# ====================================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}TEST 5: TypeScript Configuration${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if [ -f "tsconfig.json" ]; then
    check_result 0 "TypeScript config exists"
    
    if grep -q '"strict": true' tsconfig.json; then
        check_result 0 "Strict mode enabled"
    else
        check_warning "Strict mode not enabled"
    fi
else
    check_result 1 "TypeScript config missing"
fi

echo ""

# ====================================================
# TEST 6: Vite Configuration
# ====================================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}TEST 6: Vite Configuration${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if [ -f "vite.config.ts" ]; then
    check_result 0 "Vite config exists"
    
    if grep -q "port: 5173" vite.config.ts; then
        check_result 0 "Frontend port configured (5173)"
    else
        check_result 1 "Frontend port not configured"
    fi
else
    check_result 1 "Vite config missing"
fi

echo ""

# ====================================================
# TEST 7: Environment Variables
# ====================================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}TEST 7: Environment Variables${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if [ -f ".env" ] || [ -f ".env.local" ] || [ -f "backend/.env" ]; then
    check_result 0 "Environment file(s) exist"
else
    check_warning "No .env file found - may be needed for backend"
fi

echo ""

# ====================================================
# TEST 8: Package.json Scripts
# ====================================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}TEST 8: Available Scripts${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

SCRIPTS=(
    '"dev:frontend"'
    '"dev:backend"'
    '"build"'
)

for script in "${SCRIPTS[@]}"; do
    if grep -q "$script" package.json; then
        check_result 0 "Script available: $script"
    else
        check_result 1 "Script missing: $script"
    fi
done

echo ""

# ====================================================
# TEST 9: Backend Configuration
# ====================================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}TEST 9: Backend Configuration${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

BACKEND_FILES=(
    "backend/app.js"
    "backend/server.js"
    "backend/package.json"
    "backend/config/database.js"
    "backend/config/auth.js"
)

for file in "${BACKEND_FILES[@]}"; do
    if [ -f "$file" ]; then
        check_result 0 "Backend file exists: $(basename $file)"
    else
        check_result 1 "Backend file missing: $(basename $file)"
    fi
done

echo ""

# ====================================================
# TEST 10: Documentation Files
# ====================================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}TEST 10: Documentation Files${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

DOCS=(
    "README.md"
    "INTERNATIONAL_SETUP.md"
    "QA_TESTING_CHECKLIST.md"
    "PHASE_4_TESTING_REPORT.md"
    "MANUAL_TESTING_GUIDE.md"
)

for doc in "${DOCS[@]}"; do
    if [ -f "$doc" ]; then
        check_result 0 "Documentation: $doc"
    else
        check_result 1 "Documentation missing: $doc"
    fi
done

echo ""

# ====================================================
# SUMMARY
# ====================================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}TEST SUMMARY${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

TOTAL=$((PASSED + FAILED))
PASS_RATE=$((PASSED * 100 / TOTAL))

echo -e "${GREEN}✅ Passed:${NC}   $PASSED"
echo -e "${RED}❌ Failed:${NC}   $FAILED"
echo -e "${YELLOW}⚠️  Warnings:${NC} $WARNINGS"
echo ""
echo -e "Pass Rate: ${GREEN}$PASS_RATE%${NC}"

echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                 ALL PRE-TEST CHECKS PASSED! ✅                  ║${NC}"
    echo -e "${GREEN}║                   Ready to Start Manual Testing                  ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${BLUE}📋 NEXT STEPS:${NC}"
    echo ""
    echo "1. ${YELLOW}Start Frontend Server:${NC}"
    echo "   npm run dev:frontend"
    echo ""
    echo "2. ${YELLOW}Start Backend Server (new terminal):${NC}"
    echo "   npm run dev:backend"
    echo ""
    echo "3. ${YELLOW}Open Browser:${NC}"
    echo "   http://localhost:5173"
    echo ""
    echo "4. ${YELLOW}Follow Testing Guide:${NC}"
    echo "   Review: MANUAL_TESTING_GUIDE.md"
    echo ""
    echo "5. ${YELLOW}Track Results:${NC}"
    echo "   Document findings in: PHASE_4_TESTING_REPORT.md"
    echo ""
else
    echo -e "${RED}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║            SOME PRE-TEST CHECKS FAILED - REVIEW ABOVE          ║${NC}"
    echo -e "${RED}╚════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo "Please resolve the issues above before proceeding with testing."
fi

echo ""
