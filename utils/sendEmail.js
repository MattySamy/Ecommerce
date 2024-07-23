/* eslint-disable import/no-extraneous-dependencies */
const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  // 1) Create a transporter (service that sends email like Gmail, Yahoo) or (services that sends email unlimited like Mailgun, mailtrap, sendGrid)
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT, // if secure:false then port will be 587, if secure:true then port will be 465
    secure: true,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // 2) Define email options (what you want to send like from, to, subject, email body)

  const mailOptions = {
    from: `Shoppily App <${process.env.EMAIL_USERNAME}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  // 3) Send email

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
