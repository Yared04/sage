const ping = require("ping");
const { exec } = require("child_process");

const w_to_kwhr = 3600000; // Conversion factor from watts to kilowatt-hours (kWh)
const avg_CI = 520; // Average carbon intensity of grids in the US in gCO2eq/kWh
const secs_in_a_year = 24 * 365 * 3600; // Number of seconds in a year
const life_time_core_router = 3; // Lifetime of a core router (needs to be updated)
const life_time_edge_router = 3; // Lifetime of an edge router (needs to be updated)
const n = 100; // Number of users of a basestation at a time

function get_transmission_latency(bi, D) {
  const lat = 0.0003 * D + bi;
  return lat;
}

function operational_cf_basestation(t) {
  const tdp_basestation = 1000; // TDP of basestation = 1000w
  const energy_BS = (tdp_basestation * t) / w_to_kwhr;
  const cf = energy_BS * avg_CI;
  const amortized_cf = cf / n;
  return amortized_cf;
}

function operational_routers(data_size) {
  const data_energy_intensity_core_r = 5.225; // in J/Gb
  const data_energy_intensity_edge_r = 15.5536; // in J/Gb

  const cf_core =
    (data_size * data_energy_intensity_core_r * avg_CI) / w_to_kwhr;
  const cf_edge =
    (data_size * data_energy_intensity_edge_r * avg_CI) / w_to_kwhr;

  return [cf_core, cf_edge];
}

function embodied_cf_basestation(t) {
  const cf =
    (510 * (t / 20) +
      16086 * (t / 10) +
      299 * (t / 10) +
      765 * (t / 15) +
      25 * (t / 15)) *
    (1000 / (n * 3600 * 24 * 365));
  return cf;
}

function embodied_cf_router(t) {
  const core_r_embodied_cf = 3800; // kgCO2
  const edge_r_embodied_cf = 500; // kgCO2
  const amortization_factor = t / secs_in_a_year;
  const emb_cf_core =
    (core_r_embodied_cf * amortization_factor) / life_time_core_router;
  const emb_cf_edge =
    (edge_r_embodied_cf * amortization_factor) / life_time_edge_router;
  return [emb_cf_core, emb_cf_edge]; // core router, edge router
}

function transmission_carbon_footprint(
  t_transmission,
  data_size,
  n_core,
  n_edge,
  n_BS = 1
) {
  const baseStation_opCF = operational_cf_basestation(t_transmission);
  const baseStation_embCF = embodied_cf_basestation(t_transmission);

  const [edge_router_operationalCF, core_router_operationalCF] =
    operational_routers(data_size);
  const [edge_router_embodied_CF, core_router_embodied_CF] =
    embodied_cf_router(t_transmission);

  const cf_core =
    n_core * (core_router_embodied_CF + core_router_operationalCF);
  const cf_edge =
    n_edge * (edge_router_embodied_CF + edge_router_operationalCF);
  const cf_BS = n_BS * (baseStation_embCF + baseStation_opCF);

  return cf_core + cf_edge + cf_BS;
}

exports.getTransferCF = (targetHost, dataSize) => {
  return new Promise((resolve, reject) => {
    let time = 0;
    let core_routers = 0;
    let edge_routers = 0;

    const pingPromise = ping.promise.probe(targetHost);
    const execPromise = new Promise((resolve, reject) => {
      const tracerouteCommand = `tracert ${targetHost}`;
      exec(tracerouteCommand, (error, stdout, stderr) => {
        if (error) {
          reject(error);
          return;
        }
        const hops = stdout.split("\n").slice(4, -2);

        hops.forEach((hop) => {
          if (hop.includes("core")) {
            core_routers++;
          } else {
            edge_routers++;
          }
        });

        resolve();
      });
    });

    Promise.all([pingPromise, execPromise])
      .then(([pingResult]) => {
        time = pingResult.time;
        console.log("time", time);
        console.log("core_routers", core_routers);
        console.log("edge_routers", edge_routers);

        const transferCF = transmission_carbon_footprint(
          time,
          dataSize,
          core_routers,
          edge_routers
        );
        console.log("transferCF", transferCF);
        resolve(transferCF);
      })
      .catch((error) => {
        console.error(error);
        reject(error);
      });
  });
};
