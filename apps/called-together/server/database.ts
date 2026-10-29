import "server-only";
import { AzureCliCredential, ManagedIdentityCredential } from "@azure/identity";
import sql from "mssql";

export class SqlConfigurationError extends Error {
  constructor() {
    super("SQL_SERVER and SQL_DATABASE must contain valid SQL settings.");
    this.name = "SqlConfigurationError";
  }
}

export function connectionConfig(
  env: Readonly<Record<string, string | undefined>> = process.env,
): sql.config {
  const server = env.SQL_SERVER?.trim();
  const database = env.SQL_DATABASE?.trim();
  if (
    !server ||
    !/^[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?$/i.test(server) ||
    !database ||
    database.length > 128 ||
    /[\x00-\x1f<>;]/.test(database)
  ) {
    throw new SqlConfigurationError();
  }
  // A direct credential avoids environment/client-secret fallback in Azure and
  // avoids accidentally trying managed identity on a developer's machine.
  const credential =
    env.WEBSITE_INSTANCE_ID || env.WEBSITE_SITE_NAME
      ? new ManagedIdentityCredential()
      : new AzureCliCredential({ processTimeoutInMs: 10000 });
  return {
    server,
    database,
    port: 1433,
    authentication: { type: "token-credential", options: { credential } },
    options: {
      encrypt: true,
      trustServerCertificate: false,
      cancelTimeout: 5000,
      appName: "Called Together",
    },
    connectionTimeout: 15000,
    requestTimeout: 10000,
    pool: {
      min: 0,
      max: 3,
      idleTimeoutMillis: 30000,
      acquireTimeoutMillis: 20000,
      createTimeoutMillis: 20000,
      destroyTimeoutMillis: 5000,
    },
  };
}

export function createDatabase() {
  let pending: Promise<sql.ConnectionPool> | undefined;
  return {
    async getPool(): Promise<sql.ConnectionPool> {
      if (!pending) {
        const pool = new sql.ConnectionPool(connectionConfig());
        const attempt = Promise.resolve()
          .then(() => pool.connect())
          .then(() => pool)
          .catch(async (error: unknown) => {
            if (pending === attempt) pending = undefined;
            await pool.close().catch(() => undefined);
            throw error;
          });
        pending = attempt;
        // Handle background pool errors without printing driver messages, which
        // can include connection details. A subsequent call creates a new pool.
        pool.on("error", () => {
          if (pending === attempt) pending = undefined;
          void pool.close().catch(() => undefined);
        });
      }
      return pending;
    },
    async close(): Promise<void> {
      const current = pending;
      pending = undefined;
      if (!current) return;
      const pool = await current.catch(() => undefined);
      if (pool) await pool.close();
    },
  };
}

// Reuse the pool across development module reloads. Creating this holder does
// not read SQL settings, instantiate credentials, or open a connection.
const state = globalThis as typeof globalThis & {
  calledTogetherDatabase?: ReturnType<typeof createDatabase>;
};
export const database = (state.calledTogetherDatabase ??= createDatabase());

export function sqlFailureMessage(error: unknown): string {
  if (error instanceof SqlConfigurationError)
    return "SQL verification failed: set valid SQL_SERVER and SQL_DATABASE settings.";
  const code =
    error && typeof error === "object" && "code" in error
      ? error.code
      : undefined;
  if (code === "ETIMEOUT")
    return "SQL verification failed: connection or query timed out.";
  if (code === "ELOGIN")
    return "SQL verification failed: check the selected identity and its database access.";
  if (code === "ESOCKET")
    return "SQL verification failed: check network, firewall, and TLS connectivity.";
  return "SQL verification failed: check identity, network/firewall, and database access.";
}
