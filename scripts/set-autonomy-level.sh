#!/bin/bash

# 🧠 AUTONOMY LEVEL CONTROLLER
# Quickly change AI assistant autonomy level

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Configuration
ACTIVE_CONTEXT_FILE="docs/memory-bank/activeContext.md"
AUTONOMY_LEVELS_FILE="docs/memory-bank/autonomy-levels.md"

# Function to show current level
show_current_level() {
    echo -e "${BLUE}🎛️ Current Autonomy Level:${NC}"
    if grep -q "Current Level:" "$ACTIVE_CONTEXT_FILE"; then
        current_level=$(grep "Current Level:" "$ACTIVE_CONTEXT_FILE" | sed 's/.*Current Level: \([0-9]\).*/\1/')
        echo -e "${GREEN}Level $current_level${NC}"
    else
        echo -e "${YELLOW}Level 3 (Default)${NC}"
    fi
}

# Function to show level descriptions
show_level_info() {
    echo -e "${PURPLE}📊 Autonomy Level Descriptions:${NC}"
    echo -e "${YELLOW}Level 1:${NC} Manual Mode - AI suggests only"
    echo -e "${YELLOW}Level 2:${NC} Guided Mode - Simple tasks with confirmation"
    echo -e "${YELLOW}Level 3:${NC} Semi-Autonomous - Most tasks independently"
    echo -e "${YELLOW}Level 4:${NC} Highly Autonomous - Complex tasks independently"
    echo -e "${YELLOW}Level 5:${NC} Fully Autonomous - Everything independently"
    echo ""
}

# Function to set level
set_level() {
    local level=$1
    local reason=${2:-"Manual change"}
    
    if [[ ! "$level" =~ ^[1-5]$ ]]; then
        echo -e "${RED}❌ Error: Level must be 1-5${NC}"
        exit 1
    fi
    
    echo -e "${BLUE}🔄 Setting autonomy level to $level...${NC}"
    
    # Update activeContext.md
    if grep -q "Current Level:" "$ACTIVE_CONTEXT_FILE"; then
        # Replace existing level
        sed -i.bak "s/Current Level: [0-9]/Current Level: $level/" "$ACTIVE_CONTEXT_FILE"
        sed -i.bak "s/Last Updated: [0-9-]*/Last Updated: $(date +%Y-%m-%d)/" "$ACTIVE_CONTEXT_FILE"
    else
        # Add level section if it doesn't exist
        sed -i.bak "/Status:/a\\
\\
## 🎛️ **AUTONOMY LEVEL**\\
\\
**Current Level:** $level (Semi-Autonomous)  \\
**Range:** 1-5 (Manual → Fully Autonomous)  \\
**Last Updated:** $(date +%Y-%m-%d)  " "$ACTIVE_CONTEXT_FILE"
    fi
    
    # Update autonomy-levels.md
    sed -i.bak "s/Active Level: [0-9]/Active Level: $level/" "$AUTONOMY_LEVELS_FILE"
    sed -i.bak "s/Last Changed: [0-9-]*/Last Changed: $(date +%Y-%m-%d)/" "$AUTONOMY_LEVELS_FILE"
    
    # Clean up backup files
    rm -f "$ACTIVE_CONTEXT_FILE.bak" "$AUTONOMY_LEVELS_FILE.bak"
    
    echo -e "${GREEN}✅ Autonomy level set to $level${NC}"
    echo -e "${BLUE}📝 Reason: $reason${NC}"
    echo -e "${YELLOW}💡 AI assistant will now operate at Level $level autonomy${NC}"
}

# Function to show help
show_help() {
    echo -e "${BLUE}🧠 Autonomy Level Controller${NC}"
    echo ""
    echo -e "${YELLOW}Usage:${NC}"
    echo "  $0 [level] [reason]"
    echo "  $0 show"
    echo "  $0 info"
    echo "  $0 help"
    echo ""
    echo -e "${YELLOW}Examples:${NC}"
    echo "  $0 1 \"Critical production task\""
    echo "  $0 4 \"Simple bug fix\""
    echo "  $0 show"
    echo ""
    echo -e "${YELLOW}Levels:${NC}"
    echo "  1 - Manual Mode (suggestions only)"
    echo "  2 - Guided Mode (simple tasks)"
    echo "  3 - Semi-Autonomous (default)"
    echo "  4 - Highly Autonomous (complex tasks)"
    echo "  5 - Fully Autonomous (everything)"
}

# Main script logic
case "${1:-}" in
    "show")
        show_current_level
        ;;
    "info")
        show_level_info
        ;;
    "help"|"-h"|"--help")
        show_help
        ;;
    [1-5])
        set_level "$1" "${2:-}"
        ;;
    "")
        show_current_level
        echo ""
        show_level_info
        ;;
    *)
        echo -e "${RED}❌ Error: Invalid option '$1'${NC}"
        echo ""
        show_help
        exit 1
        ;;
esac
