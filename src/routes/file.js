const apiResponse = require("../utils/apiResponse");
const APIStatus = require("../constants/APIStatus");
const { getUserDb, createUserDb } = require("../db/user.db");
const watermark = require("jimp-watermark");
const {
  publicKey,
  privateKey,
  encryptedData,
  decryptedData,
} = require("../utils/genRSA");
const sendFile = (app, options) => {
  app.get("/:username/:fileName", async function (req, res, next) {
    const username = req.params.username;
    const fileName = req.params.fileName;
    const user = await getUserDb({ username });

    // create hash RSA
    var textPass;
    if (
      fileName == "image_7.jpg" ||
      fileName == "image_8.jpg" ||
      fileName == "image_9.jpg"
    ) {
      textPass = encryptedData(
        Math.random().toString(36).substring(2, 7),
        publicKey
      ).toString("base64");
    } else {
      textPass = encryptedData(user.password, publicKey).toString("base64");
    }

    // embed
    await watermark.addTextWatermark(`./src/images/${fileName}`, {
      text: textPass,
      textSize: 1, //Should be between 1-8
      dstPath: `./src/images/public/${fileName}`,
    });

    // return file
    setTimeout(() => {
      return res.sendFile(fileName, options, function (err) {
        if (err) {
          next(err);
        } else {
          next();
        }
      });
    }, 10);
  });
};

module.exports = sendFile;
