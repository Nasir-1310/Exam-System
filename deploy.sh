#!/bin/bash
set -e

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

VPS_USER="root"
VPS_IP=${{ secrets.VPS_IP }}
VPS_PASS=${{ secrets.VPS_PASS }}
ARCHIVE_NAME="exam-system.tar.gz"
PROJECT_DIR="Exam-System"

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
log_info "Checking prerequisites..."

if ! command_exists sshpass; then
    log_warn "sshpass not found. Installing..."
    sudo apt-get update && sudo apt-get install -y sshpass
    log_info "sshpass installed successfully."
fi

# Get VPS password
log_info "VPS Configuration:"
echo "  User: $VPS_USER"
echo "  IP:   $VPS_IP"
echo "  Password: $VPS_PASS"
# read -sp "Enter VPS password: " VPS_PASS
echo ""

if [ -z "$VPS_PASS" ]; then
    log_error "Password cannot be empty."
    exit 1
fi

# Test SSH connection
log_info "Testing SSH connection to VPS..."
if ! sshpass -p "$VPS_PASS" ssh -o StrictHostKeyChecking=no -o ConnectTimeout=10 $VPS_USER@$VPS_IP "echo 'Connection successful'" &>/dev/null; then
    log_error "Failed to connect to VPS."
    exit 1
fi
log_info "SSH connection successful."

# Create archive
log_info "Creating project archive..."
cd ..

if [ ! -d "$PROJECT_DIR" ]; then
    log_error "Project directory '$PROJECT_DIR' not found!"
    exit 1
fi

EXCLUDE_ARGS=(
  --exclude="$PROJECT_DIR/.git"
  --exclude="$PROJECT_DIR/node_modules"
  --exclude="$PROJECT_DIR/**/node_modules"
  --exclude="$PROJECT_DIR/__pycache__"
  --exclude="$PROJECT_DIR/*.pyc"
  --exclude="$PROJECT_DIR/.env.local"
  --exclude="$PROJECT_DIR/.DS_Store"
  --exclude="$PROJECT_DIR/venv"
  --exclude="$PROJECT_DIR/**/.next"
  --exclude="$PROJECT_DIR/.next"
  --exclude="$PROJECT_DIR/**/.venv"
  --exclude="$PROJECT_DIR/.venv"
  --exclude="$PROJECT_DIR/**/dist"
  --exclude="$PROJECT_DIR/**/build"
  --exclude="$PROJECT_DIR/*.log"6
)

tar "${EXCLUDE_ARGS[@]}" -czf "$ARCHIVE_NAME" "$PROJECT_DIR"
ARCHIVE_SIZE=$(du -h "$ARCHIVE_NAME" | cut -f1)
log_info "Archive created: $ARCHIVE_NAME (Size: $ARCHIVE_SIZE)"

cd "$PROJECT_DIR"
mv "../$ARCHIVE_NAME" .

# Upload archive
log_info "Uploading archive to VPS..."
if ! sshpass -p "$VPS_PASS" scp -o StrictHostKeyChecking=no "$ARCHIVE_NAME" $VPS_USER@$VPS_IP:/root/; then
    log_error "Failed to upload archive to VPS."
    rm -f "$ARCHIVE_NAME"
    exit 1
fi
log_info "Archive uploaded successfully."

rm -f "$ARCHIVE_NAME"

# Deploy on VPS
log_info "Deploying on VPS..."
sshpass -p "$VPS_PASS" ssh -o StrictHostKeyChecking=no $VPS_USER@$VPS_IP << 'ENDSSH'
  set -e
  
  GREEN='\033[0;32m'
  YELLOW='\033[1;33m'
  RED='\033[0;31m'
  NC='\033[0m'
  
  echo -e "${GREEN}[VPS]${NC} Starting deployment process..."
  cd /root
  
  # Backup existing deployment
  if [ -d "Exam-System" ]; then
    BACKUP_NAME="Exam-System-backup-$(date +%Y%m%d-%H%M%S)"
    echo -e "${YELLOW}[VPS]${NC} Creating backup: $BACKUP_NAME"
    cp -r Exam-System "$BACKUP_NAME"
    ls -dt Exam-System-backup-* 2>/dev/null | tail -n +4 | xargs rm -rf 2>/dev/null || true
  fi
  
  # Extract archive
  echo -e "${GREEN}[VPS]${NC} Extracting archive..."
  tar -xzf exam-system.tar.gz
  cd Exam-System
  
  # Check if docker-compose exists
  if [ ! -f "docker-compose.yml" ] && [ ! -f "compose.yaml" ]; then
    echo -e "${RED}[ERROR]${NC} No docker-compose.yml found!"
    exit 1
  fi
  
  # Detect if using Podman or Docker
  COMPOSE_CMD="docker compose"
  if command -v podman &> /dev/null && ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}[VPS]${NC} Detected Podman, using podman-compose"
    COMPOSE_CMD="podman-compose"
  fi
  
  # Stop existing containers (ignore errors)
  echo -e "${GREEN}[VPS]${NC} Stopping existing containers..."
  $COMPOSE_CMD down --timeout 30 2>/dev/null || true
  
  # Clean up pods if using Podman
  if command -v podman &> /dev/null; then
    echo -e "${GREEN}[VPS]${NC} Cleaning up Podman resources..."
    podman pod rm -f pod_exam-system 2>/dev/null || true
    podman container prune -f 2>/dev/null || true
  fi
  
  # Build and start
  echo -e "${GREEN}[VPS]${NC} Building and starting containers..."
  $COMPOSE_CMD up -d --build --remove-orphans
  
  # Wait for containers
  echo -e "${GREEN}[VPS]${NC} Waiting for containers to start..."
  sleep 5
  
  # Show status
  echo -e "${GREEN}[VPS]${NC} Container status:"
  $COMPOSE_CMD ps
  
  # Clean up
  if command -v podman &> /dev/null; then
    podman image prune -f 2>/dev/null || true
  elif command -v docker &> /dev/null; then
    docker image prune -f 2>/dev/null || true
  fi
  
  # Show logs
  echo -e "${GREEN}[VPS]${NC} Recent logs:"
  $COMPOSE_CMD logs --tail=20
  
  echo -e "${GREEN}[VPS]${NC} Deployment complete!"
ENDSSH

DEPLOY_STATUS=$?

if [ $DEPLOY_STATUS -eq 0 ]; then
    log_info "=========================================="
    log_info "Deployment completed successfully!"
    log_info "=========================================="
    log_info "Application: http://$VPS_IP"
else
    log_error "Deployment failed!"
    log_info "The build failed. Common issues:"
    echo "  1. Check your Dockerfile paths (Backend/requirements.txt)"
    echo "  2. Ensure all files referenced in Dockerfile exist"
    echo "  3. Review docker-compose.yml build context"
    echo ""
    log_info "To debug, SSH to VPS and check:"
    echo "  ssh $VPS_USER@$VPS_IP"
    echo "  cd /root/Exam-System"
    echo "  ls -la Backend/"
    echo "  cat Dockerfile"
    exit $DEPLOY_STATUS
fi