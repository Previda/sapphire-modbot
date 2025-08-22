#!/bin/bash

# Sapphire Bot - GitHub Repository Setup and Automation
# Automated GitHub repository initialization and CI/CD setup

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
REPO_NAME="sapphire-modbot"
REPO_DESC="Advanced Discord moderation bot optimized for Raspberry Pi"
BOT_DIR="/home/pi/sapphire-bot"
GITHUB_USERNAME=""
GITHUB_TOKEN=""

# Logging
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1"
}

# Check requirements
check_requirements() {
    log "Checking requirements..."
    
    # Check if git is installed
    if ! command -v git &> /dev/null; then
        echo -e "${RED}❌ Git is not installed${NC}"
        echo "Installing Git..."
        sudo apt update && sudo apt install -y git
    fi
    
    # Check if gh CLI is installed
    if ! command -v gh &> /dev/null; then
        echo -e "${YELLOW}⚠️  GitHub CLI not installed. Installing...${NC}"
        curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
        echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
        sudo apt update && sudo apt install -y gh
    fi
    
    log "✅ Requirements check completed"
}

# Get user input
get_user_input() {
    echo -e "${BLUE}🔧 GitHub Repository Setup${NC}"
    echo ""
    
    if [ -z "$GITHUB_USERNAME" ]; then
        read -p "Enter your GitHub username: " GITHUB_USERNAME
    fi
    
    if [ -z "$GITHUB_TOKEN" ]; then
        echo "You'll need to authenticate with GitHub CLI..."
        gh auth login
    fi
    
    # Confirm repository details
    echo ""
    echo -e "${CYAN}Repository Details:${NC}"
    echo "Name: $REPO_NAME"
    echo "Description: $REPO_DESC"
    echo "Username: $GITHUB_USERNAME"
    echo ""
    
    read -p "Continue with these settings? (y/N): " confirm
    if [[ ! $confirm =~ ^[Yy]$ ]]; then
        echo "Setup cancelled"
        exit 1
    fi
}

# Initialize Git repository
init_git_repo() {
    log "Initializing Git repository..."
    
    cd "$(dirname "$0")/.." || exit 1
    
    # Initialize git if not already done
    if [ ! -d ".git" ]; then
        git init
        log "Git repository initialized"
    else
        log "Git repository already exists"
    fi
    
    # Create or update .gitignore
    cat > .gitignore << 'EOF'
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
logs/
*.log
*.log.*
.pm2/

# Runtime data
pids/
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/
*.lcov

# nyc test coverage
.nyc_output

# Dependency directories
jspm_packages/

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env.test

# parcel-bundler cache (https://parceljs.org/)
.cache
.parcel-cache

# Next.js build output
.next

# Nuxt.js build / generate output
.nuxt
dist

# Storybook build outputs
.out
.storybook-out

# Temporary folders
tmp/
temp/

# Editor directories and files
.vscode/
.idea/
*.swp
*.swo
*~

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# Bot specific
data/backups/
data/tickets/
data/transcripts/
data/cache/
*.db
*.sqlite
*.sqlite3

# Pi specific
*.old
backup-*/
system-backup-*
EOF
    
    # Add all files to git
    git add .
    
    # Create initial commit if needed
    if ! git log --oneline -1 &>/dev/null; then
        git commit -m "Initial commit - Sapphire Bot Pi-optimized version"
        log "Initial commit created"
    fi
    
    log "✅ Git repository setup completed"
}

# Create GitHub repository
create_github_repo() {
    log "Creating GitHub repository..."
    
    # Check if repository already exists
    if gh repo view "$GITHUB_USERNAME/$REPO_NAME" &>/dev/null; then
        log "Repository already exists on GitHub"
        
        # Add remote if not exists
        if ! git remote get-url origin &>/dev/null; then
            git remote add origin "https://github.com/$GITHUB_USERNAME/$REPO_NAME.git"
            log "Added remote origin"
        fi
    else
        # Create new repository
        gh repo create "$REPO_NAME" \
            --description "$REPO_DESC" \
            --public \
            --add-readme=false \
            --clone=false
        
        # Add remote origin
        git remote add origin "https://github.com/$GITHUB_USERNAME/$REPO_NAME.git"
        
        log "✅ GitHub repository created successfully"
    fi
    
    # Push to GitHub
    git branch -M main
    git push -u origin main
    
    log "✅ Code pushed to GitHub"
}

