# Code Style & Quality Guidelines

This project uses **Prettier** for code formatting and **ESLint 10.x** for code quality and consistency.

**Latest versions:**
- ESLint: 10.3.0
- @typescript-eslint: 8.0.0
- Prettier: 3.3.0

See **PROJECT_SETUP.md** for full setup and usage instructions.

### Prerequisites

Ensure VS Code extensions are installed:
- **Prettier - Code formatter** (`esbenp.prettier-vscode`)
- **ESLint** (`dbaeumer.vscode-eslint`)

Install them from the Extensions tab or run:
```bash
code --install-extension esbenp.prettier-vscode
code --install-extension dbaeumer.vscode-eslint
```

### Auto-format on Save

The `.vscode/settings.json` is configured to:
- Format code with Prettier on save
- Fix ESLint errors on save
- Organize imports on save

Just save a file (`Ctrl+S` / `Cmd+S`) and it will auto-format.

---

## Prettier Configuration

**Prettier** formats code consistently (spacing, quotes, line length, etc.).

### Settings (.prettierrc)

```json
{
  "semi": true,                // Semicolons at end of lines
  "singleQuote": true,         // 'string' instead of "string"
  "trailingComma": "all",      // Trailing commas in objects/arrays
  "printWidth": 100,           // Max line length
  "tabWidth": 2,               // Indentation size
  "useTabs": false,            // Use spaces, not tabs
  "arrowParens": "always",     // (x) => {} instead of x => {}
  "endOfLine": "lf"            // Unix line endings
}
```

### Commands

```bash
# Check if files are formatted
pnpm format:check

# Auto-format all files
pnpm format:write
```

---

## ESLint Configuration

**ESLint** enforces code quality, consistency, and best practices.

### Key Rules

| Rule | Enforces | Severity |
|------|----------|----------|
| `@typescript-eslint/no-unused-vars` | No unused variables (prefix with `_` to ignore) | Error |
| `@typescript-eslint/no-explicit-any` | Avoid `any` type | Warning |
| `camelcase` | Variables/properties in camelCase | Error |
| `@typescript-eslint/naming-convention` | PascalCase for types, UPPER_CASE for constants | Error |
| `prefer-const` | Use `const` instead of `let` when possible | Error |
| `no-var` | Use `let`/`const` instead of `var` | Error |
| `eqeqeq` | Use `===` instead of `==` | Error |
| `no-console` | No `console.log()` (only `console.warn/error` allowed) | Warning |
| `@typescript-eslint/no-floating-promises` | Await promises or handle errors | Error |

### Examples

❌ **Bad:**
```typescript
var userName = 'John';           // Use const/let, not var
let unused_var = 5;              // Not camelCase
let data: any = {foo: 'bar'};    // Avoid any type
console.log('debug');            // Use console.warn/error
if (x == 5) {}                   // Use === not ==
const p = fetchData();           // Unawaited promise
```

✅ **Good:**
```typescript
const userName = 'John';         // camelCase, const
const myData = { foo: 'bar' };   // Proper naming
interface MyData {               // PascalCase for types
  foo: string;
}
const myData: MyData = { foo: 'bar' }; // Typed, no any
console.warn('something odd');   // Use warn/error
if (x === 5) {}                  // Use ===
const data = await fetchData();  // Await promises
```

**Prefix unused variables with `_`:**
```typescript
// If a variable is intentionally unused:
const _unusedParam = args.old;   // Won't error
```

### Commands

```bash
# Check for linting issues
pnpm lint:check

# Auto-fix linting issues (where possible)
pnpm lint:fix
```

---

## Complete Workflow

### For Developers

1. **Write code** — Save file with `Ctrl+S` or `Cmd+S`
2. **Auto-fix** — Prettier formats, ESLint fixes (auto on save)
3. **Review** — Check any remaining ESLint warnings

If you need to manually fix issues:
```bash
pnpm lint:fix        # Auto-fix what can be fixed
pnpm format:write    # Ensure proper formatting
```

### Before Commit

Run these checks:
```bash
pnpm format:check    # Verify formatting
pnpm lint:check      # Check for issues
pnpm typecheck       # Type check
pnpm test            # Run tests
```

Or fix everything automatically:
```bash
pnpm format:write    # Format all files
pnpm lint:fix        # Fix ESLint issues
```

### In CI/CD Pipeline

```bash
pnpm format:check    # Fail if code isn't formatted
pnpm lint:check      # Fail if there are lint errors
pnpm typecheck       # Fail if types don't match
pnpm test            # Fail if tests don't pass
```

---

## Naming Conventions

### Variables & Functions
```typescript
const userName = 'John';           // camelCase
const MAX_RETRIES = 3;             // UPPER_CASE for constants
const _unusedVar = value;          // Prefix with _ if unused

function getUserById(id: number) {} // camelCase for functions
```

### Types & Classes
```typescript
interface UserData {}              // PascalCase
type ApiResponse = {};             // PascalCase
class UserService {}               // PascalCase
enum UserRole {}                   // PascalCase
```

### Files
```typescript
user.controller.ts                 // kebab-case for file names
user.service.ts                    // kebab-case
user.interface.ts                  // kebab-case
```

---

## Common Issues & Fixes

### "Unexpected var"
```typescript
// ❌ Bad
var name = 'John';

// ✅ Good
const name = 'John';
```

### "Unused variable"
```typescript
// ❌ Bad
const unused = getValue();

// ✅ Good (use it) or:
const _unused = getValue();        // Prefix with _
```

### "Not camelCase"
```typescript
// ❌ Bad
const UserName = 'John';           // PascalCase
const user_name = 'John';          // snake_case

// ✅ Good
const userName = 'John';           // camelCase
```

### "Any type"
```typescript
// ❌ Bad
const data: any = {};

// ✅ Good
const data: Record<string, unknown> = {};
// or
interface MyData {
  field: string;
}
const data: MyData = { field: 'value' };
```

### "Floating Promise"
```typescript
// ❌ Bad
sendEmail(user.email);             // Not awaited

// ✅ Good
await sendEmail(user.email);       // Awaited
// or
void sendEmail(user.email);        // Intentionally not awaited
```

---

## Disabling Rules (Use Sparingly)

### For a Single Line
```typescript
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const data: any = JSON.parse(raw);
```

### For a Block
```typescript
/* eslint-disable @typescript-eslint/no-explicit-any */
const data: any = {};
const other: any = {};
/* eslint-enable @typescript-eslint/no-explicit-any */
```

**Note:** Always explain why you're disabling a rule (in code comments).

---

## Resources

- [Prettier Docs](https://prettier.io)
- [ESLint Docs](https://eslint.org)
- [TypeScript ESLint](https://typescript-eslint.io)
- [Code Formatting Guide](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html)
