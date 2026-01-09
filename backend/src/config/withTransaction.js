const db = require("./db");

module.exports = async function withTransaction(fn) {
  const client = await db.pool.connect();

  client.on("error", (err) => {
    console.error("PG client error (auto-handled):", err);
  });

  try {
    await client.query("BEGIN");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};
