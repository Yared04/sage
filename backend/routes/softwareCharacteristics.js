const express = require("express");
const router = express.Router();
const softwareCharacteristicsController = require("../controllers/softwareChrxsController");

// Software characteristics routes
router.post(
  "/",
  softwareCharacteristicsController.createSoftwareCharacteristics
);
router.get(
  "/:id",
  softwareCharacteristicsController.getSoftwareCharacteristicsById
);

router.delete(
  "/delete-all",
  softwareCharacteristicsController.deleteAllSoftwareCharacteristics
);
module.exports = router;
