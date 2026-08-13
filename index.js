const express = require('express');
const port = 1234;
const app = express();
const cors = require('cors');
const routerController = require('./routes/index.route.js');
require('./db/config.js');
require('./models/createStudentTable.js');
require('./models/createNoticeTable.js');
require('./models/createHomeworkTable.js');
const cloudinary = require('cloudinary').v2;

const streamifier = require("streamifier");

const multer =require('multer');



const path = require("path");
require("dotenv").config();



app.use(cors(
    {
        origin:'http://localhost:5173'
    }
));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//DATA BASE CONNECTION

// cloudinary.config({
//     cloud_name:process.env.cloud_name,
//     api_key:process.env.api_key,
//     api_secret:process.env.api_secret
// });


// const storage = multer.memoryStorage();

// const parser = multer({
//   storage: storage,
// });

// // TEMPORARY FILE POSTING 

// app.post("/upload", parser.single("file"), async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({
//         success: false,
//         message: "No file uploaded",
//       });
//     }

//     const uploadStream = cloudinary.uploader.upload_stream(
//       {
//         folder: "Notice-files",
//       },
//       (error, result) => {
//         if (error) {
//           return res.status(500).json({
//             success: false,
//             error,
//           });
//         }

//         return res.status(200).json({
//           success: true,
//           data: result,
//         });
//       }
//     );

//     streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
//   } catch (err) {
//     res.status(500).json({
//       success: false,
//       message: err.message,
//     });
//   }
// });



//API CALLING
app.use('/api',routerController)

app.use("/uploads", express.static(path.join(__dirname, "uploads")));



//PORT 
app.listen(1234,()=>{
    console.log("Server started at ", port , "With 0 No error");
})




