const express = require("express");
const mongoose = require("mongoose");
const moragn = require("morgan");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const projectController = require("./controllers/projectController");
const AuthRoute = require("./routes/auth");
const softwareCharacteristicsRoutes = require("./routes/softwareCharacteristics");
const dataCenterRoutes = require("./routes/dataCenters");
const projectRoutes = require("./routes/projects");

mongoose.connect(process.env.DB_CONNECTION, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));

db.once("open", function () {
  console.log("Connection Successful!");
});
const app = express();

app.use(moragn("dev"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, "public")));

// Serve uploaded files from the "uploads" directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Enable CORS
app.use(cors());

app.use("/api", AuthRoute);
app.use("/api/software-characteristics", softwareCharacteristicsRoutes);
app.use("/api/data-centers", dataCenterRoutes);
app.use("/api/projects", projectRoutes);

const port = process.env.PORT || 8080;

app.listen(port, () => {
  console.log(`server is running on port: ${port}`);
});
