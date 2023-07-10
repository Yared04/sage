const express = require("express");
const router = express.Router();
const upload = require("../middlewares/multerConfig");
const projectController = require("../controllers/projectController");

// Create a new project
router.post(
  "/new-project",
  upload.single("file"),
  projectController.createProject
);
router.delete("/delete-all", projectController.deleteAllProjects);

// Get all projects
router.get("/", projectController.getAllProjects);

// Get a single project by ID
router.get("/:id", projectController.getProjectById);

router.get("/user/:id", projectController.getProjectByUserId);

// Add a data center to a project
router.post("/:id/data-centers", projectController.addDataCenterToProject);

module.exports = router;
