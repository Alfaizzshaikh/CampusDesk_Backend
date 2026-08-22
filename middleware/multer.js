const multer = require("multer");

const path = require('path');

const storage = multer.memoryStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },

  



  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

// const fileFilter = (req, file, cb) => {
//     const allowedExtensions = /jpeg|jpg|png/;
//     const allowedMimeTypes = ['image/jpeg', 'image/png'];

//     // Check extension and mime type
//     const extName = allowedExtensions.test(path.extname(file.originalname).toLowerCase());
//     const mimeType = allowedMimeTypes.includes(file.mimetype);

//     if (extName && mimeType) {
//         return cb(null, true); 
//     } else {
//         return cb(new Error('Only .png, .jpg and .jpeg formats are allowed!')); 
//     }
// };

const upload = multer({
  storage,
});



module.exports = upload;