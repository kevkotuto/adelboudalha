#!/bin/bash

# Fix admin theme to use useAdminTheme hook instead of hardcoded dark colors

echo "Fixing admin theme usage in all admin screens..."

# Find all admin tab files
admin_files=$(find app/\(admintabs\) -name "*.tsx" -type f)

for file in $admin_files; do
  echo "Processing $file..."

  # Replace Colors.admin. with adminColors.
  sed -i '' 's/Colors\.admin\./adminColors\./g' "$file"

  echo "✅ Fixed $file"
done

echo ""
echo "✅ All admin screens updated to use dynamic theme!"
echo ""
echo "⚠️  Remember to add 'const { colors: adminColors } = useAdminTheme();' to each screen"
