const { ConnectDb } = require('../db/config.js');




const register = (req, res) => {
    console.log(req.body);
    console.log(req.file);
    const image = req.file ? req.file.filename : null;
    const {
        first_name,
        last_name, phoneNumber,
        email,
        Course,
        rollNumber,
        gender,
        address,
        dateOfBirth
    } = req.body;

    const sql = ` INSERT INTO StudentDetails 
    (first_name,last_name,phoneNumber,email,Course,rollNumber,gender,address,dateOfBirth,image)
    VALUES (?,?,?,?,?,?,?,?,?,?)  
    `;

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
        image
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
    const { search, course } = req.query;
    let sql;
    let value = [];
    

    if (search && course) {
        sql = `
        SELECT * FROM StudentDetails
        WHERE
        (first_name LIKE ? OR last_name LIKE ?)
        AND Course = ?
    `;

        value = [
            `%${search}%`,
            `%${search}%`,
            course
        ];
    }
    else if (search) {
        sql = `SELECT * FROM StudentDetails WHERE (first_name LIKE ? OR last_name LIKE ?)`;
        value = [
            `%${search}%`,
            `%${search}%`
        ]
    } else if (course) {
        sql = `SELECT * FROM StudentDetails WHERE Course = ?`
        value = [course];
    }

    else {
        sql = `SELECT *FROM StudentDetails `
    }

    ConnectDb.query(sql, value, (error, result) => {
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
        console.log(error);
    }
}

// FUNCTION MUST BE DO EXPORTS

exports.register = register;
exports.getAllStudent = getAllStudent;
exports.studentById = studentById;
exports.editStudent = editStudent;
exports.deletStudent = deletStudent;
