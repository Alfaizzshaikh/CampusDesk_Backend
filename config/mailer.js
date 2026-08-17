// const nodemailer = require('nodemailer');

// const transporter = nodemailer.createTransport({
//     service:"email",
//     auth:{
//         user: process.env.app_name,
//         pass: process.env.app_pass
//     },
// });

// module.exports = transporter;


const nodemailer = require("nodemailer");

console.log("EMAIL:", process.env.app_name);
console.log("PASSWORD AVAILABLE:", !!process.env.app_pass);

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.app_name,
    pass: process.env.app_pass,
  },
});

module.exports = transporter;