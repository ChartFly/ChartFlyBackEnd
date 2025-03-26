#!/bin/bash
# setup-hooks.sh

echo "🔧 Setting up Git pre-push hook to block .env pushes..."

# Ensure the hooks directory exists
if [ ! -d ".git/hooks" ]; then
  echo "❌ .git/hooks directory not found. Are you in the project root?"
  exit 1
fi

# Create the pre-push hook
cat <<'EOF' > .git/hooks/pre-push
#!/bin/bash

if git diff --cached --name-only | grep -q ".env"; then
  echo "⛔ Push rejected: .env file is staged. Remove it before pushing."
  exit 1
fi
EOF

# Make it executable
chmod +x .git/hooks/pre-push

echo "✅ Git pre-push hook installed successfully."