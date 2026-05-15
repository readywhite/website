const fs = require("fs");
const path = require("path");
const { summarizeCorrections } = require("../lib/calibration");
const filePath = process.argv[2] ? path.resolve(process.argv[2]) : path.join(__dirname, "..", "config", "corrections.example.json");
const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
console.log(JSON.stringify(summarizeCorrections(data.corrections || []), null, 2));
