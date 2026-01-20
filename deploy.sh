#!/bin/bash
# Deployment script for mrdj-fne-mcp to VPS

set -e

VPS_USER="deployer"
VPS_HOST="DavidJGrimsley.com"
DEPLOY_PATH="/home/deployer/mrdj-fne-mcp"
APP_NAME="mrdj-fne-mcp"
PORT=4001

echo "=== Deploying mrdj-fne-mcp to VPS ==="

# Build locally
echo "Building application..."
npm run build

# Create deployment package
echo "Creating deployment package..."
tar -czf deploy.tar.gz build/ guides/ resources/ package.json package-lock.json

# Copy to VPS
echo "Copying files to VPS..."
scp deploy.tar.gz ${VPS_USER}@${VPS_HOST}:/tmp/

# Deploy on VPS
echo "Deploying on VPS..."
ssh ${VPS_USER}@${VPS_HOST} << EOF
  set -e

  mkdir -p ${DEPLOY_PATH}
  cd ${DEPLOY_PATH}

  tar -xzf /tmp/deploy.tar.gz
  rm /tmp/deploy.tar.gz

  npm ci --production

  if pm2 describe ${APP_NAME} > /dev/null 2>&1; then
    echo "Restarting existing PM2 process..."
    pm2 restart ${APP_NAME}
  else
    echo "Starting new PM2 process..."
    pm2 start build/index.js --name ${APP_NAME} -- --http-port ${PORT}
    pm2 save
  fi

  pm2 info ${APP_NAME}
EOF

rm deploy.tar.gz

echo "=== Deployment complete ==="
echo "Health check: https://DavidJGrimsley.com/public-facing/mcp/mrdj-fne-mcp/health"
