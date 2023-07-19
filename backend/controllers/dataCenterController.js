const DataCenter = require("../models/dataCenter");

createDataCenter = async (req, res) => {
  try {
    const newDataCenter = req.body;

    // Create a new data center document
    const dataCenter = new DataCenter(newDataCenter);

    // Save the data center document to the database
    await dataCenter.save();

    res.status(201).json({ message: "Data center created successfully" });
  } catch (error) {
    console.error("Failed to create data center:", error);
    res.status(500).json({ message: "Failed to create data center" });
  }
};

getDataCenterById = async (req, res) => {
  try {
    const dataCenter = await DataCenter.findById(req.params.id);
    if (!dataCenter) {
      return res.status(404).json({ error: "Data Center not found" });
    }
    res.json(dataCenter);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve data center" });
  }
};

const getAllDataCenters = async (req, res) => {
  try {
    const dataCenters = await DataCenter.find({}).sort({ createdAt: -1 });
    res.status(200).json(dataCenters);
  } catch (error) {
    console.error("Error fetching data centers:", error);
    res.status(500).json({ error: "Failed to fetch data centers" });
  }
};

const deleteAllDataCenters = async (req, res) => {
  try {
    await DataCenter.deleteMany();
    res.json({ message: "All data centers deleted" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete all data centers" });
  }
};

module.exports = {
  getAllDataCenters,
  createDataCenter,
  getDataCenterById,
  deleteAllDataCenters,
};
