//Index of route middleware
const {
  publicKey,
  privateKey,
  encryptedData,
  decryptedData,
} = require("../utils/genRSA");
const { hashPassword } = require("../utils/hashPassword");
const { getUserDb, createUserDb } = require("../db/user.db");
const apiResponse = require("../utils/apiResponse");
const APIStatus = require("../constants/APIStatus");

const route = (app) => {
  // /
  app.post("/", async (req, res) => {
    try {
      const { username } = req.body;
      const user = await getUserDb({ username });
      if (!user) {
        return res.status(400).json(
          apiResponse({
            status: APIStatus.FAIL,
            msg: "Username is wrong",
          })
        );
      }
      let listEncrypt = [];
      for (let i = 0; i < 6; i++) {
        listEncrypt.push(
          encryptedData(user.password, publicKey).toString("base64")
        );
      }
      return res.status(200).json(
        apiResponse({
          status: APIStatus.SUCCESS,
          msg: "List of encrypt password",
          data: listEncrypt,
        })
      );
    } catch (err) {
      console.log(err);
    }
  });

  // login
  app.post("/login", async (req, res, next) => {
    try {
      const { username, password } = req.body;
      const user = await getUserDb({ username });
      const passwordDb = user.password;
      let listDecryptPassword = [];
      for (let i = 0; i < password.length; i++) {
        listDecryptPassword.push(
          decryptedData(
            Buffer.from(password[i], "base64"),
            privateKey
          ).toString()
        );
      }
      let count = 0;
      listDecryptPassword.forEach((i) => {
        if (i == passwordDb) {
          count++;
        }
      });
      if (count == 6)
        return res.status(200).json(
          apiResponse({
            status: APIStatus.SUCCESS,
            msg: "Login success",
          })
        );
      else
        return res.status(400).json(
          apiResponse({
            status: APIStatus.FAIL,
            msg: "Login fail!",
          })
        );
    } catch (err) {
      console.log(err);
      return res.status(err.statusCode || 500).json(
        apiResponse({
          status: APIStatus.FAIL,
          msg: "Internal Server error",
          data: err,
        })
      );
    }
  });

  // register
  app.post("/register", async (req, res, next) => {
    const { username, password, fullName } = req.body;
    const [user1, user2] = await Promise.all([getUserDb({ username })]);
    if (user1 || user2) {
      return res.status(409).json(
        apiResponse({
          status: APIStatus.FAIL,
          msg: "username existed",
        })
      );
    }

    const hashedPw = await hashPassword(password);
    const user = await createUserDb({
      username,
      password: hashedPw,
      fullName,
    });
    if (!user)
      return res.status(400).json(
        apiResponse({
          status: APIStatus.ERROR,
          msg: "can not create new user",
        })
      );

    return res
      .status(200)
      .json(
        apiResponse({ status: APIStatus.SUCCESS, msg: "Register success" })
      );
  });
};

module.exports = route;
