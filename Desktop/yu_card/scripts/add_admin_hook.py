#!/usr/bin/env python3
import os
import re

admin_files = [
    'app/(admintabs)/settings.tsx',
    'app/(admintabs)/gift-codes.tsx',
    'app/(admintabs)/delivery.tsx',
    'app/(admintabs)/notifications.tsx',
    'app/(admintabs)/users.tsx',
    'app/(admintabs)/orders.tsx',
    'app/(admintabs)/products.tsx',
    'app/(admintabs)/categories.tsx',
]

for file_path in admin_files:
    if not os.path.exists(file_path):
        print(f"⚠️  File not found: {file_path}")
        continue

    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Check if already has useAdminTheme import
    if 'useAdminTheme' in content:
        print(f"✅ {file_path} already has useAdminTheme")
        continue

    # Add import after useTranslation import
    if "import useTranslation from '@/hooks/useTranslation';" in content:
        content = content.replace(
            "import useTranslation from '@/hooks/useTranslation';",
            "import useTranslation from '@/hooks/useTranslation';\nimport { useAdminTheme } from '@/hooks/useAdminTheme';"
        )

    # Add hook usage after useTranslation hook
    # Look for "const { t } = useTranslation();" pattern
    pattern = r"(const \{ t \} = useTranslation\(\);)"
    if re.search(pattern, content):
        content = re.sub(
            pattern,
            r"\1\n  const { colors: adminColors } = useAdminTheme();",
            content,
            count=1
        )

        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)

        print(f"✅ Added useAdminTheme to {file_path}")
    else:
        print(f"⚠️  Could not find useTranslation in {file_path}")

print("\n✅ All admin screens now have useAdminTheme hook!")
