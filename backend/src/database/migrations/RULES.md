# Migration File Naming Rules

Every migration file in this folder **must** follow the naming convention below. This keeps
migrations sortable by time and guarantees they run in the exact order they were created.

## File name format

```
<TIMESTAMP>-<some-name>.ts
```

The `<TIMESTAMP>` is a **15-digit, UTC-based** value built by concatenating these parts, in
this order, each zero-padded to a fixed width:

| Part         | Width | Source (UTC, timezone offset `0`) | Example |
|--------------|-------|-----------------------------------|---------|
| Year         | 2     | last two digits of the year       | `26`    |
| Month        | 2     | month (`01`–`12`, June = `06`)    | `06`    |
| Day          | 2     | day of month (`01`–`31`)          | `24`    |
| Hour         | 2     | hour, 24-hour clock (`00`–`23`)   | `17`    |
| Minute       | 2     | minute (`00`–`59`)                | `55`    |
| Second       | 2     | second (`00`–`59`)                | `03`    |
| Millisecond  | 3     | millisecond (`000`–`999`)         | `249`   |

> ⏱️ **Always use UTC (timezone offset 0)** — never local time. This avoids collisions and
> ordering bugs across contributors in different timezones.

### Worked example

For `2026-06-24 17:55:03.249` **UTC**:

```
26 + 06 + 24 + 17 + 55 + 03 + 249  ->  260624175503249
```

Resulting file name:

```
260624175503249-add-shipment-table.ts
```

## Class name

The exported class name must be the **PascalCase** descriptive name **followed by the same
timestamp** (TypeORM resolves the migration order from this numeric suffix):

```ts
export class AddShipmentTable260624175503249 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> { /* ... */ }
  public async down(queryRunner: QueryRunner): Promise<void> { /* ... */ }
}
```

## Generate the timestamp

Run this from anywhere to print the current UTC timestamp:

```bash
node -e "const d=new Date(),p=(n,l=2)=>String(n).padStart(l,'0');console.log(`${p(d.getUTCFullYear()%100)}${p(d.getUTCMonth()+1)}${p(d.getUTCDate())}${p(d.getUTCHours())}${p(d.getUTCMinutes())}${p(d.getUTCSeconds())}${p(d.getUTCMilliseconds(),3)}`)"
```

Then name the file `<output>-<some-name>.ts` and the class `<SomeName><output>`.

## Other rules

- **One migration per schema change**; use a short, descriptive `<some-name>` (kebab-case),
  e.g. `add-shipment-table`, `add-user-phone-column`.
- **Never edit a migration that has already been applied** to a shared/production DB — create a
  new one with a newer timestamp instead.
- Every `up()` must have a correct, reversible `down()`.
- Use the QueryRunner API (`createTable`, `createForeignKey`, …), not raw SQL, to stay DB-portable.

See [`1715000000000-CreateUsersRolesPermissions.ts`](./1715000000000-CreateUsersRolesPermissions.ts)
for the established `up`/`down` pattern (tables → indices → foreign keys, reversed in `down`).
