import type { SqlitePlugin } from '@capawesome-team/capacitor-sqlite';
import type { DatabaseConnection, Driver, TransactionSettings } from 'kysely';

import { CapacitorSqliteConnection } from './connection';

export class CapacitorSqliteDriver implements Driver {
  private readonly client: SqlitePlugin;
  private readonly databaseId: string;

  constructor(client: SqlitePlugin, databaseId: string) {
    this.client = client;
    this.databaseId = databaseId;
  }

  async init(): Promise<void> {
    // No-op: the database is already opened by the user via Sqlite.open().
  }

  async acquireConnection(): Promise<DatabaseConnection> {
    return new CapacitorSqliteConnection(this.client, this.databaseId);
  }

  /* eslint-disable @typescript-eslint/no-unused-vars */
  async beginTransaction(
    _connection: DatabaseConnection,
    _settings: TransactionSettings,
  ): Promise<void> {
    /* eslint-enable @typescript-eslint/no-unused-vars */
    await this.client.beginTransaction({ databaseId: this.databaseId });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async commitTransaction(_connection: DatabaseConnection): Promise<void> {
    await this.client.commitTransaction({ databaseId: this.databaseId });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async rollbackTransaction(_connection: DatabaseConnection): Promise<void> {
    await this.client.rollbackTransaction({ databaseId: this.databaseId });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async releaseConnection(_connection: DatabaseConnection): Promise<void> {
    // No-op: connections are lightweight wrappers, no pooling needed.
  }

  async destroy(): Promise<void> {
    // No-op: the user manages the database lifecycle via Sqlite.close().
  }
}
