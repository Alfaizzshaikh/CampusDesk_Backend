const express = require('express');
const router = express.Router(); // Create an instance of the router
const studentsController = require('../controller/student.controller.js');
const { auth } = require('../middleware/auth.js');
const upload = require('../middleware/multer.js');






// STUDENT PROFILE DATA / DASHBOARD DATA 
router.get('/student/profile' ,auth ,studentsController.getProfile)

// POST API FOR INSERT USER DATA 


console.log("register:", studentsController.register);

router.post("/student-data",
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

// POST API FOR CHECK LOGIN DATA 

router.post('/login' , studentsController.UserLogin);


//  API FOR GET  TEACHER DATA WITH ID 

router.get('/teacher/:id' , studentsController.teacherById);


// POST API FOR NOTICE

router.post('/notice-student' , studentsController.notice)

// TO GET ALL NOTICE

router.get('/student-notice' , studentsController.getNotice)


module.exports = router;