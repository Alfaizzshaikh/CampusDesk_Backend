const { ConnectDb } = require('../db/config.js');
const { connect } = require('../routes/index.route.js');



const sql = `
CREATE TABLE IF NOT EXISTS homework (
    id INT AUTO_INCREMENT PRIMARY KEY,
    homework_title VARCHAR(100),
    homework_description VARCHAR(1000)
)`;


console.log("ghjio");
ConnectDb.query(sql, (err, result) => {
    if (err) throw err;
});