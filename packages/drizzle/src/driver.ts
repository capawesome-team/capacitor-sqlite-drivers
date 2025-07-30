import type { Sqlite } from '@capawesome-team/capacitor-sqlite';
import { BaseSQLiteDatabase } from 'drizzle-orm/sqlite-core/db';
import { SQLiteAsyncDialect } from 'drizzle-orm/sqlite-core/dialect';
import type { DrizzleConfig } from 'drizzle-orm/utils';
import type {
    TablesRelationalConfig,
    RelationalSchemaConfig,
    ExtractTablesWithRelations,
} from 'drizzle-orm/relations';
import {
    createTableRelationsHelpers,
    extractTablesRelationalConfig,
} from 'drizzle-orm/relations';
import { CapacitorSQLiteSession } from './session';
import { DefaultLogger } from 'drizzle-orm/logger';
import { entityKind } from 'drizzle-orm/entity';

export interface CapacitorSQLiteDrizzleConfig<
    TSchema extends Record<string, unknown> = Record<string, never>
> extends DrizzleConfig<TSchema> {
    plugin: typeof Sqlite;
    databaseId: string;
}

export class CapacitorSQLiteDatabase<
    TSchema extends Record<string, unknown> = Record<string, never>
> extends BaseSQLiteDatabase<'async', unknown, TSchema> {
    static readonly [entityKind] = 'CapacitorSQLiteDatabase';
}

export function drizzle<
    TSchema extends Record<string, unknown> = Record<string, never>
>(
    config: CapacitorSQLiteDrizzleConfig<TSchema>
): CapacitorSQLiteDatabase<TSchema> {
    const { plugin, databaseId, schema, logger: userLogger, casing } = config;

    const dialect = new SQLiteAsyncDialect({ casing });

    const logger =
        userLogger === true
            ? new DefaultLogger()
            : userLogger === false
                ? undefined
                : userLogger;

    let relationalSchema: RelationalSchemaConfig<ExtractTablesWithRelations<TSchema>> | undefined;

    if (schema) {
        const tablesConfig = extractTablesRelationalConfig<ExtractTablesWithRelations<TSchema>>(
            schema,
            createTableRelationsHelpers
        );

        relationalSchema = {
            fullSchema: schema,
            schema: tablesConfig.tables,
            tableNamesMap: tablesConfig.tableNamesMap,
        };
    }

    const session = new CapacitorSQLiteSession<TSchema, ExtractTablesWithRelations<TSchema>>(
        plugin,
        databaseId,
        dialect,
        logger
    );

    return new CapacitorSQLiteDatabase<TSchema>(
        'async',
        dialect,
        session,
        relationalSchema
    );
}
