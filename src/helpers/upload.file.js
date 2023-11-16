// const cloudinary = require("cloudinary");

// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// const uploads = (file, folder) => {
//   return new Promise((resolve) => {
//     cloudinary.UploadStream.upload(
//       file,
//       ((result) => {
//         resolve({
//           url: result.url,
//           id: result.public_id,
//         });
//       },
//       {
//         resource_type: "auto",
//         folder: folder,
//       })
//     );
//   });
// };

// module.exports = uploads;

// const cloudinary = require("cloudinary").v2;
// require("dotenv").config();
// const { CloudinaryStorage } = require("multer-storage-cloudinary");
// const multer = require("multer");
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });
// const storage = new CloudinaryStorage({
//   cloudinary,
//   allowedFormats: ["jpg", "png", "jpeg"],
//   params: {
//     folder: "shopDEV",
//   },
// });

// const uploadCloud = multer({ storage });

// module.exports = { uploadCloud, cloudinary };
