const multer = require("multer");
const path = require("path");
const mkdirp = require("mkdirp");


const fileDestination = (file) => {
  const mime = file.mimetype;

  if (mime.startsWith("image/")) return "uploads/images";
  if (mime === "application/pdf") return "uploads/documents";
  if (mime.startsWith("video/")) return "uploads/videos";

  return "uploads/others";
};

const storage = multer.diskStorage({
  destination: async function (req, file, cb) {
    const folder = fileDestination(file);

    mkdirp(folder); // ensure folder exists

    cb(null, folder);
  },

  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  },
});


const upload = multer({
  storage,
  limits: {
    fileSize: 1024 * 1024 * 50, // 50MB
  },
  // no fileFilter here — validate in route
});




// const fileCheck = async (req, res, next) => {
//   try {
//     const files = req.files; // Multer array

//     // Must be an array and must not be empty
//     if (!files || !Array.isArray(files) || files.length === 0) {
//       return res.status(400).send("No files uploaded");
//     }

//     for (const file of files) {
//       if (!file.buffer) {
//         return res.status(400).send("File buffer missing");
//       }

//       const type = await fileTypeFromBuffer(file.buffer);

//       if (!type || !allowedMimeTypes.includes(type.mime)) {
//         return res
//           .status(400)
//           .send("Invalid file type: " + (type?.mime || "unknown"));
//       }
//     }

//     // All files valid → continue
//     next();
//   } catch (err) {
//     next(err);
//   }
// };

module.exports = { upload };