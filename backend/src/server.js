require("dotenv").config();

const db = require("./config/db");
const app = require("./app");

const PORT = process.env.PORT;

db.pool
  .connect()
  .then(() => {
    console.log("Connected to PostgreSQL");
    app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
  })
  .catch((err) => {
    console.error("Failed to connect to DB:", err);
    process.exit(1);
  });