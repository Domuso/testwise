const _ = require("lodash");

module.exports.generate = (manifest, options={}) => {
  options.n = options.n || 2;
  if (options.n <= 0) throw Error("n must be a positive integer");
  let ret = {};
  for (let suitename in manifest.suites) {
    let suite = manifest.suites[suitename];
    let ignoreSet = new Set((suite.ignores || []).map(setHash));
    let tests = combinatorials([], suite.parameters, options.n, ignoreSet);
    ret[suitename] = tests;
  }
  return ret;
};

module.exports.report = (manifest, actual, options={}) => {
  options.n = options.n || 2;
  let suites = exports.generate(manifest, options);


  let parameterMapPerFilter = {};
  let isUsingGlobFilter = false;
  // initialize counter map
  for (let suitename in suites) {
    let tests = suites[suitename];
    let filterName = manifest.suites[suitename].filter || '*';
    isUsingGlobFilter = isUsingGlobFilter || filterName === '*'
    parameterMapPerFilter[filterName] = {}
    Object.assign(parameterMapPerFilter[filterName], tests.reduce((prev, curr) => {
      prev[setHash(curr)] = []
      return prev;
    }, {}));
  }

  for (let testname in actual) {
    let actualParameters = actual[testname].map(parameter => ({ values: [parameter]}));
    let sets = combinatorials([], actualParameters, options.n, new Set());

    let matchedFilters = _
      .flattenDeep(sets)
      .map(tag => tag.toLowerCase())
      .filter(tag => parameterMapPerFilter[tag])

    if (isUsingGlobFilter){
      matchedFilters.push('*')
    }

    for (let matchedFilter of matchedFilters) {
      for (let set of sets) {
        if (parameterMapPerFilter[matchedFilter][setHash(set)]) {
          parameterMapPerFilter[matchedFilter][setHash(set)].push(testname);
        }
      }
    }
  }
  return parameterMapPerFilter;
};

let combinatorials = (set, parameters, n, ignoreSet)  => {
  if (set.length == n && !ignoreSet.has(setHash(set))) return [set];

  let ret = [];
  for (let i = 0; i < parameters.length; i++) {
    let parameter = parameters[i];
    for (let value of parameter.values) {
      let sets = combinatorials(set.concat(value), parameters.slice(i + 1), n, ignoreSet);
      if (sets.length) ret = ret.concat(sets);
    }
  }
  return ret;
};


let setHash = set => set.map(a => a.toLowerCase()).sort().join("|");
