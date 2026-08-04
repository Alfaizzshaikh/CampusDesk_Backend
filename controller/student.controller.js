const { compareSync } = require('bcrypt');
const { ConnectDb } = require('../db/config.js');
const bcrypt = require("bcrypt");


const jwt = require('jsonwebtoken');
const { connect } = require('../routes/index.route.js');




const register = async (req, res) => {
    const image = req.file ? req.file.filename : null;
    const {
        first_name,
        last_name, phoneNumber,
        email,
        Course,
        rollNumber,
        gender,
        address,
        dateOfBirth,
        role,
        department,
        subject,
        Password
    } = req.body;
    console.log(req.body);
    console.log(req.body.Password);
    console.log(typeof req.body.Password);

    const sql = ` INSERT INTO StudentDetails 
    (first_name,last_name,phoneNumber,email,Course,rollNumber,gender,address,dateOfBirth,image,role,department,subject,password)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)  
    `;

    const hashPass = await bcrypt.hash(Password, 10);

    ConnectDb.query(sql, [
        first_name,
        last_name,
        phoneNumber,
        email,
        Course,
        rollNumber,
        gender,
        address,
        dateOfBirth,
        image,
        role,
        department,
        subject,
        hashPass
    ], (err, result) => {
        console.log(result);
        if (err) {
            console.log(err);
            throw err
        };

        res.send({
            success: true,
            message: "Student ADDED"
        })

    })


}

// ALL STUDENT CONTROLLER

const getAllStudent = (req, res) => {
    const { search, course, role } = req.query;
    let sql = "SELECT * FROM StudentDetails WHERE 1=1";
    let values = [];

    if (role) {
        sql += " AND role = ?";
        values.push(role);
    }

    if (search) {
        sql += " AND (first_name LIKE ? OR last_name LIKE ?)";
        values.push(`%${search}%`, `%${search}%`);
    }

    if (course) {
        sql += " AND Course = ?";
        values.push(course);
    }

    console.log(sql);
    console.log(values);



    ConnectDb.query(sql, values, (error, result) => {
        if (error) {
            return res.status(500).send({
                success: false,
                message: "Internal Error"
            })
        }


        res.send({
            success: true,
            data: result
        })
    })

}


// STUDENT BY ID CONTROLLER



const studentById = (req, res) => {
    try {
        const id = req.params.id;
        const qry = 'SELECT * FROM StudentDetails WHERE id = ?'

        ConnectDb.query(qry, [id], (error, result) => {

            if (error) {
                console.log(error)
                return res.status(500).send({
                    success: false,
                    message: "Enternal Server Error"
                })
            }


            if (result.length === 0) {
                return res.status(404).send({
                    success: false,
                    message: "Not Found"
                })
            }

            return res.send({
                success: true,
                student: result[0]
            })
        })
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Something went wrong"
        });
    }
}


// EDIT STUDENT BY ID CONTROLLER

const editStudent = (req, res) => {
    console.log("dfgfg")
    try {
        const id = req.params.id;
        const {
            first_name,
            last_name,
            phoneNumber,
            email,
            Course,
            rollNumber,
            gender,
            address,
            dateOfBirth
        } = req.body;

        const sql = `UPDATE StudentDetails SET 
    first_name = ? ,
    last_name = ?,
    phoneNumber = ?,
    email = ?,
    Course = ?,
    rollNumber = ?,
    gender = ?,
    address = ?,
    dateOfBirth = ?

    WHERE id = ?
    `

        ConnectDb.query(sql, [
            first_name,
            last_name,
            phoneNumber,
            email,
            Course,
            rollNumber,
            gender,
            address,
            dateOfBirth,
            id
        ], (error, result) => {
            if (error) {
                return res.status(500).send({
                    success: false,
                    message: 'Intern server error'
                })
            }

            if (result.affectedRows === 0) {
                return res.status(404).send({
                    success: false,
                    message: "Student Not Found"
                })
            }
            return res.send({
                success: true,
                message: "Student Update Succesfully"
            })
        })
    } catch (error) {
        console.log(error);
    }

}

// DELETE STUDENT CONTROLLER

