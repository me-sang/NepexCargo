# pnpm Quick Reference

This project uses **pnpm** for package management — it's faster and more disk-efficient than npm/yarn.

## Installation

```bash
# Install pnpm globally (one-time setup)
npm install -g pnpm

# Verify installation
pnpm --version
```

## Daily Commands

```bash
# Install project dependencies
pnpm install

# Add a new dependency
pnpm add axios
pnpm add -D @types/node

# Remove a dependency
pnpm remove axios

# Update dependencies
pnpm update
pnpm update --latest  # Check for latest versions

# Check outdated packages
pnpm outdated

# View dependency tree
pnpm ls
pnpm ls --depth=2
```

## Running Scripts

```bash
# All npm scripts use pnpm:
pnpm dev               # npm run dev
pnpm build             # npm run build
pnpm test              # npm test
pnpm migration:run     # npm run migration:run
```

## Troubleshooting

**"command not found: pnpm"**
```bash
npm install -g pnpm
```

**Clear pnpm cache (if issues persist)**
```bash
pnpm store prune
```

**Reinstall all dependencies from scratch**
```bash
rm pnpm-lock.yaml node_modules
pnpm install
```

**Use a specific pnpm version**
```bash
pnpm env use --global 9.0.0
```

## Why pnpm?

| Feature | npm | yarn | pnpm |
|---------|-----|------|------|
| Speed | ✅ | ✅✅ | ✅✅✅ |
| Disk usage | 1x | 1.1x | 0.3x |
| Peer deps | ⚠️ | ✅ | ✅✅ |
| Monorepo | ⚠️ | ✅ | ✅✅ |
| Strictness | ⚠️ | ✅ | ✅✅ |

## Learn More

- [pnpm documentation](https://pnpm.io)
- [pnpm vs npm vs yarn](https://pnpm.io/motivation)
