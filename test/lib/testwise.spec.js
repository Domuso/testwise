const YAML = require("yaml");
const fs = require("fs");
const chai = require("chai");
chai.should();
const testwise = require("../../lib/testwise");


describe("testwise", () => {
  let manifest;
  let tests;
  beforeEach(() => {
    manifest = YAML.parse(fs.readFileSync("./test/fixtures/.testwise.yml", "utf8"));
    tests = YAML.parse(fs.readFileSync("./test/fixtures/tests.yml", "utf8"));
  });
  describe("#generate", () => {
    it("generates all pairs testing provided the parameters of a suite", () => {
      let tests = testwise.generate(manifest);
      tests.particle.length.should.equal(16);
    });
    it("generates n pairs testing", () => {
      let tests = testwise.generate(manifest, {n: 3});
      tests.particle.length.should.equal(12);
    });
    it("supports ignore entries", () => {
      manifest.suites.particle.ignores = [['red', 'positive-charge']]
      let tests = testwise.generate(manifest);
      tests.particle.length.should.equal(15);
    });
    it("generates tests for each suite", () => {
      manifest.suites.anothersuite = Object.assign({}, manifest.suites.particle)

      let tests = testwise.generate(manifest);
      tests.particle.should.not.be.empty;
      tests.anothersuite.should.not.be.empty;
    });
    it("throws an error when specifying n-wise pair that is non positive", () => {
        (() => testwise.generate(manifest, {n: -1})).should.throw("n must be a positive integer");
    });
  });
  describe("#report", () => {
    it.skip("compares the expected with actual", () => {
      let report = testwise.report(manifest, tests);
      // for (let suitename in report) {
      //   let suite = report[suitename]
      //   let values = Object.values(suite);
      //   let total = values.length;
      //   let numCovered = values.filter(tests => tests.length > 0).length;
      //   console.log((numCovered / total) * 100);
      //   console.log(`${total} total all pairs`);
      //   console.log("Missing coverage")
      //   for (let missingSet in suite){
      //     if (!suite[missingSet].length) console.log(missingSet)
      //   }
      // }
    });
    it("supports filtering tests to suites")
  });
});
