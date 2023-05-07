const port = process.env.PORT || 4000;
const database_url =
  process.env.DATABASE_URL || "mongodb://localhost:27017/water_mark";
// mongodb+srv://dbUser:FIpHnXixX7rcja2U@cluster0.ajon7.mongodb.net/water_mark
// mongodb://localhost:27017/water_mark

module.exports = {
  port,
  database_url,
};
