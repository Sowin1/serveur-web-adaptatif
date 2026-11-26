#!/usr/bin/env bash
set -Eeuo pipefail

export BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
export PROJECT_DIR="$BASE_DIR/serveur-web-adaptatif"
export INSTALLATION_DIR="$BASE_DIR/installation"

cd "$BASE_DIR"

GREEN='\033[1;32m'
RED='\033[1;31m'
NC='\033[0m'

# Vérification des droits
if [[ $EUID -ne 0 ]]; then
    echo -e "${RED}Erreur : exécutez ce script avec sudo${NC}"
    exit 1
fi

if [[ ! -f /etc/os-release ]]; then
    echo -e "${RED}Système non reconnu${NC}"
    exit 1
fi

source /etc/os-release

if [[ "$ID" != "debian" && "$ID" != "ubuntu" &&
      " ${ID_LIKE:-} " != *" debian "* &&
      " ${ID_LIKE:-} " != *" ubuntu "* ]]; then
    echo -e "${RED}Distribution non compatible : $ID${NC}"
    exit 1
fi

# Mise à jour

apt-get update
apt-get upgrade -y

# Installation primaire

apt-get install -y \
  curl \
  ufw \
  letsencrypt \
  unzip

# Install version manager

curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.41.0/install.sh | bash

# Mandatory installation
export NVM_DIR="$HOME/.nvm"

[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

nvm install 26.13.0
nvm alias default 26.13.0

## Pnpm activation
npm install -g pnpm

apt install nginx -y

# Retrieve project

BRANCH="feat/installScript"

curl -fL "https://github.com/Sowin1/serveur-web-adaptatif/archive/refs/heads/${BRANCH}.zip" -o /tmp/srv-projet.zip \
  && unzip -q /tmp/srv-projet.zip \
  && mv "serveur-web-adaptatif-${BRANCH//\//-}" serveur-web-adaptatif \
  && rm /tmp/srv-projet.zip \
  && cd serveur-web-adaptatif \
  && pnpm install

# Installation of project deps

mv "$PROJECT_DIR/installation" "$INSTALLATION_DIR"

node "$INSTALLATION_DIR/installServer.mjs"

bash "$INSTALLATION_DIR/initInstall.sh"
