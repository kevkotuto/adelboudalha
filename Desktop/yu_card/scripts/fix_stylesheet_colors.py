#!/usr/bin/env python3
import re
import os

admin_files = [
    'app/(admintabs)/delivery.tsx',
    'app/(admintabs)/notifications.tsx',
    'app/(admintabs)/settings.tsx',
    'app/(admintabs)/gift-codes.tsx',
    'app/(admintabs)/users.tsx',
    'app/(admintabs)/orders.tsx',
    'app/(admintabs)/products.tsx',
    'app/(admintabs)/categories.tsx',
    'app/(admintabs)/index.tsx',
]

for file_path in admin_files:
    if not os.path.exists(file_path):
        print(f"⚠️  File not found: {file_path}")
        continue

    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find the StyleSheet.create section
    # Replace adminColors with Colors.admin.dark in StyleSheet only

    # Pattern: StyleSheet.create({ ... })
    # We need to replace adminColors only inside StyleSheet.create

    def replace_in_stylesheet(match):
        stylesheet_content = match.group(1)
        # Replace adminColors. with Colors.admin.dark.
        fixed_content = stylesheet_content.replace('adminColors.', 'Colors.admin.dark.')
        return f"StyleSheet.create({{{fixed_content}}})"

    # Use regex to find StyleSheet.create and replace within it
    pattern = r'StyleSheet\.create\(\{(.*?)\}\);'
    content = re.sub(pattern, replace_in_stylesheet, content, flags=re.DOTALL)

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

    print(f"✅ Fixed StyleSheet in {file_path}")

print("\n✅ All StyleSheet color references fixed!")
