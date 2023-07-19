const Project = require("../models/project");
const SoftwareCharacteristics = require("../models/softwareChrxs");
const DataCenter = require("../models/dataCenter");
// const ProjectDataCenter = require("../models/projectDataCenter");
const { getTransferCF } = require("../dataTransferCF");
const fs = require("fs");
const csv = require("csv-parser");
const { spawn } = require("child_process");

// Helper function to parse software characteristics from the uploaded file
function parseSoftwareCharacteristicsFromFile(filePath) {
  return new Promise((resolve, reject) => {
    const softwareCharacteristics = [];

    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (row) => {
        // Assuming the columns in the CSV file are: category, name, inputSize, staticInstCount, flops, ioInstCount, idealILP, dynamicInstCount
        const {
          category,
          name,
          inputDataSize,
          staticInstCount,
          flops,
          ioInstCount,
          idealILP,
          dynamicInstCount,
        } = row;

        // Create a software characteristic object and add it to the array
        const softwareCharacteristic = {
          category,
          name,
          inputDataSize,
          staticInstCount,
          flops,
          ioInstCount,
          idealILP,
          dynamicInstCount,
        };

        softwareCharacteristics.push(softwareCharacteristic);
      })
      .on("end", () => {
        // Resolve with the software characteristics
        resolve(softwareCharacteristics);
      })
      .on("error", (error) => {
        // Reject with the error
        reject(error);
      });
  });
}
exports.createProject = async (req, res) => {
  try {
    // Check if a file was uploaded

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Access the uploaded file using req.file
    const { filename, path } = req.file;

    // Parse the file and extract the software characteristics
    const softwareCharacteristics = await parseSoftwareCharacteristicsFromFile(
      path
    );

    // Create a new project
    const project = new Project({
      name: req.body.projectName,
      user: req.body.userId,
    });

    // Create software characteristics
    const softwareCharacteristicsDoc = new SoftwareCharacteristics(
      softwareCharacteristics[0]
    );
    softwareCharacteristicsDoc.project = project._id;
    project.softwareCharacteristics = softwareCharacteristicsDoc._id;

    // Find the existing data centers by their IDs
    const existingDataCenters = await DataCenter.find({
      _id: { $in: req.body.dataCenters },
    });

    // Add the project data centers to the project
    project.dataCenters = existingDataCenters.map((projectDataCenter) => {
      return {
        dataCenter: projectDataCenter._id,
        powerConsumption: null,
        runtime: null,
        OperationalCarbonFootprint: null,
        EmbodiedCarbonFootprint: null,
        DataTransferCarbonFootprint: null,
        BatteryStorageCarbonFootprint: null,
        cost: null,
      };
    });

    // software characteristics
    await softwareCharacteristicsDoc.save();

    // Create an array to store promises for data transfer calculations
    const dataTransferPromises = project.dataCenters.map((projectDataCenter) =>
      getTransferCF("142.250.191.238", 1)
        .then((result) => {
          projectDataCenter.DataTransferCarbonFootprint = result;
        })
        .catch((error) => {
          console.error(error);
          // Handle errors if any
        })
    );

    // Wait for all data transfer calculations to complete
    await Promise.all(dataTransferPromises);
    console.log("project", project);

    // Create an array to store inputs for each data center
    const inputDataArray = [];

    // Iterate over the selected data centers
    for (const projectDataCenter of project.dataCenters) {
      const currentDataCenter = await DataCenter.findById(
        projectDataCenter.dataCenter
      );

      // Create the input data for the current data center
      const inputData = {
        num_threads: currentDataCenter.numberOfThreads,
        workload: softwareCharacteristicsDoc.category,
        processor_type: currentDataCenter.processorType,
        c_voltage: currentDataCenter.voltage,
        frequency: currentDataCenter.frequency.base,
        tdp: currentDataCenter.tdp.value,
        die_area: currentDataCenter.dieSize.value,
        num_core: currentDataCenter.numberOfCores,
        input_size: softwareCharacteristicsDoc.inputDataSize,
        static_ins_count: softwareCharacteristicsDoc.staticInstCount,
        mem_capacity: currentDataCenter.memoryCapacity.value,
        L1_cache_size: currentDataCenter.l1CacheSize.value,
        L2_cache_size: currentDataCenter.l2CacheSize.value,
        L3_cache_size: currentDataCenter.l3CacheSize.value,
        dyn_inst_count: softwareCharacteristicsDoc.dynamicInstCount,
        ilp: softwareCharacteristicsDoc.idealILP,
      };

      // Push the input data to the array
      inputDataArray.push(inputData);
    }

    // Create a new Python process
    const pythonProcess = spawn("python", [
      "C:/Users/Yared/OneDrive/Desktop/sage/model.py",
    ]);

    // Create promises for stdout, stderr, and close events
    const stdoutPromise = new Promise((resolve, reject) => {
      pythonProcess.stdout.once("data", (data) => {
        const outputs = JSON.parse(data.toString().trim());
        // Iterate over the outputs and update the corresponding data centers
        let i = 0;
        const promises = project.dataCenters.map((projectDataCenter) => {
          const output = outputs[i][0];
          const powerConsumption = output[0];
          const runtime = output[1];

          // Update the corresponding data center with power consumption and runtime
          projectDataCenter.powerConsumption = powerConsumption;
          projectDataCenter.runtime = runtime;

          // Calculate the operational carbon footprint
          const carbonIntensity = 0.06; // kg CO2e / kWh
          const PUE = 1.5;
          const operationalCarbonFootprint =
            powerConsumption * runtime * carbonIntensity * PUE;

          // Update the corresponding data center with the operational carbon footprint
          projectDataCenter.OperationalCarbonFootprint =
            operationalCarbonFootprint;
          // Calculate the battery storage carbon footprint

          // Calculate the cost

          // Calculate the embodied carbon footprint

          i++;
        });

        Promise.all(promises)
          .then(() => {
            project.markModified("dataCenters");
            project.save().then(() => {
              resolve();
            });
          })
          .catch((error) => {
            console.error(error);
            reject(error);
          });
      });
    });

    const stderrPromise = new Promise((resolve, reject) => {
      pythonProcess.stderr.once("data", (data) => {
        console.error(data.toString());
        reject();
      });
    });

    const closePromise = new Promise((resolve, reject) => {
      pythonProcess.once("close", (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject();
        }
      });
    });

    // Pass the input data to the Python process
    pythonProcess.stdin.write(JSON.stringify(inputDataArray));
    pythonProcess.stdin.end();

    // Wait for the Python process to finish executing
    await Promise.all([stdoutPromise, stderrPromise, closePromise]).catch(
      (error) => {
        console.error(error);
      }
    );

    res.status(201).json({ project });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create project" });
  }
};

