module.exports = (err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || "Internal server error. Try again later" });
};


// app.use((err, req, res, next) => {
//   if (err instanceof multer.MulterError) {
//     return res.status(400).json({ message: err.message });
//   }
//   if (err.message === "Unsupported file type") {
//     return res.status(400).json({ message: err.message });
//   }
//   next(err);
// });
