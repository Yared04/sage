const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const projectSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  softwareCharacteristics: {
    type: Schema.Types.ObjectId,
    ref: "SoftwareCharacteristics",
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  dataCenters: [
    {
      dataCenter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "DataCenter",
      },
      powerConsumption: {
        type: Number,
        default: null,
      },
      runtime: {
        type: Number,
        default: null,
      },
      OperationalCarbonFootprint: {
        type: Number,
        default: null,
      },
      EmbodiedCarbonFootprint: {
        type: Number,
        default: null,
      },
      DataTransferCarbonFootprint: {
        type: Number,
        default: null,
      },
      BatteryStorageCarbonFootprint: {
        type: Number,
        default: null,
      },
      cost: {
        type: Number,
        default: null,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Project = mongoose.model("Project", projectSchema);

module.exports = Project;
