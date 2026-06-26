const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const sendMail = async ({ to, subject, html }) => {
  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
    });

    console.log("Mail sent successfully");
  } catch (error) {
    console.error("Mail sending error:", error.message);
  }
};

module.exports = sendMail;