const multer = require("multer");
const fs = require("fs");

const storage = multer.diskStorage({
  destination(req, file, cb) {
    const dir = "./uploads";

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }

    cb(null, dir);
  },

  filename(req, file, cb) {
    cb(
      null,
      Date.now() + "-" + file.originalname.replace(/\s+/g, "-")
    );
  },
});

module.exports = multer({ storage });