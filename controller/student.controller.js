const { compareSync } = require('bcrypt');
const { ConnectDb } = require('../db/config.js');
const crypto = require("crypto");
const bcrypt = require("bcrypt");

const cloudinary = require('../config/cloudinary.js')
const jwt = require('jsonwebtoken');
const { connect } = require('../routes/index.route.js');

const streamifier = require("streamifier");
// const generateOTP = require('../utils/OtpGen.js');
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
            dateOfBirth,

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
    dateOfBirth = ?,
   

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


// EDIT TEACHER ROUTE 

const editTeacher = (req, res) => {
    try {
        const id = req.params.id;
        const {
            first_name,
            last_name,
            phoneNumber,
            email,
            subject,
            department,
            gender,
            address,
            dateOfBirth,
            qualification
        } = req.body;



        console.log(req.body);

        const sql = `UPDATE StudentDetails SET  
            first_name = ?,
            last_name = ?,
            phoneNumber = ?,
            email = ?,
            subject = ?,
            department = ?,
            gender = ?,
            address = ?,
            dateOfBirth = ?,
            qualification = ?
            WHERE id = ?
        `

        ConnectDb.query(sql, [
            first_name,
            last_name,
            phoneNumber,
            email,
            subject,
            department,
            gender,
            address,
            dateOfBirth,
            qualification,
            id
        ], (err, result) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: "Server Error"
                })
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Teacher Not Found !"
                })
            }

            return res.status(200).json({
                success: true,
                message: "User Uptdate Success !"
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


// USER PROFILE ROUTE 

const getProfile = (req, res) => {
    const userid = req.user.id;
    console.log(userid);

    const sql = `SELECT * FROM StudentDetails WHERE id = ?`

    ConnectDb.query(sql, [userid], (err, result) => {
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
        const sql = `
            SELECT COUNT(CASE WHEN role = 'Student' THEN 1 END) AS studentCount,
                COUNT(CASE WHEN role = 'Teacher' THEN 1 END) AS teacherCount,
                COUNT(CASE WHEN role = 'Student' AND created_at >= NOW() - INTERVAL 3 DAY THEN 1 END) AS newStudentCount
            FROM StudentDetails
        `;

        ConnectDb.query(sql, (err, result) => {
            if (err) {
                console.log(err);

                return res.status(500).json({
                    success: false,
                    message: "Internal Server Error"
                });
            }

            return res.status(200).json({
                success: true,
                data: result[0],
                message: "Success"
            });
        });

    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};




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





const checkEmail = (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required"
            });
        }

        // 1. User check karo
        const userSql = `
            SELECT id 
            FROM StudentDetails 
            WHERE email = ?
        `;

        ConnectDb.query(userSql, [email], (error, users) => {

            if (error) {
                console.log("USER CHECK ERROR:", error);

                return res.status(500).json({
                    success: false,
                    message: "Database error"
                });
            }

            if (users.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "User not found"
                });
            }

            const userId = users[0].id;

            // 2. Secure random token generate
            const resetToken = crypto
                .randomBytes(32)
                .toString("hex");

            // 3. Token hash karo before DB me save
            const tokenHash = crypto
                .createHash("sha256")
                .update(resetToken)
                .digest("hex");

            // 4. Token expiry - 10 minutes
            const expiresAt = new Date(
                Date.now() + 10 * 60 * 1000
            );

            // 5. Purana reset token delete karo
            const deleteSql = `
                DELETE FROM password_resets
                WHERE user_id = ?
            `;

            ConnectDb.query(
                deleteSql,
                [userId],
                (deleteError) => {

                    if (deleteError) {
                        console.log("DELETE TOKEN ERROR:", deleteError);

                        return res.status(500).json({
                            success: false,
                            message: "Old token delete failed"
                        });
                    }

                    // 6. New hashed token save karo
                    const insertSql = `
                        INSERT INTO password_resets
                        (user_id, token_hash, expires_at)
                        VALUES (?, ?, ?)
                    `;

                    ConnectDb.query(
                        insertSql,
                        [userId, tokenHash, expiresAt],
                        async (insertError) => {

                            if (insertError) {
                                console.log("TOKEN INSERT ERROR:", insertError);

                                return res.status(500).json({
                                    success: false,
                                    message: "Reset token save failed"
                                });
                            }

                            try {
                                // 7. Reset link banao
                                const resetUrl =
                                    `http://localhost:5173/reset-password/${resetToken}`;
                                console.log(resetUrl);

                                // 8. Email send karo
                                await transporter.sendMail({
                                    from: process.env.app_name,
                                    to: email,
                                    subject: "Password Reset Request",
                                    html: `
                                        <h2>Reset Your Password</h2>

                                        <p>
                                            Click the link below to reset your password.
                                        </p>

                                        <a href="${resetUrl}">
                                            Reset Password
                                        </a>

                                        <p>This link will expire in 10 minutes.</p>
                                    `
                                });

                                return res.status(200).json({
                                    success: true,
                                    message: "Reset link sent successfully"
                                });

                            } catch (mailError) {

                                console.log(
                                    "EMAIL ERROR:",
                                    mailError
                                );

                                return res.status(500).json({
                                    success: false,
                                    message: "Email sending failed"
                                });
                            }
                        }
                    );
                }
            );
        });

    } catch (error) {
        console.log("SERVER ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};


// OTP CHECK CONTROLLER

// const CheckOtp = async (req, res) => {
//     try {
//         const { email, otp } = req.body;
//         const sql = `
//             SELECT StudentDetails.id AS userId
//             FROM password_otp
//             INNER JOIN StudentDetails
//             ON password_otp.email = StudentDetails.email
//             WHERE password_otp.email = ?
//             AND password_otp.otp = ?
//             AND password_otp.expires_at > NOW()
//         `;
//         if (!email || !otp) {
//             return res.status(400).json({
//                 success: false,
//                 message: "email and otp required"
//             });

//         }

//         ConnectDb.query(sql, [email, otp], (error, result) => {

//             if (result.length === 0) {

//                 return res.status(500).json({
//                     success: false,
//                     message: "Invalid Opt or expires"
//                 })
//             }

//             const resetToken = crypto.randomBytes(32).toString('hex');

//             const tokenExpires = new Date(Date.now() + 10 * 60 * 1000);

//             const updateSql = `
//     UPDATE password_otp
//     SET reset_token = ?,
//         reset_token_expires = ?
//     WHERE email = ?
//     AND otp = ?
// `;

//             ConnectDb.query(updateSql, [resetToken, tokenExpires, email, otp], (updagtError, UpdateResult) => {
//                 if (updagtError) {
//                     success: false
//                     message: "Token Saved denied"
//                 }
//                 return res.status(200).json({
//                     success: true,
//                     message: "Opt varifeid succesfully",
//                     reset_token: resetToken
//                 })

//             })
//         });
//     } catch (error) {
//         console.log(error, "Error Catch me hai");
//     }
// }


// RESET - PASSWORD 

const resetPassword = async (req, res) => {
    try {

        const { token } = req.params;
        const { password } = req.body;

        console.log("TOKEN:", token);

        if (!password) {
            return res.status(400).json({
                success: false,
                message: "Password is required"
            });
        }


        const tokenHash = crypto
            .createHash("sha256")
            .update(token)
            .digest("hex");


        const findTokenSql = `SELECT user_id, expires_at FROM password_resets WHERE token_hash = ?`;

        ConnectDb.query(
            findTokenSql,
            [tokenHash],
            async (error, results) => {

                if (error) {
                    console.log("TOKEN CHECK ERROR:", error);

                    return res.status(500).json({
                        success: false,
                        message: "Database error"
                    });
                }


                if (results.length === 0) {
                    return res.status(400).json({
                        success: false,
                        message: "link is expired"
                    });
                }

                const resetData = results[0];


                if (new Date() > new Date(resetData.expires_at)) {

                    return res.status(400).json({
                        success: false,
                        message: "Reset link has expired"
                    });
                }

                // 4. Password hash karo
                const hashedPassword = await bcrypt.hash(password, 10);

                // 5. Password update karo
                const updateSql = `
          UPDATE StudentDetails
          SET password = ?
          WHERE id = ?
        `;

                ConnectDb.query(
                    updateSql,
                    [hashedPassword, resetData.user_id],
                    (updateError) => {

                        if (updateError) {
                            console.log("PASSWORD UPDATE ERROR:", updateError);

                            return res.status(500).json({
                                success: false,
                                message: "Password update failed"
                            });
                        }


                        const deleteTokenSql = `DELETE FROM password_resets WHERE token_hash = ?
            `;

                        ConnectDb.query(
                            deleteTokenSql,
                            [tokenHash],
                            (deleteError) => {

                                if (deleteError) {
                                    console.log("TOKEN DELETE ERROR:", deleteError);

                                    return res.status(500).json({
                                        success: false,
                                        message: "Password updated but token deletion failed"
                                    });
                                }


                                return res.status(200).json({
                                    success: true,
                                    message: "Password reset successfully"
                                });

                            }
                        );

                    }
                );

            }
        );

    } catch (error) {

        console.log("RESET PASSWORD ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};



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
exports.editTeacher = editTeacher;

exports.resetPassword = resetPassword;
