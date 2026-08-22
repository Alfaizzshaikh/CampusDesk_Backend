const express = require('express');
const router = express.Router(); // Create an instance of the router
const studentsController = require('../controller/student.controller.js');
const { auth } = require('../middleware/auth.js');
const upload = require('../middleware/multer.js');









// STUDENT PROFILE DATA / DASHBOARD DATA 
router.get('/student/profile' ,auth ,studentsController.getProfile)

// POST API FOR INSERT USER DATA 


console.log("register:", studentsController.register);

router.post("/student-data", upload.single("image"), studentsController.register)



// API FOR GET ALL STUDENT DATA 
router.get('/allstudent',studentsController.getAllStudent);

// SEARCH STUDENT API 



// API FOR FETCH WITHI ID DATA OF STUDENT 
router.get('/student/:id',studentsController.studentById);



//EDIT STUDENT DATA API 

router.patch('/editStudent/:id' , studentsController.editStudent);
router.patch('/editTeacher/:id' , studentsController.editTeacher);



// DELETE STUDENT DATA API

router.delete('/delete/:id' , studentsController.deletStudent);

// POST API FOR CHECK LOGIN DATA 

router.post('/login' , studentsController.UserLogin);


//  API FOR GET  TEACHER DATA WITH ID 

router.get('/teacher/:id' , studentsController.teacherById);



// TO GET ALL NOTICE

router.get('/student-notice' , studentsController.getNotice)

// USER ANALYTICS


router.get('/useranalytics'  , studentsController.UserAnalytics);

// ASSINGEMNT POST ROUTE 

router.post('/assigment' , studentsController.assingmentPost);


// POST API FOR NOTICE

router.post('/notice-student' ,upload.single('file'), studentsController.notice);

// FORGOT PASSWORD SYSYTEM

router.post('/forgot-password' , studentsController.checkEmail);

// file posting

router.post('/upload' ,studentsController.fileUpload);



router.patch('/reset-password/:token' ,studentsController.resetPassword);

module.exports = router;