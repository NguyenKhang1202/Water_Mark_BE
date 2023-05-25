if (process.env.NODE_ENV !== "production") {
  require("dotenv").config(require("./config/dotenv"));
}
const path = require("path");
const express = require("express");
const apiResponse = require("./utils/apiResponse");
const APIStatus = require("./constants/APIStatus");
const db = require("./db/mongoose");
const cors = require("cors");
const { port } = require("./config");
const route = require("./routes/index");
const sendFile = require("./routes/file.js");
const app = express();
const options = {
  root: path.join(__dirname, "/images/public"),
};

app.use("/static", express.static(path.join(__dirname, "images/public")));

// Parse body req to json
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Connect to mongodb database
db.connect();

// Enable cors
app.use(cors());

// Route middleware
route(app);

//sendFile(app, options);

// Handle exception
app.use((err, req, res, next) => {
  if (err) {
    return res.status(err.statusCode || 500).json(
      apiResponse({
        status: APIStatus.FAIL,
        msg: "validation failed",
        data: err,
      })
    );
  }

  console.log(err);
  return res
    .status(500)
    .json(
      apiResponse({ status: APIStatus.ERROR, msg: "Internal Server error" })
    );
});

//Start an express server
app.listen(port, () => console.log(`Server Started http://localhost:${port}`));