exports.getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find({}).populate(
      "softwareCharacteristics dataCenters dataCenters.dataCenter"
    );
    res.status(200).json({ projects });
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve projects" });
  }
};

exports.getProjectByUserId = async (req, res) => {
  try {
    const userId = req.params.id;
    const projects = await Project.find({ user: userId }).sort({
      createdAt: -1,
    });

    res.status(200).json({ projects });
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve projects" });
  }
};

exports.getProjectById = async (req, res) => {
  try {
    const projectId = req.params.id;
    const project = await Project.findById(projectId).populate(
      "softwareCharacteristics dataCenters dataCenters.dataCenter"
    );
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }
    res.status(200).json({ project });
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve project" });
  }
};

exports.addDataCenterToProject = async (req, res) => {
  try {
    const projectId = req.params.id;
    const { dataCenter } = req.body;

    // Check if the project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Create a new data center
    const dataCenterDoc = new DataCenter(dataCenter);
    await dataCenterDoc.save();

    // Create a new project data center
    const projectDataCenter = new ProjectDataCenter({
      project: projectId,
      dataCenter: dataCenterDoc._id,
    });
    await projectDataCenter.save();

    // Add the data center to the project
    project.dataCenters.push(dataCenterDoc._id);
    await project.save();

    res.status(201).json({ project });
  } catch (error) {
    res.status(500).json({ error: "Failed to add data center to project" });
  }
};

exports.deleteAllProjects = async (req, res) => {
  try {
    await Project.deleteMany();
    res.status(200).json({ message: "Projects deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete projects" });
  }
};
