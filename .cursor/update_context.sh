#!/bin/bash

# Update package.json information
PACKAGE_INFO=$(node -e "console.log(JSON.stringify(require('./package.json'), null, 2))")

# Create or update project_context.json
cat > .cursor/project_context.json << EOF
{
  "project": {
    "name": "grid-game",
    "type": "nextjs-game",
    "version": $(echo "$PACKAGE_INFO" | jq '.version'),
    "status": "initial-development"
  },
  "tech_stack": {
    "framework": {
      "name": "nextjs",
      "version": $(echo "$PACKAGE_INFO" | jq '.dependencies.next')
    },
    "ui": {
      "library": "react",
      "version": $(echo "$PACKAGE_INFO" | jq '.dependencies.react')
    },
    "styling": {
      "framework": "tailwindcss",
      "version": $(echo "$PACKAGE_INFO" | jq '.devDependencies.tailwindcss')
    },
    "language": {
      "name": "typescript",
      "version": $(echo "$PACKAGE_INFO" | jq '.devDependencies.typescript')
    }
  },
  "structure": {
    "src": {
      "app": {
        "components": "reusable-ui-components",
        "layout.tsx": "root-layout-component",
        "page.tsx": "main-page-component",
        "globals.css": "global-styles"
      }
    },
    "public": "static-assets",
    ".next": "nextjs-build-output"
  },
  "scripts": $(echo "$PACKAGE_INFO" | jq '.scripts'),
  "current_state": {
    "phase": "initial-setup",
    "completed": [
      "nextjs-application-structure",
      "typescript-configuration",
      "tailwind-css-integration",
      "eslint-setup",
      "basic-layout-components"
    ]
  },
  "next_steps": [
    "implement-grid-game-logic",
    "create-game-specific-components",
    "add-game-state-management",
    "implement-user-interactions",
    "add-game-features-and-mechanics"
  ],
  "conventions": {
    "styling": "tailwind-css",
    "component-structure": "nextjs-app-router",
    "type-safety": "typescript"
  }
}
EOF

# Make the script executable
chmod +x .cursor/update_context.sh 