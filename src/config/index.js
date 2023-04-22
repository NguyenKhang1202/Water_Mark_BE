const port = process.env.PORT || 4000;
const database_url =
  process.env.DATABASE_URL || "mongodb://localhost:27017/water_mark";

module.exports = {
  port,
  database_url,
};
