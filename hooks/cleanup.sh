#!/bin/bash
set -euo pipefail

WORK_ROOT="/home/github-runner/actions-runner/_work"
REPO_DIR="$WORK_ROOT/serveur-web-adaptatif/serveur-web-adaptatif"
GREEN='\033[0;32m'
NC='\033[0m'

echo "[CLEANUP] Starting workspace cleanup"

if [[ -d "$REPO_DIR" ]]; then
    find "$REPO_DIR" -mindepth 1 -maxdepth 1 -exec rm -rf -- {} +
fi

echo -e "${GREEN}[CLEANUP] Workspace cleaned${NC}"
