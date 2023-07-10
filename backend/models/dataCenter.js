const mongoose = require("mongoose");

// Define the data center schema
const dataCenterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  hourlyPrice: {
    value: {
      type: Number,
      required: true,
    },
    unit: {
      type: String,
      default: "USD",
    },
  },
  CSP: {
    type: String,
    required: true,
  },
  location: {
    latitude: {
      type: Number,
      required: true,
    },
    longitude: {
      type: Number,
      required: true,
    },
  },
  country: {
    type: String,
    required: true,
  },
  numberOfCores: {
    type: Number,
    required: true,
  },
  numberOfThreads: {
    type: Number,
    required: true,
  },
  voltage: {
    type: Number,
    required: true,
  },
  tdp: {
    value: {
      type: Number,
      required: true,
    },
    unit: {
      type: String,
      default: "W",
    },
  },
  dieSize: {
    value: {
      type: Number,
      required: true,
    },
    unit: {
      type: String,
      default: "mm^2",
    },
  },
  transistorDensity: {
    value: {
      type: Number,
      required: true,
    },
    unit: {
      type: String,
      default: "MTr/mm^2",
    },
  },
  technologyNode: {
    value: {
      type: Number,
      required: true,
    },
    unit: {
      type: String,
      default: "nm",
    },
  },
  frequency: {
    base: {
      type: Number,
      required: true,
    },
    unit: {
      type: String,
      default: "GHz",
    },
  },
  memoryCapacity: {
    value: {
      type: Number,
      required: true,
    },
    unit: {
      type: String,
      default: "GB",
    },
  },
  memoryBandwidth: {
    value: {
      type: Number,
      required: true,
    },
    unit: {
      type: String,
      default: "bit/s",
    },
  },
  memoryTechnology: {
    type: String,
    required: true,
  },
  processorType: {
    type: Number,
    default: 0,
  },
  l1CacheSize: {
    value: {
      type: Number,
      required: true,
    },
    unit: {
      type: String,
      default: "KB",
    },
  },
  l2CacheSize: {
    value: {
      type: Number,
      required: true,
    },
    unit: {
      type: String,
      default: "KB",
    },
  },
  l3CacheSize: {
    value: {
      type: Number,
      required: true,
    },
    unit: {
      type: String,
      default: "KB",
    },
  },
  diskCapacity: {
    value: {
      type: Number,
      required: true,
    },
    unit: {
      type: String,
      default: "GB",
    },
  },
  diskType: {
    type: String,
    required: true,
  },
});

// Create the data center model
const DataCenter = mongoose.model("DataCenter", dataCenterSchema);

module.exports = DataCenter;
