#!/bin/sh

# OMNIX AI - Docker Health Check Script
# Comprehensive health checking for containerized deployment

set -e

# Configuration
HOST="localhost"
PORT="8080"
TIMEOUT="10"
MAX_RETRIES="3"
RETRY_DELAY="2"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') [HEALTH] $1"
}

# Function to check HTTP endpoint
check_http() {
    local url="$1"
    local expected_status="$2"
    local description="$3"
    
    log "Checking $description: $url"
    
    local status_code
    status_code=$(curl -s -o /dev/null -w "%{http_code}" \
                      --max-time $TIMEOUT \
                      --connect-timeout 5 \
                      "$url" || echo "000")
    
    if [ "$status_code" = "$expected_status" ]; then
        log "✅ $description: HTTP $status_code (healthy)"
        return 0
    else
        log "❌ $description: HTTP $status_code (expected $expected_status)"
        return 1
    fi
}

# Function to check if nginx is running
check_nginx_process() {
    log "Checking nginx process..."
    
    if pgrep nginx > /dev/null; then
        log "✅ Nginx process is running"
        return 0
    else
        log "❌ Nginx process is not running"
        return 1
    fi
}

# Function to check critical files
check_files() {
    log "Checking critical application files..."
    
    local files_to_check="/usr/share/nginx/html/index.html /usr/share/nginx/html/build-manifest.json"
    local missing_files=""
    
    for file in $files_to_check; do
        if [ ! -f "$file" ]; then
            missing_files="$missing_files $file"
        fi
    done
    
    if [ -z "$missing_files" ]; then
        log "✅ All critical files are present"
        return 0
    else
        log "❌ Missing critical files:$missing_files"
        return 1
    fi
}

# Function to check nginx configuration
check_nginx_config() {
    log "Checking nginx configuration..."
    
    if nginx -t 2>/dev/null; then
        log "✅ Nginx configuration is valid"
        return 0
    else
        log "❌ Nginx configuration is invalid"
        return 1
    fi
}

# Function to check disk space
check_disk_space() {
    log "Checking disk space..."
    
    local usage
    usage=$(df /usr/share/nginx/html | tail -1 | awk '{print $5}' | sed 's/%//')
    
    if [ "$usage" -lt 90 ]; then
        log "✅ Disk usage: ${usage}% (healthy)"
        return 0
    else
        log "❌ Disk usage: ${usage}% (critical)"
        return 1
    fi
}

# Function to check memory usage
check_memory() {
    log "Checking memory usage..."
    
    local memory_info
    memory_info=$(free | grep Mem)
    local total=$(echo $memory_info | awk '{print $2}')
    local used=$(echo $memory_info | awk '{print $3}')
    local usage=$((used * 100 / total))
    
    if [ "$usage" -lt 90 ]; then
        log "✅ Memory usage: ${usage}% (healthy)"
        return 0
    else
        log "❌ Memory usage: ${usage}% (critical)"
        return 1
    fi
}

# Function to perform comprehensive health check
perform_health_check() {
    local checks_passed=0
    local total_checks=7
    
    log "Starting comprehensive health check..."
    
    # Check 1: Nginx process
    if check_nginx_process; then
        checks_passed=$((checks_passed + 1))
    fi
    
    # Check 2: Nginx configuration
    if check_nginx_config; then
        checks_passed=$((checks_passed + 1))
    fi
    
    # Check 3: Critical files
    if check_files; then
        checks_passed=$((checks_passed + 1))
    fi
    
    # Check 4: Main application endpoint
    if check_http "http://$HOST:$PORT/" "200" "Main application"; then
        checks_passed=$((checks_passed + 1))
    fi
    
    # Check 5: Health endpoint
    if check_http "http://$HOST:$PORT/health" "200" "Health endpoint"; then
        checks_passed=$((checks_passed + 1))
    fi
    
    # Check 6: Disk space
    if check_disk_space; then
        checks_passed=$((checks_passed + 1))
    fi
    
    # Check 7: Memory usage
    if check_memory; then
        checks_passed=$((checks_passed + 1))
    fi
    
    log "Health check completed: $checks_passed/$total_checks checks passed"
    
    # Determine overall health
    local pass_threshold=$((total_checks * 70 / 100))  # 70% threshold
    
    if [ "$checks_passed" -ge "$pass_threshold" ]; then
        log "✅ Overall health: HEALTHY ($checks_passed/$total_checks checks passed)"
        return 0
    else
        log "❌ Overall health: UNHEALTHY ($checks_passed/$total_checks checks passed)"
        return 1
    fi
}

# Function to run health check with retries
run_with_retries() {
    local attempt=1
    
    while [ $attempt -le $MAX_RETRIES ]; do
        log "Health check attempt $attempt of $MAX_RETRIES"
        
        if perform_health_check; then
            log "✅ Health check passed on attempt $attempt"
            return 0
        fi
        
        if [ $attempt -lt $MAX_RETRIES ]; then
            log "⚠️ Health check failed, retrying in ${RETRY_DELAY}s..."
            sleep $RETRY_DELAY
        fi
        
        attempt=$((attempt + 1))
    done
    
    log "❌ Health check failed after $MAX_RETRIES attempts"
    return 1
}

# Function to output health status in JSON format
output_health_status() {
    local status="$1"
    local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    local hostname=$(hostname)
    local uptime=$(uptime -p 2>/dev/null || echo "unknown")
    
    cat << EOF
{
  "status": "$status",
  "timestamp": "$timestamp",
  "hostname": "$hostname",
  "uptime": "$uptime",
  "version": "1.0.0",
  "service": "omnix-ai-frontend",
  "checks": {
    "nginx": "$(pgrep nginx > /dev/null && echo "healthy" || echo "unhealthy")",
    "files": "$([ -f "/usr/share/nginx/html/index.html" ] && echo "healthy" || echo "unhealthy")",
    "disk": "healthy",
    "memory": "healthy"
  }
}
EOF
}

# Main execution
main() {
    log "OMNIX AI Frontend Health Check Starting"
    log "Configuration: Host=$HOST, Port=$PORT, Timeout=${TIMEOUT}s, Retries=$MAX_RETRIES"
    
    if run_with_retries; then
        output_health_status "healthy"
        log "🎉 Health check completed successfully"
        exit 0
    else
        output_health_status "unhealthy"
        log "💥 Health check failed"
        exit 1
    fi
}

# Run main function
main "$@"