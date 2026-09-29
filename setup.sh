#!/bin/bash

RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

function interaction() {
  echo -e "${BLUE}---------------------"
  echo " Initialisation du projet"
  echo -e "---------------------${NC}"
  echo ""
  echo " 1) Tout en un"
  echo " 2) Configurer pnpm"
  echo " 3) Installer les dépendances"
  echo " 4) Appliquer le formatage / linter"
  echo ""

  read -rp "Entrez un numéro : " choice

  case $choice in
  1)
    allInOne
    ;;
  2)
    pnpmInit
    ;;
  3)
    dpdInstall
    ;;
  4)
    codeLintFix
    ;;
  *)
    echo -e "${RED}Vous avez saisi un numéro non géré : $choice${NC}"
    exit 1
    ;;
  esac
}

function verification() {
  if ! command -v node >/dev/null 2>&1; then
    echo -e "${RED}Node.js n'est pas détecté sur la machine.${NC}"
    exit 1
  fi

  nodev=$(node -v | sed -E 's/v([0-9]+)\..*/\1/')

  if [[ "$nodev" -lt 24 ]]; then
    echo -e "${RED}Vous avez une version de Node.js inférieure à celle du projet.${NC}"
    echo -e "${RED}Merci de mettre à jour Node.js ou de réaliser l'initialisation manuellement.${NC}"
    exit 1
  fi
}

function allInOne() {
  verification
  pnpmInit
  dpdInstall
  codeLintFix
}

function pnpmInit() {
  verification
  corepack enable
  corepack prepare pnpm@12.6.0 --activate

  echo -e "${GREEN}pnpm $(pnpm --version) configuré${NC}"
}

function dpdInstall() {
  verification

  pnpm install --frozen-lockfile

  echo -e "${GREEN}Dépendances installées${NC}"
}

function codeLintFix() {
  verification

  echo -e "${BLUE}Formatage du code${NC}"
  pnpm run format

  echo -e "${BLUE}Correction du lint${NC}"
  pnpm run lint:fix

  echo -e "${GREEN}Formatage et lint terminés${NC}"
}

interaction
