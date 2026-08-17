const { compareSync } = require('bcrypt');
const { ConnectDb } = require('../db/config.js');
const bcrypt = require("bcrypt");

const cloudinary = require('../config/cloudinary.js')
const jwt = require('jsonwebtoken');
const { connect } = require('../routes/index.route.js');

const streamifier = require("streamifier");
const generateOTP = require('../utils/OtpGen.js');
const transporter = require('../config/mailer.js');




const register = async (req, res) => {
    console.log(req.file, "abcd");

    const {
        first_name,
        last_name,
        phoneNumber,
        email,
        Course,
        rollNumber,
        gender,
        address,
        dateOfBirth,
        role,
        department,
        subject,
        Password,
        qualification
    } = req.body;

    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: "Image is required"
        });
    }

    try {
        const hashPass = await bcrypt.hash(Password, 10);

        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: "Profile Pictures",
                resource_type: "image"
            },
            (error, result) => {
                if (error) {
                    console.log(error);

                    return res.status(500).json({
                        success: false,
                        message: "Image upload failed"
                    });
                }

                const imageUrl = result.secure_url;

                console.log("Image URL:", imageUrl);

                const sql = `
                    INSERT INTO StudentDetails
                    (
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
                        password,
                        qualification
                    )
                    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
                `;

                ConnectDb.query(
                    sql,
                    [
                        first_name,
                        last_name,
                        phoneNumber,
                        email,
                        Course,
                        rollNumber,
                        gender,
                        address,
                        dateOfBirth,
                        result.secure_url,
                        role,
                        department,
                        subject,
                        hashPass,
                        qualification
                    ],
                    (err, result) => {
                        if (err) {
                            console.log(err);

                            return res.status(500).json({
                                success: false,
                                message: "Database error"
                            });
                        }

                        return res.status(200).json({
                            success: true,
                            message: "USER ADDED"
                        });
                    }
                );
            }
        );

        streamifier
            .createReadStream(req.file.buffer)
            .pipe(uploadStream);

    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

// ALL STUDENT CONTROLLER

const getAllStudent = (req, res) => {
    const { search, course, role } = req.query;
    let sql = "SELECT * FROM StudentDetails WHERE 1=1";
    let values = [];
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 3;
    const skip = (page - 1) * limit;

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

    sql += " LIMIT ? OFFSET ?"
    values.push(limit, skip);


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
            data: result,
            page,
            limit
        })
    })

}


// STUDENT BY ID CONTROLLER



const studentById = (req, res) => {
    try {
        const id = req.params.id;
        const qry = `
            SELECT 
                id,
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
                qualification
            FROM StudentDetails
            WHERE id = ?
        `;

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

const getProfile = (req, res) => {
    const studentID = req.user.id;
    console.log(studentID);

    const sql = `SELECT * FROM StudentDetails WHERE id = ?`

    ConnectDb.query(sql, [studentID], (err, result) => {
        if (err) {
            return res.status(500).send({
                success: false,
                message: "Internal Server Error"
            })

        }
        return res.send({
            success: true,
            data: result[0]
        })
    })
}


// teacher with id 

const teacherById = (req, res) => {
    try {
        const id = req.params.id;
        const sql = `SELECt* FROM StudentDetails WHERE id = ?`

        ConnectDb.query(sql, [id], (err, result) => {
            if (err) {
                res.status(501).send({
                    success: false,
                    message: "Internal Server Error"
                });


            }
            return res.send({
                success: true,
                data: result[0],
                message: "Fetched"
            })
        })
    } catch (error) {
        console.log(error);
    }
}


// NOTICE POST ROUTE 

const notice = (req, res) => {
    try {
        // console.log("fghjk", req.body);

        const { noticeTitle, noticeDiscription } = req.body;

        console.log(req.file);
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No file uploaded",
            });
        }

        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: "public-notice",
                resource_type: "auto",
            },
            (error, result) => {
                console.log(result);
                if (error) {
                    console.log(error, "aaaa")
                    return res.status(500).json({
                        success: false,
                        error,
                    });
                }

                const sql = `INSERT INTO notice (title , description , document)
        VALUES (?,?,?)
        `;

                ConnectDb.query(sql, [
                    noticeTitle,
                    noticeDiscription,
                    result.secure_url
                ], (err, result) => {
                    if (err) {
                        return res.status(500).send({
                            success: false,
                            message: "Enternal Server Error"
                        })
                    }

                    return res.status(200).send({
                        success: true,
                        message: "Notice Add Done !",
                        data: result
                    })

                });
            }
        );



        streamifier.createReadStream(req.file.buffer).pipe(uploadStream);



    } catch (error) {
        console.log(error);
    }
}

// GET NOTICE ON STUDENT DASHBOARD

const getNotice = (req, res) => {
    try {

        const sql = `SELECT * FROM notice ORDER BY id DESC`
        ConnectDb.query(sql, (error, result) => {
            if (error) {
                return res.status(500).send({
                    message: "Internal Server Error",
                    success: false
                })
            }

            return res.status(200).send({
                success: true,
                data: result,
                message: "Data get Success"
            })
        })
    } catch (error) {
        console.log(error);
    }
}


const UserAnalytics = (req, res) => {
    try {
        const sql = `SELECT 
        COUNT(CASE WHEN role = 'Student' THEN 1 END) AS studentCount,
        COUNT(CASE WHEN role = 'Teacher' THEN 1 END) AS teacherCount 
        FROM StudentDetails
                     `;

        ConnectDb.query(sql, (err, result) => {
            if (err) {
                return res.status(501).json({
                    success: false,
                    message: "Internal Server Error"
                });
            }
            return res.status(200).send({
                success: true,
                data: result[0],
                message: "success"
            })
        })
    } catch (error) {
        console.log(error);
    }
}




// ASSINGMENT CONTORLLER 

const assingmentPost = (req, res) => {
    try {
        const { assDisc, assTitle } = req.body;
        console.log(req.body);

        const sql = `INSERT INTO homework
        (homework_title , homework_description)
        values(?,?)`

        ConnectDb.query(sql, [
            assDisc,
            assTitle
        ], (err, result) => {
            if (err) {
                return res.status(500).send({
                    success: false,
                    message: "Data not post"
                })
            }

            return res.status(200).send({
                success: true,
                message: "data posted !"
            })


        })
    } catch (error) {
        console.log(error)
    }
}


// file upload 

const fileUpload = async (req, res) => {
    try {

    } catch (err) {
        console.log(err, "ghjkil")
        res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};



const checkEmail = (req , res)=>{
    
    const { email } = req.body;
    const sql = `SELECT * from StudentDetails WHERE email = ?`

    ConnectDb.query(sql ,[email],async (err , result)=>{
        if(err){
          return  console.log(err);

        }
        if(result.length == 0){
          return  res.status(404).json({
                success:false,
                Message:"User Not found 404"
            })
        }

        // otp generate 
        try {
            const otp = generateOTP();
            console.log(otp , "Generated OTP");
             
            await transporter.sendMail({
                from: process.env.app_name,
                to:email,
                subject: "Otp for reset password",
                text: `Your OTP is ${otp}. It is valid for 10 minutes.`,
            })

            return res.status(200).json({
                success:true,
                message:"Otp send Successfully !"
            })
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                success:false,
                message:"Otp not send from cath",
                error: error.message
            })
        }
    })
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
exports.UserAnalytics = UserAnalytics;
exports.assingmentPost = assingmentPost;
exports.fileUpload = fileUpload;
exports.checkEmail = checkEmail;
