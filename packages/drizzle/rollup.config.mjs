export default {
  input: 'dist/esm/index.js',
  output: [
    {
      file: 'dist/plugin.js',
      format: 'iife',
      name: 'capacitorSqliteDrizzle',
      globals: {
        'drizzle-orm/sqlite-proxy': 'drizzleOrmSqliteProxy',
        '@capawesome-team/capacitor-sqlite': 'capacitorSqlite',
      },
      sourcemap: true,
      inlineDynamicImports: true,
    },
    {
      file: 'dist/plugin.cjs.js',
      format: 'cjs',
      sourcemap: true,
      inlineDynamicImports: true,
    },
  ],
  external: [
    'drizzle-orm',
    'drizzle-orm/sqlite-proxy',
    '@capawesome-team/capacitor-sqlite',
  ],
};
