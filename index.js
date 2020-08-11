const fs = require("fs");
const { spawn } = require("child_process");

const logStream = fs.createWriteStream("./log/utils.log", { flags: "a" });
const run = spawn("node", ["./src/index.js"]);

run.stdout.pipe(logStream);
run.stderr.pipe(logStream);

run.on("error", console.error);

run.on("close", (code) => {
  console.log(`Exited with code ${code}`);
});