# Setup GitHub Actions
setup_github_actions() {
    log "Setting up GitHub Actions..."
    
    mkdir -p .github/workflows
    
    # Create CI/CD workflow
    cat > .github/workflows/pi-deploy.yml << 'EOF'
name: Raspberry Pi Deploy

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [18.x]
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Use Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v3
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run syntax check
      run: node -c index.js
    
    - name: Check required files
      run: |
        test -f index.js
        test -f package.json
        test -d src/commands
        test -d src/events
    
    - name: Test Discord.js compatibility
      run: node -e "const { Client } = require('discord.js'); console.log('Discord.js test passed');"

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - name: Deploy to Raspberry Pi
      uses: appleboy/ssh-action@v0.1.7
      with:
        host: ${{ secrets.PI_HOST }}
        username: ${{ secrets.PI_USER }}
        key: ${{ secrets.PI_SSH_KEY }}
        script: |
          cd /home/pi
          if [ -f "sapphire-bot/scripts/pi-auto-update.sh" ]; then
            bash sapphire-bot/scripts/pi-auto-update.sh update
          else
            echo "Auto-update script not found, manual deployment needed"
          fi
EOF
    
    # Create issue templates
    mkdir -p .github/ISSUE_TEMPLATE
    
    cat > .github/ISSUE_TEMPLATE/bug_report.md << 'EOF'
---
name: Bug report
about: Create a report to help us improve
title: '[BUG] '
labels: bug
assignees: ''

---

**Describe the bug**
A clear and concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected behavior**
A clear and concise description of what you expected to happen.

**Screenshots**
If applicable, add screenshots to help explain your problem.

**Environment (please complete the following information):**
 - OS: [e.g. Raspberry Pi OS]
 - Node.js version: [e.g. 18.17.0]
 - Bot version: [e.g. 1.0.0]

**Additional context**
Add any other context about the problem here.
EOF

    cat > .github/ISSUE_TEMPLATE/feature_request.md << 'EOF'
---
name: Feature request
about: Suggest an idea for this project
title: '[FEATURE] '
labels: enhancement
assignees: ''

---

**Is your feature request related to a problem? Please describe.**
A clear and concise description of what the problem is. Ex. I'm always frustrated when [...]

**Describe the solution you'd like**
A clear and concise description of what you want to happen.

**Describe alternatives you've considered**
A clear and concise description of any alternative solutions or features you've considered.

**Additional context**
Add any other context or screenshots about the feature request here.
EOF

    # Create pull request template
    cat > .github/pull_request_template.md << 'EOF'
## Description
Brief description of changes

## Type of change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] This change requires a documentation update

## How Has This Been Tested?
- [ ] Tested locally
- [ ] Tested on Raspberry Pi
- [ ] All tests pass

## Checklist:
- [ ] My code follows the style guidelines of this project
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] Any dependent changes have been merged and published in downstream modules
EOF
    
    log "✅ GitHub Actions setup completed"
}

# Create deployment documentation
create_deployment_docs() {
    log "Creating deployment documentation..."
    
    cat > DEPLOYMENT_GUIDE.md << 'EOF'
# 🚀 Sapphire Bot - Raspberry Pi Deployment Guide

## Quick Start

### 1. Fresh Installation
```bash
# On your Raspberry Pi
curl -sSL https://raw.githubusercontent.com/Previda/sapphire-modbot/main/scripts/pi-auto-update.sh | bash -s install
```

### 2. Update Existing Installation
```bash
bash /home/pi/sapphire-bot/scripts/pi-auto-update.sh update
```

## Manual Setup

### Prerequisites
- Raspberry Pi 3B+ or newer (minimum 512MB RAM)
- Raspberry Pi OS (32-bit or 64-bit)
- Internet connection
- Discord Bot Token

### Step-by-Step Installation

1. **System Update**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

2. **Clone Repository**
   ```bash
   git clone https://github.com/Previda/sapphire-modbot.git /home/pi/sapphire-bot
   cd /home/pi/sapphire-bot
   ```

3. **Run Setup Script**
   ```bash
   bash scripts/pi-auto-update.sh install
   ```

4. **Configure Environment**
   ```bash
   cp .env.example .env
   nano .env
   ```
   
   Add your Discord bot token and other configuration.

5. **Start the Bot**
   ```bash
   npm start
   # or with PM2
   pm2 start index.js --name sapphire-bot
   ```

## Monitoring

### Real-time Dashboard
```bash
bash scripts/pi-system-monitor.sh dashboard
```

### Health Check
```bash
bash scripts/pi-system-monitor.sh check
```

### Generate Report
```bash
bash scripts/pi-system-monitor.sh report
```

## Maintenance Commands

### Update Bot
```bash
bash scripts/pi-auto-update.sh update
```

### Fix Issues
```bash
bash scripts/pi-auto-update.sh fix
```

### Rollback
```bash
bash scripts/pi-auto-update.sh rollback
```

### View Logs
```bash
bash scripts/pi-auto-update.sh logs
```

## Troubleshooting

### Common Issues

1. **Out of Memory**
   - Increase swap space
   - Restart bot: `pm2 restart sapphire-bot`

2. **Command Registration Fails**
   - Check Discord token in `.env`
   - Run: `node register-commands.js`

3. **Bot Won't Start**
   - Check logs: `pm2 logs sapphire-bot`
   - Verify dependencies: `npm install`

### Performance Optimization

- **Memory Usage**: Bot uses <85MB RAM with optimizations
- **CPU Usage**: Minimal background processing
- **Storage**: Requires ~200MB disk space

## Support

- Create an issue on GitHub for bugs
- Check the wiki for detailed documentation
- Join our Discord server for community support
EOF
    
    log "✅ Deployment documentation created"
}

