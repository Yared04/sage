const mongoose = require("mongoose");

const softwareCharacteristicsSchema = new mongoose.Schema({
  category: {
    type: String,
  },
  name: {
    type: String,
  },
  inputDataSize: {
    type: Number,
    required: true,
  },
  staticInstCount: {
    type: Number,
    required: true,
  },
  flops: {
    type: Number,
    required: true,
  },
  ioInstCount: {
    type: Number,
    required: true,
  },
  idealILP: {
    type: Number,
    required: true,
  },
  dynamicInstCount: {
    type: Number,
    required: true,
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    required: true,
  },
});

const SoftwareCharacteristics = mongoose.model(
  "SoftwareCharacteristics",
  softwareCharacteristicsSchema
);

module.exports = SoftwareCharacteristics;
