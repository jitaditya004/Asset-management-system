const { Pool } = require("pg");
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
pool.on("error", (err) => {
  console.error("Unexpected PG client error:", err);
  // Optional: you can decide whether to process.exit(1) or just log
  // process.exit(1);
});
module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