# Setup branch protection and webhooks
setup_github_protection() {
    log "Setting up GitHub repository protection..."
    
    # Enable branch protection for main branch
    gh api repos/"$GITHUB_USERNAME"/"$REPO_NAME"/branches/main/protection \
        --method PUT \
        --field required_status_checks='{"strict":true,"contexts":["test"]}' \
        --field enforce_admins=false \
        --field required_pull_request_reviews='{"required_approving_review_count":1}' \
        --field restrictions=null 2>/dev/null || {
        log "⚠️  Could not set branch protection (may require admin access)"
    }
    
    log "✅ GitHub protection setup completed"
}

# Main execution
main() {
    echo -e "${BLUE}🐙 Sapphire Bot - GitHub Setup${NC}"
    echo -e "${BLUE}==============================${NC}"
    
    case "${1:-setup}" in
        "setup")
            check_requirements
            get_user_input
            init_git_repo
            create_github_repo
            setup_github_actions
            create_deployment_docs
            
            # Add and commit new files
            git add .
            git commit -m "Add GitHub Actions and deployment documentation"
            git push origin main
            
            setup_github_protection
            
            echo ""
            echo -e "${GREEN}✅ GitHub repository setup completed successfully!${NC}"
            echo ""
            echo -e "${CYAN}Repository URL: https://github.com/$GITHUB_USERNAME/$REPO_NAME${NC}"
            echo -e "${CYAN}Clone command: git clone https://github.com/$GITHUB_USERNAME/$REPO_NAME.git${NC}"
            echo ""
            echo -e "${YELLOW}Next steps:${NC}"
            echo "1. Update the repository URL in pi-auto-update.sh"
            echo "2. Setup GitHub secrets for automatic deployment:"
            echo "   - PI_HOST (your Pi's IP address)"
            echo "   - PI_USER (usually 'pi')"
            echo "   - PI_SSH_KEY (your SSH private key)"
            echo "3. Test deployment on your Raspberry Pi"
            ;;
        "update-scripts")
            # Update repository URL in scripts
            if [ -n "$GITHUB_USERNAME" ]; then
                sed -i "s|REPO_URL=\".*\"|REPO_URL=\"https://github.com/$GITHUB_USERNAME/$REPO_NAME.git\"|" scripts/pi-auto-update.sh
                sed -i "s|Previda|$GITHUB_USERNAME|g" DEPLOYMENT_GUIDE.md
                
                git add .
                git commit -m "Update repository URLs in deployment scripts"
                git push origin main
                
                echo -e "${GREEN}✅ Scripts updated with correct repository URL${NC}"
            else
                echo -e "${RED}❌ GitHub username not set${NC}"
                exit 1
            fi
            ;;
        *)
            echo "Usage: $0 {setup|update-scripts}"
            echo ""
            echo "Commands:"
            echo "  setup         - Complete GitHub repository setup"
            echo "  update-scripts - Update scripts with repository URL"
            exit 1
            ;;
    esac
}

# Run main function
main "$@"
