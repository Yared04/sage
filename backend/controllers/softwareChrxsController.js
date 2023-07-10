const SoftwareCharacteristics = require("../models/softwareChrxs");

// Controller actions
exports.createSoftwareCharacteristics = async (req, res) => {
  try {
    const softwareCharacteristics = new SoftwareCharacteristics(req.body);
    await softwareCharacteristics.save();
    res.status(201).json(softwareCharacteristics);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to create software characteristics" });
  }
};

exports.getSoftwareCharacteristicsById = async (req, res) => {
  try {
    const softwareCharacteristics = await SoftwareCharacteristics.findById(
      req.params.id
    );
    if (!softwareCharacteristics) {
      return res
        .status(404)
        .json({ error: "Software characteristics not found" });
    }
    res.json(softwareCharacteristics);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to retrieve software characteristics" });
  }
};

exports.deleteAllSoftwareCharacteristics = async (req, res) => {
  try {
    await SoftwareCharacteristics.deleteMany();
    res.json({ message: "All software characteristics deleted" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to delete all software characteristics" });
  }
};