const deletStudent = (req, res) => {
    try {
        const id = req.params.id;
        let sql = `DELETE FROM StudentDetails WHERE id = ?`;
        ConnectDb.query(sql, [id], (err, result) => {
            if (err) {
                return res.status(500).send({
                    success: false,
                    message: "Internal server error"
                })
            }

            if (result.affectedRows === 0) {
                return res.status(404).send({
                    success: false,
                    message: "Student Not Found"
                });
            }

            return res.send({
                success: true,
                result,
                message: "Delete Successfully"
            })
        })
    } catch (error) {
        console.log("hitted")
        console.log(error);
    }
}


// LOGIN USER LOGIC

const UserLogin = (req, res) => {

    const { email, password } = req.body;
    console.log(req.body);


    const sql = `SELECT * FROM StudentDetails WHERE email = ?`

    ConnectDb.query(sql, [email], async (err, result) => {
        try {
            if (err) {
                console.log(err);
                return res.status(500).send({
                    success: false,
                    message: "Internal Server Erorr"
                })

            }

            if (result.length === 0) {
                return res.status(404).send({
                    success: false,
                    message: "Email not found"
                })
            }


            console.log(result);

            const user = result[0];
            const isMatch = await bcrypt.compare(password, user.password);

            if (!isMatch) {
                return res.status(401).send({
                    message: "Invalid Password",
                    success: false
                })
            }

            const token = jwt.sign(
                {
                    id: user.id,
                    role: user.role
                },
                process.env.JWT_SECRET,
                {
                    expiresIn: '7d'
                }
            )



            res.send({
                success: true,
                massage: "Login Succesfully",
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    first_name: user.first_name,
                    role: user.role
                }
            })

        } catch (error) {
            console.log(error);
            return res.status(500).send({
                success: false,
                message: "Internal Server Error"
            });
        }
    })

}


// STUDENT PROFILE ROUTE 

const getProfile = (req , res)=>{
    const studentID = req.user.id;
    console.log(studentID);

    const sql = `SELECT * FROM StudentDetails WHERE id = ?`

    ConnectDb.query(sql , [studentID] , (err, result)=>{
        if(err){
           return res.status(500).send({
                success:false,
                message:"Internal Server Error"
            })
            
        }
      return  res.send({
            success:true,
           data: result[0]
        })
    })
}


// teacher with id 

const teacherById = (req, res)=>{
    try {
        const id = req.params.id;
        const sql = `SELECt* FROM StudentDetails WHERE id = ?`

        ConnectDb.query(sql , [id], (err , result)=>{
            if(err){
                res.status(501).send({
                success:false,
                message:"Internal Server Error"
               });


            }
            return res.send({
             success:true,
             data:result[0],
             message:"Fetched"
            })
        })
    } catch (error) {
        console.log(error);
    }
}


// NOTICE POST ROUTE 

const notice = (req,res)=>{
    try {
        const {noticeTitle , noticeDiscription} = req.body;
        console.log(req.body);
        const sql = `INSERT INTO notice (title , description)
        VALUE (?,?)
        `;

        ConnectDb.query(sql , [
            noticeTitle,
            noticeDiscription
        ],(err,result)=>{
            if(err){
             return   res.status(500).send({
                    success:false,
                    message:"Enternal Server Error"
                })
            }

            return res.status(200).send({
                success:true,
                message:"Notice Add Done !"
            })

        })
    } catch (error) {
        
    }
}

// GET NOTICE ON STUDENT DASHBOARD

const getNotice = (req,res)=>{
    try {
        const sql = `SELECT * FROM notice`
        ConnectDb.query(sql , (error,result)=>{
            if(error){
                return res.status(500).send({
                    message:"Internal Server Error",
                    success:false
                })
            }

            return res.status(200).send({
                success:false,
                data:result,
                message:"Data get Success"
            })
        })
    } catch (error) {
        console.log(error);
    }
}

// FUNCTION MUST BE DO EXPORTS

exports.register = register;
exports.getAllStudent = getAllStudent;
exports.studentById = studentById;
exports.editStudent = editStudent;
exports.deletStudent = deletStudent;
exports.UserLogin = UserLogin;
exports.getProfile = getProfile;
exports.teacherById = teacherById;
exports.notice = notice;
exports.getNotice = getNotice;
