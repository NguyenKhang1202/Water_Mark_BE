const Jimp = require("jimp");

// Function to convert string to binary
function stringToBinary(str) {
  let result = "";
  for (let i = 0; i < str.length; i++) {
    result += str[i].charCodeAt(0).toString(2).padStart(8, "0");
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
      //console.log("Original Pixel tại :", pixel);
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
      let modifiedPixel = Jimp.intToRGBA(image.getPixelColor(x, y));
    }

    if (binaryIndex >= binaryMessage.length) {
      break;
    }
  }
}

// Load image using Jimp
const waterMark = async (imageName, textRandom) => {
  try {
    const image = await Jimp.read(`src/images/${imageName}`);
    // Nhúng tin nhắn vào hình ảnh
    embedMessage(image, textRandom);
    // Lưu hình ảnh đã được thủy vân vào thư mục public
    await image.writeAsync(`src/images/public/${imageName}`);
  } catch (err) {
    console.error(err);
  }
};

module.exports = { waterMark };
