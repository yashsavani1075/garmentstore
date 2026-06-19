const nodemailer = require("nodemailer");

const sendMail = async ({ to, subject, html }) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: `"GarmentStore" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    console.log("Mail sent successfully");
  } catch (error) {
    console.log("Mail sending error:", error.message);
  }
};

module.exports = sendMail;