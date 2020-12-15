#!/usr/bin/env node

const commander = require('commander');
const testwise = require("../lib/testwise");
const fs = require("fs");
const YAML = require("yaml");
const Table = require('cli-table3');
const colors = require('colors')
const package = require('../package');

let program = new commander.Command();

program.version(package.version);

program
  .option('-n, --n <number>', 'the number n for n-wise coverage', 2)
  .option('-m, --manifest <path>', 'manifest file path path', '.testwise.yml')
  .option('-t, --tests <path>', 'tests file path', 'tests.yml')

program.parse(process.argv)

let manifest = YAML.parse(fs.readFileSync(program.manifest, "utf8"));
let tests = YAML.parse(fs.readFileSync(program.tests, "utf8"))

let report = testwise.report(manifest, tests, {n: program.n})

let header = Object.keys(report).map(suitename => {
  let suite = report[suitename];
  let values = Object.values(suite);
  let total = values.length;
  let numCovered = values.filter(tests => tests.length > 0).length;
  return `${suitename} coverage - ${numCovered} / ${total} ` + `(${Math.floor(numCovered*100/total)}%)`.gray;
});
let numSuites = Object.keys(report).length;

const table = new Table({
  head: header,
  colWidths: Array(numSuites).fill(80),
  wordWrap: true
});
table.push([{colSpan: numSuites, content: 'Missing Sets:'}])

let missingSets = Object.values(report).map(suite => {
  return Object.keys(suite).filter(set => !suite[set].length).join('\n')
});
table.push(missingSets);

console.log(table.toString());
