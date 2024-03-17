#!/bin/bash

if [[ "$VERCEL_ENV" == "production" ]]; then
  if git diff HEAD^ HEAD --quiet -- public/ src/; then
    echo "✅ - Changes detected in public/ or src/, build can proceed"
    exit 1;
  else
    echo "🛑 - No changes detected in public/ or src/, build cancelled"
    exit 0;
  fi
else
  echo "🛑 - Not in production, build cancelled"
  exit 0;
fi
