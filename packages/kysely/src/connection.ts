import type { SqlitePlugin, Value } from '@capawesome-team/capacitor-sqlite';
import type { CompiledQuery, DatabaseConnection, QueryResult } from 'kysely';
import { RawNode, SelectQueryNode } from 'kysely';

// Raw SQL has no query node, so detect statements that return rows by their keyword.
const RAW_ROW_RETURNING_STATEMENT =
  /^\s*(SELECT|WITH|PRAGMA|VALUES|EXPLAIN)\b|\bRETURNING\b/i;

export class CapacitorSqliteConnection implements DatabaseConnection {
  private readonly client: SqlitePlugin;
  private readonly databaseId: string;

  constructor(client: SqlitePlugin, databaseId: string) {
    this.client = client;
    this.databaseId = databaseId;
  }

  async executeQuery<R>(compiledQuery: CompiledQuery): Promise<QueryResult<R>> {
    const { sql, parameters } = compiledQuery;
    const values = parameters as Value[];

    if (this.returnsRows(compiledQuery)) {
      const result = await this.client.query({
        databaseId: this.databaseId,
        statement: sql,
        values,
      });
      return {
        rows: this.rowsToObjects(result.columns, result.rows) as R[],
      };
    }

    const result = await this.client.execute({
      databaseId: this.databaseId,
      statement: sql,
      values,
    });
    return {
      numAffectedRows:
        result.changes !== undefined ? BigInt(result.changes) : undefined,
      insertId: result.rowId !== undefined ? BigInt(result.rowId) : undefined,
      rows: [] as R[],
    };
  }

  /* eslint-disable @typescript-eslint/no-unused-vars */
  streamQuery<R>(
    _compiledQuery: CompiledQuery,
    _chunkSize?: number,
  ): AsyncIterableIterator<QueryResult<R>> {
    /* eslint-enable @typescript-eslint/no-unused-vars */
    throw new Error('Streaming is not supported.');
  }

  private returnsRows({ query, sql }: CompiledQuery): boolean {
    if (RawNode.is(query)) {
      return RAW_ROW_RETURNING_STATEMENT.test(sql);
    }
    return (
      SelectQueryNode.is(query) ||
      ('returning' in query && query.returning !== undefined)
    );
  }

  private rowsToObjects(
    columns: string[],
    rows: Value[][],
  ): Record<string, Value>[] {
    return rows.map(row => {
      const obj: Record<string, Value> = {};
      for (let i = 0; i < columns.length; i++) {
        obj[columns[i]] = row[i];
      }
      return obj;
    });
  }
}
