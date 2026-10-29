import { pathToFileURL } from "node:url";
import { database, sqlFailureMessage } from "../server/database.js";

export async function verifySql(connection = database): Promise<number> {
  let result = 0;
  try {
    const pool = await connection.getPool();
    const response = await pool
      .request()
      .query<{ ok: number }>("SELECT 1 AS ok");
    if (response.recordset.length !== 1 || response.recordset[0]?.ok !== 1)
      throw new Error("Unexpected verification result");
  } catch (error) {
    console.error(sqlFailureMessage(error));
    result = 1;
  } finally {
    try {
      await connection.close();
    } catch {
      console.error(
        "SQL verification failed: connection cleanup did not complete.",
      );
      result = 1;
    }
  }
  if (result === 0) console.log("SQL verification succeeded: ok=1.");
  return result;
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  process.exitCode = await verifySql();
}
