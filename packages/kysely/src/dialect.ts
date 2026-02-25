import type { SqlitePlugin } from '@capawesome-team/capacitor-sqlite';
import type {
  DatabaseIntrospector,
  Dialect,
  DialectAdapter,
  Driver,
  Kysely,
  QueryCompiler,
} from 'kysely';
import { SqliteAdapter, SqliteIntrospector, SqliteQueryCompiler } from 'kysely';

import { CapacitorSqliteDriver } from './driver';

/**
 * Configuration for the {@link CapacitorSqliteDialect}.
 */
export interface CapacitorSqliteDialectConfig {
  /**
   * The unique identifier for the database returned by `Sqlite.open()`.
   */
  databaseId: string;
}

/**
 * A Kysely dialect for `@capawesome-team/capacitor-sqlite`.
 *
 * @example
 * ```typescript
 * import { Sqlite } from '@capawesome-team/capacitor-sqlite';
 * import { Kysely } from 'kysely';
 * import { CapacitorSqliteDialect } from '@capawesome/capacitor-sqlite-kysely';
 *
 * const { databaseId } = await Sqlite.open({ path: 'my.db' });
 * const db = new Kysely<DB>({
 *   dialect: new CapacitorSqliteDialect(Sqlite, { databaseId }),
 * });
 * ```
 */
export class CapacitorSqliteDialect implements Dialect {
  private readonly client: SqlitePlugin;
  private readonly config: CapacitorSqliteDialectConfig;

  constructor(client: SqlitePlugin, config: CapacitorSqliteDialectConfig) {
    this.client = client;
    this.config = config;
  }

  createAdapter(): DialectAdapter {
    return new SqliteAdapter();
  }

  createDriver(): Driver {
    return new CapacitorSqliteDriver(this.client, this.config.databaseId);
  }

  createIntrospector(db: Kysely<any>): DatabaseIntrospector {
    return new SqliteIntrospector(db);
  }

  createQueryCompiler(): QueryCompiler {
    return new SqliteQueryCompiler();
  }
}
