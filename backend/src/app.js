// external modules
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
// internal modules
const authRoutes = require("./routes/authRouter");
const assetRoutes = require("./routes/assetRouter");
const userRoutes = require("./routes/userRouter");
const errorHandler = require("./middlewares/errorHandler");
const categoryRoutes = require("./routes/categoryRouter");
const subcategoryRoutes = require("./routes/subcategoryRouter");
const departmentRoutes = require("./routes/departmentRouter");
const designationRoutes = require("./routes/designationRouter");
const vendorRoutes= require("./routes/vendorRouter");
const historyRouter= require("./routes/historyRouter");
const requestRouters=require("./routes/request.routes");
const maintenanceRoutes=require("./routes/maintenance.routes");
const locationRoutes=require("./modules/location/location.routes")
const SuggestionRoutes=require("./modules/suggestions/suggestion.route");

const app = express();



// app.set("trust proxy",1);

// console.log("authRoutes:", typeof historyRouter);
// console.log("assetRoutes:", typeof assetRoutes);
// console.log("userRoutes:", typeof userRoutes);
// console.log("categoryRoutes:", typeof categoryRoutes);
// console.log("subcategoryRoutes:", typeof subcategoryRoutes);
// console.log("departmentRoutes:", typeof departmentRoutes);
// console.log("designationRoutes:", typeof designationRoutes);
// console.log("errorHandler:", typeof errorHandler);

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN,
    credentials: true,
  })
);

app.use("/api/requests",requestRouters);
app.use("/api/auth", authRoutes);
app.use("/api/assets", assetRoutes);
app.use("/api/user", userRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/subcategories", subcategoryRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/designations", designationRoutes);
app.use("/api/vendors",vendorRoutes);
app.use("/api/history",historyRouter);
app.use("/api/maintenance", maintenanceRoutes);
app.use("/api/locations",locationRoutes);
app.use("/api/suggestions",SuggestionRoutes);
app.get("/health", (req, res) => {
  res.status(200).send("OK");
});


app.use(errorHandler);

module.exports = app;