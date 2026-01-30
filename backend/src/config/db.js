const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production"
    ? { rejectUnauthorized: false }
    : false,
  max: 5,
idleTimeoutMillis: 30000,
connectionTimeoutMillis: 10000,

  
});

pool.on("connect", () => {
  console.log("PostgreSQL pool connected");
});

pool.on("error", (err) => {
  console.error("PostgreSQL pool error (will retry automatically)", err.message);
});

module.exports = {
  pool,
  query: (text, params) => pool.query(text, params),
};
