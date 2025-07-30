import {
    SQLiteSession,
    SQLitePreparedQuery,
    SQLiteExecuteMethod,
    SQLiteTransactionConfig, SQLiteTransaction
} from "drizzle-orm/sqlite-core/session";
import {ExecuteResult, Sqlite, Value} from "@capawesome-team/capacitor-sqlite";
import type {SQLiteAsyncDialect} from "drizzle-orm/sqlite-core/dialect";
import type {Logger} from "drizzle-orm/logger";
import {NoopLogger} from "drizzle-orm/logger";
import type {Query} from "drizzle-orm/sql";
import type {SelectedFieldsOrdered} from "drizzle-orm/sqlite-core";
import {TablesRelationalConfig} from "drizzle-orm/relations";
import {fillPlaceholders} from "drizzle-orm/sql/sql";

export class CapacitorSQLiteSession<
    TFullSchema extends Record<string, unknown>,
    TSchema extends TablesRelationalConfig
> extends SQLiteSession<'async', ExecuteResult, TFullSchema, TSchema> {
    constructor(
        private plugin: typeof Sqlite,
        private databaseId: string,
        dialect: SQLiteAsyncDialect,
        private logger: Logger = new NoopLogger()
    ) {
        super(dialect);
    }

    async transaction<T>(
        _transaction: (
            tx: SQLiteTransaction<'async', ExecuteResult, TFullSchema, TSchema>
        ) => Promise<T>,
        _config: SQLiteTransactionConfig = {}
    ): Promise<T> {
        throw new Error('Transactions are not supported in CapacitorSQLiteSession.');
    }

    prepareQuery(
        query: Query,
        fields: SelectedFieldsOrdered | undefined,
        executeMethod: SQLiteExecuteMethod,
        isResponseInArrayMode: boolean,
        customResultMapper?: (rows: unknown[][]) => unknown
    ): PreparedQuery {
        return new PreparedQuery(
            this.plugin,
            this.databaseId,
            query,
            this.logger,
            fields,
            executeMethod,
            isResponseInArrayMode,
            customResultMapper
        );
    }
}

class PreparedQuery extends SQLitePreparedQuery<
    { type: 'async'; run: ExecuteResult; execute: ExecuteResult; all: Record<string, Value>[]; get: Record<string, Value>[]; values: Value[][] }
> {
    constructor(
        private plugin: typeof Sqlite,
        private databaseId: string,
        protected query: Query,
        private logger: Logger,
        private fields: SelectedFieldsOrdered | undefined,
        executeMethod: SQLiteExecuteMethod,
        private isArrayMode: boolean,
        private customResultMapper?: (rows: unknown[][]) => unknown,
    ) {
        super('async', executeMethod, query, undefined, undefined);
    }

    async run(placeholderValues?: Record<string, unknown>): Promise<ExecuteResult> {
        const params = fillPlaceholders(this.query.params, placeholderValues ?? {});
        this.logger.logQuery(this.query.sql, params);
        const result = await this.plugin.execute({
            databaseId: this.databaseId,
            statement: this.query.sql,
            values: params as unknown as Value[],
        });
        return result;
    }

    async execute(placeholderValues?: Record<string, unknown>): Promise<ExecuteResult> {
        return this.run(placeholderValues);
    }

    async all(placeholderValues?: Record<string, unknown>): Promise<any[]> {
        const params = fillPlaceholders(this.query.params, placeholderValues ?? {});
        this.logger.logQuery(this.query.sql, params);
        const result = await this.plugin.query({
            databaseId: this.databaseId,
            statement: this.query.sql,
            values: params as unknown as Value[],
        });

        if (this.customResultMapper) {
            // @ts-ignore
            return this.customResultMapper(result.rows);
        }
        if (!this.fields) return result.rows;
        return result.rows;
    }

    async get(placeholderValues?: Record<string, unknown>): Promise<any> {
        const results = await this.all(placeholderValues);
        return results[0] ?? undefined;
    }

    async values(placeholderValues?: Record<string, unknown>): Promise<Value[][]> {
        const params = fillPlaceholders(this.query.params, placeholderValues ?? {});
        this.logger.logQuery(this.query.sql, params);
        const result = await this.plugin.query({
            databaseId: this.databaseId,
            statement: this.query.sql,
            values: params as unknown as Value[],
        });
        return result.rows;
    }

    isResponseInArrayMode(): boolean {
        return this.isArrayMode;
    }
}