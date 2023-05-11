const Jimp = require("jimp");

// Function to convert string to binary
function stringToBinary(str) {
  let result = "";
  for (let i = 0; i < str.length; i++) {
    result += str[i].charCodeAt(0).toString(2).padStart(8, "0");
  }
  return result;
}

// Function to convert binary to string
function binaryToString(binary) {
  let result = "";
  for (let i = 0; i < binary.length; i += 8) {
    result += String.fromCharCode(parseInt(binary.substr(i, 8), 2));
  }
  return result;
}

// Function to embed message in LSB of image pixels
function embedMessage(image, message) {
  // Convert message to binary
  const binaryMessage = stringToBinary(message);

  // Embed message in LSB of image pixels
  let binaryIndex = 0;
  for (let y = 0; y < image.bitmap.height; y++) {
    for (let x = 0; x < image.bitmap.width; x++) {
      let pixel = Jimp.intToRGBA(image.getPixelColor(x, y));
      let binaryPixel = [
        pixel.r.toString(2).padStart(8, "0"),
        pixel.g.toString(2).padStart(8, "0"),
        pixel.b.toString(2).padStart(8, "0"),
      ];
      for (let i = 0; i < 3; i++) {
        if (binaryIndex < binaryMessage.length) {
          binaryPixel[i] =
            binaryPixel[i].substring(0, 7) + binaryMessage[binaryIndex];
          binaryIndex++;
        } else {
          break;
        }
      }
      let newPixel = Jimp.rgbaToInt(
        parseInt(binaryPixel[0], 2),
        parseInt(binaryPixel[1], 2),
        parseInt(binaryPixel[2], 2),
        pixel.a
      );
      image.setPixelColor(newPixel, x, y);
    }
    if (binaryIndex >= binaryMessage.length) {
      break;
    }
  }
}

// Function to extract message from LSB of image pixels
function extractMessage(image) {
  // Extract message from LSB of image pixels
  let binaryMessage = "";
  for (let y = 0; y < image.bitmap.height; y++) {
    for (let x = 0; x < image.bitmap.width; x++) {
      let pixel = Jimp.intToRGBA(image.getPixelColor(x, y));
      let binaryPixel = [
        pixel.r.toString(2).padStart(8, "0"),
        pixel.g.toString(2).padStart(8, "0"),
        pixel.b.toString(2).padStart(8, "0"),
      ];
      for (let i = 0; i < 3; i++) {
        binaryMessage += binaryPixel[i][7];
      }
    }
  }
  // Convert binary message to string
  let stringRandom = binaryToString(binaryMessage);
  return stringRandom;
}

// Load image using Jimp
const waterMark = async (imageName, textRandom) => {
  await Jimp.read(`src/images/${imageName}`)
    .then((image) => {
      // Embed message in image
      embedMessage(image, textRandom);
      // Save modified image
      image.write(`src/images/public/${imageName}`);
    })
    .catch((err) => {
      console.error(err);
    });
};

// Extract message from image
const deWaterMark = async (imageName) => {
  const stringRandom = await Jimp.read(`src/images/public/${imageName}`)
    .then((image) => {
      const textRandom = extractMessage(image);
      return textRandom;
    })
    .catch((err) => {
      console.error(err);
    });
  return stringRandom;
};

module.exports = { waterMark, deWaterMark };
