const nodemailer = require("nodemailer");
const rateLimit = require("express-rate-limit");
const { body, validationResult } = require("express-validator");

const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 min
  max: 5, // 5 requests per IP
});

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

exports.validate = [
  body("message").trim().isLength({ min: 10, max: 10000 }),
];

exports.sendSuggestion = [
  limiter,
  ...exports.validate,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ message: "Invalid input" });

    try
    {  await transporter.sendMail({
        from: `"Suggestion Box" <${process.env.SMTP_USER}>`,
        to: process.env.SUGGESTION_TO,
        subject: "New Suggestion Received",
        text: req.body.message,
      });
    }catch(err){
      return res.status(500).json({ message: "Email failed" });
    }

    res.json({ message: "Sent" });
  },
];
