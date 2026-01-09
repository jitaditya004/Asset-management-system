const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on("connect", () => {
  console.log("PostgreSQL pool connected");
});

pool.on("error", (err) => {
  console.error("PostgreSQL pool error (will retry automatically)", err);
  // ❌ DO NOT exit the process
});

module.exports = {
  pool,
  query: (text, params) => pool.query(text, params),
};
