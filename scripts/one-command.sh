#!/usr/bin/env bash
set -euo pipefail

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker не найден. Установи Docker Desktop и повтори." >&2
  exit 1
fi

if [ ! -f apps/api/.env ]; then
  cp apps/api/.env.example apps/api/.env
  echo "Создан apps/api/.env (dev-режим по умолчанию)."
fi

if [ ! -f apps/web/.env ]; then
  cp apps/web/.env.example apps/web/.env
  echo "Создан apps/web/.env."
fi

echo "Стартуем всё одной командой через Docker..."

docker compose up --build
