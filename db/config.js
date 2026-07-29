
const mysql = require('mysql2');
const ConnectDb = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Alfaiz@123",
    database: "CampusDesk"
});


ConnectDb.connect((error)=>{
    if(error){
        console.log(error),
        console.log("Connection error");
    }
    console.log("Database connected");
});

exports.ConnectDb = ConnectDb;
