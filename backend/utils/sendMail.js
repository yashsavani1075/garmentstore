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
  console.error("========== MAIL ERROR ==========");
  console.error("Code:", error.code);
  console.error("Message:", error.message);
  console.error(error);
  console.error("================================");
}
};

module.exports = sendMail;