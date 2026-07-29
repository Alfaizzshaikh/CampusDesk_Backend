const express = require('express');
const port = 1234;
const app = express();
const cors = require('cors');
const routerController = require('./routes/index.route.js');
require('./db/config.js');
require('./models/createStudentTable.js');
const path = require("path");





app.use(cors(
    {
        origin:'http://localhost:5173'
    }
));
app.use(express.json());

//DATA BASE CONNECTION


//API CALLING
app.use('/api',routerController)

app.use("/uploads", express.static(path.join(__dirname, "uploads")));



//PORT 
app.listen(1234,()=>{
    console.log("Server started at ", port , "With 0 No error");
})




