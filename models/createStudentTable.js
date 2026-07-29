const { ConnectDb } = require('../db/config.js');
const { connect } = require('../routes/index.route.js');



const sql = `CREATE TABLE IF NOT EXISTS StudentDetails (
	id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phoneNumber VARCHAR(30),
    email VARCHAR(100),
    Course VARCHAR(50),
    rollNumber VARCHAR(30),
    gender VARCHAR(20),
    address VARCHAR(100),
    dateOfBirth VARCHAR(15)
);`

const query2 = ``

ConnectDb.query(sql, (err, result) => {
    if (err) throw err;
});



