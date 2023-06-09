//Index of route middleware
const {
  publicKey,
  privateKey,
  encryptedData,
  decryptedData,
} = require("../utils/genRSA");
const { getUserDb, createUserDb, editUserDb } = require("../db/user.db");
const apiResponse = require("../utils/apiResponse");
const APIStatus = require("../constants/APIStatus");
const { waterMark, deWaterMark } = require("../utils/water.mark");
const route = (app) => {
  const fileNames = [
    "image_1.jpg",
    "image_2.jpg",
    "image_3.jpg",
    "image_4.jpg",
    "image_5.jpg",
    "image_6.jpg",
    "image_7.jpg",
    "image_8.jpg",
    "image_9.jpg",
  ];
  // Client nhập username và gửi cho server
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

      // Tạo text random và lưu vào db
      let listTextRandom = [];
      for (let i = 0; i <= 5; i++) {
        listTextRandom[i] = Math.random().toString(36).substring(2, 7);
      }
      await editUserDb({
        _id: user._id,
        listTextRandom: listTextRandom,
      });

      // RSA textrandom và gửi về cho client
      let listTextRandomRSA = [];
      for (let i = 0; i <= 5; i++) {
        listTextRandomRSA[i] = encryptedData(
          listTextRandom[i],
          publicKey
        ).toString("base64");
      }

      //await waterMark("image_1.jpg", "hello_world");
      // let stringRandom = await deWaterMark("image_1.jpg");
      // console.log(stringRandom);
      // Lấy 6 url và 6 text gửi về client
      return res.status(200).json(
        apiResponse({
          status: APIStatus.SUCCESS,
          msg: "Success",
          data: {
            listTextRandomRSA: listTextRandomRSA,
            listUrlImages: user.listUrlImages,
          },
        })
      );
    } catch (err) {
      console.log(err);
    }
  });

  // login
  app.post("/login", async (req, res, next) => {
    try {
      const { username, listTextRandomRSA } = req.body;
      const user = await getUserDb({ username });
      if (!user) {
        return res.status(404).json(
          apiResponse({
            status: APIStatus.FAIL,
            msg: "Username not found",
          })
        );
      }
      let listDecryptTextRandom = [];
      for (let i = 0; i < 6; i++) {
        listDecryptTextRandom.push(
          decryptedData(
            Buffer.from(listTextRandomRSA[i], "base64"),
            privateKey
          ).toString()
        );
      }
      let count = 0;
      let listTextRandom = user.listTextRandoms;
      console.log(listTextRandom);
      listTextRandom.forEach((i) => {
        listDecryptTextRandom.forEach((j) => {
          if (i == j) count++;
        });
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
    const { username, listUrlImage } = req.body;
    const [user1, user2] = await Promise.all([getUserDb({ username })]);
    if (user1 || user2) {
      return res.status(409).json(
        apiResponse({
          status: APIStatus.FAIL,
          msg: "Username existed",
        })
      );
    }

    let listTextRandom = [];
    for (let i = 0; i <= 5; i++) {
      listTextRandom[i] = Math.random().toString(36).substring(2, 7);
    }
    console.log(listUrlImage);
    const user = await createUserDb({
      username,
      listUrlImages: listUrlImage,
      listTextRandoms: listTextRandom,
    });
    if (!user)
      return res.status(400).json(
        apiResponse({
          status: APIStatus.ERROR,
          msg: "Can not create new user",
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
