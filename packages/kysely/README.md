# @capawesome/capacitor-sqlite-kysely

Kysely dialect for [`@capawesome-team/capacitor-sqlite`](https://capawesome.io/plugins/sqlite/).

> [!WARNING]
> This package is in early development and may have breaking changes. Feedback and contributions are welcome!

<div class="capawesome-z29o10a">
  <a href="https://cloud.capawesome.io/" target="_blank">
    <img alt="Deliver Live Updates to your Capacitor app with Capawesome Cloud" src="https://cloud.capawesome.io/assets/banners/cloud-build-and-deploy-capacitor-apps.png?t=1" />
  </a>
</div>

## Installation

```bash
npm install @capawesome/capacitor-sqlite-kysely kysely@^0.28.0
```

## Usage

### Setup

```typescript
import { Sqlite } from '@capawesome-team/capacitor-sqlite';
import { Kysely } from 'kysely';
import { CapacitorSqliteDialect } from '@capawesome/capacitor-sqlite-kysely';

const { databaseId } = await Sqlite.open({ path: 'my.db' });
const db = new Kysely<DB>({
  dialect: new CapacitorSqliteDialect(Sqlite, { databaseId }),
});
```

### Define Your Database Types

Create a type definition for your database schema:

```typescript
import { Generated } from 'kysely';

interface Database {
  users: UsersTable;
  posts: PostsTable;
}

interface UsersTable {
  id: Generated<number>;
  name: string;
  email: string;
}

interface PostsTable {
  id: Generated<number>;
  title: string;
  content: string | null;
  author_id: number;
}
```

### Queries

```typescript
// Insert
await db.insertInto('users').values({ name: 'Alice', email: 'alice@example.com' }).execute();

// Select all
const allUsers = await db.selectFrom('users').selectAll().execute();

// Select with filter
const user = await db
  .selectFrom('users')
  .selectAll()
  .where('email', '=', 'alice@example.com')
  .executeTakeFirst();

// Update
await db.updateTable('users').set({ name: 'Bob' }).where('id', '=', 1).execute();

// Delete
await db.deleteFrom('users').where('id', '=', 1).execute();
```

### Transactions

Kysely manages `BEGIN`, `COMMIT`, and `ROLLBACK` automatically:

```typescript
await db.transaction().execute(async (trx) => {
  await trx.insertInto('users').values({ name: 'Alice', email: 'alice@example.com' }).execute();
  await trx.insertInto('posts').values({ title: 'Hello', content: 'World', author_id: 1 }).execute();
});
```

### Migrations

Kysely has a built-in [migration system](https://kysely.dev/docs/migrations). Since `CapacitorSqliteDialect` implements the standard `Dialect` interface, you can use Kysely's `Migrator` directly:

```typescript
import { Kysely, Migrator, Migration, MigrationProvider } from 'kysely';

const migrationProvider: MigrationProvider = {
  async getMigrations() {
    return {
      '001_create_users': {
        async up(db: Kysely<any>) {
          await db.schema
            .createTable('users')
            .addColumn('id', 'integer', (col) => col.primaryKey().autoIncrement())
            .addColumn('name', 'text', (col) => col.notNull())
            .addColumn('email', 'text', (col) => col.notNull().unique())
            .execute();
        },
      },
    };
  },
};

const migrator = new Migrator({ db, provider: migrationProvider });
await migrator.migrateToLatest();
```

## API

### `CapacitorSqliteDialect`

A Kysely `Dialect` implementation for `@capawesome-team/capacitor-sqlite`.

```typescript
new CapacitorSqliteDialect(client, config);
```

| Param    | Type                           | Description                                           |
| -------- | ------------------------------ | ----------------------------------------------------- |
| `client` | `SqlitePlugin`                 | The Capacitor SQLite plugin instance (e.g. `Sqlite`). |
| `config` | `CapacitorSqliteDialectConfig` | Configuration object. Must include `databaseId`.      |

### `CapacitorSqliteDialectConfig`

| Property     | Type     | Description                                          |
| ------------ | -------- | ---------------------------------------------------- |
| `databaseId` | `string` | The database identifier returned by `Sqlite.open()`. |
