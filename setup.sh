#!/bin/bash

RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

function interaction() {
  echo -e "${BLUE}---------------------"
  echo " Initialisation du projet"
  echo -e "---------------------"
  echo ""
  echo " 1) Tout en Un"
  echo " 2) Appliquer pnpm à nodejs"
  echo " 3) Installer les dependence"
  echo " 4) Appliquer le linter / format check"
  echo -e "${BLUE}"

  read -p "Entrez un numéro : " choice

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
    echo -e "${RED} Node n'est pas detecté sur la machine ${NC}"
    exit 1
  fi

  nodev=$(node -v | sed -E 's/v([0-9]+)\..*/\1/')

  if [[ "$nodev" -lt 24 ]]; then
    echo -e "${RED} Vous avez une version de Node.js inférieure à celle du projet. ${NC}"
    echo -e "${RED} Merci de mettre à jour votre version de Node ou de réaliser l'initialisation manuellement ${NC}"
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
  corepack prepare pnpm@latest --activate
}

function dpdInstall() {
  verification

  pnpm install --frozen-lockfile
}

function codeLintFix() {
  verification

  pnpm run format
  pnpm run lint:fix
}

interaction
