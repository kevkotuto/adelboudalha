#!/bin/bash

# Fix all admin services to use response.data instead of response.data.data

echo "Fixing admin services API response handling..."

# List of files to fix
files=(
  "services/adminUsersService.ts"
  "services/adminOrdersService.ts"
  "services/adminProductsService.ts"
  "services/adminGiftCardsService.ts"
  "services/adminCategoriesService.ts"
  "services/adminAuditService.ts"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "Fixing $file..."
    # Replace response.data.data with response.data
    sed -i '' 's/return response\.data\.data;/return response.data;/g' "$file"
    echo "✅ Fixed $file"
  else
    echo "⚠️  File not found: $file"
  fi
done

echo ""
echo "✅ All admin services fixed!"
