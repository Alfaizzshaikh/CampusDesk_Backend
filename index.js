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





//API CALLING
app.use('/api',routerController)

app.use("/uploads", express.static(path.join(__dirname, "uploads")));



//PORT 
app.listen(1234,()=>{
    console.log("Server started at ", port , "With 0 No error");
})




