const express = require('express');
const router = express.Router(); // Create an instance of the router
const studentsController = require('../controller/student.controller.js');
const { auth } = require('../middleware/auth.js');
const upload = require('../middleware/multer.js');




// POST API FOR INSERT USER DATA 

console.log("register:", studentsController.register);
console.log("auth:", auth);
router.post("/student-data",
    auth,
    upload.single("image"),
    studentsController.register)



// API FOR GET ALL STUDENT DATA 
router.get('/allstudent',studentsController.getAllStudent);

// SEARCH STUDENT API 



// API FOR FETCH WITHI ID DATA OF STUDENT 
router.get('/student/:id',studentsController.studentById);



//EDIT STUDENT DATA API 

router.patch('/editStudent/:id' , studentsController.editStudent);


// DELETE STUDENT DATA API

router.delete('/delete/:id' , studentsController.deletStudent);




module.exports = router;