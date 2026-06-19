const jwt = require("jsonwebtoken");

const adminAuth = (req, res, next) => {
  const header = req.headers.authorization;

  if (!header) {
    return res.status(401).json({
      message: "Please login as admin first",
    });
  }

  const token = header.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.adminId = decoded.id;

    next();
  } catch (err) {
    return res.status(401).json({
      message: "Invalid admin token",
    });
  }
};

module.exports = adminAuth;
