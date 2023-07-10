const express = require("express");
const router = express.Router();
const dataCenterController = require("../controllers/dataCenterController");

// POST /data-centers
router.post("/", dataCenterController.createDataCenter);
router.get("/:id", dataCenterController.getDataCenterById);
router.get("/", dataCenterController.getAllDataCenters);
router.delete("/", dataCenterController.deleteAllDataCenters);
module.exports = router;
