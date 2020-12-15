# Testwise

A cli tool for facilitating your combinatorial testing coverage.  It utilizes the [n-wise](https://en.wikipedia.org/wiki/All-pairs_testing) (or all pairs) testing methodology to generate sets of expected coverage.



## Usage
Testwise can be used to generate the combinatorial n-sets or compare against your actual test coverage.  We will cover the latter here.

There are 3 steps to using this tool:

1. create a manifest file containing your testing parameters
2. generate a tests file that reports on what you have tested
3. run the command


### Manifest file

The manifest file (.testwise.yml) describes your testing parameters which requires you to model/design the combinatorial scope.  Here is an example if you were testing options on a car configurator with 3 parameters:

```yaml
version: 1.0
suites:
  car:
    description: configuring options in a car
    parameters:
      - name: color
        values:
          - red
          - green
          - blue
      - name: tech-package
        values:
          - tech-package-opt-in
          - tech-package-opt-out
      - name: sound-package
        values:
          - standard-sound-package
          - upgraded-sound-package
    ignores:
      - ['upgraded-sound-system', 'tech-package-opt-out']
```

Testwise will generate the combinatorial sets.  In this example, there is a dependency for the upgraded sound system on the tech package, therefore, opting out of the tech package and opting in the upgraded sound package is not a possible combination.  Testwise will remove those combinations in the expected tests.

### Test file

Create a tests.yml file with the following format:

```yaml
red car with standard package:
  - red
  - tech-package-opt-in
  - standard-sound-package
fully decked out car:
  - blue
  - tech-package-opt-in
  - upgraded-sound-package
```

This file represents the tests for which you have coverage.  It may be wise to generate this file as part of your CI after the actual tests are run.

### Running the command

```node
npm install -g testwise
testwise
```

Here is an example output:
```
┌────────────────────────────────────────────────────────────────────────────────┐
│ * coverage - 6 / 16 (37%)                                                      │
├────────────────────────────────────────────────────────────────────────────────┤
│ Missing Sets:                                                                  │
├────────────────────────────────────────────────────────────────────────────────┤
│ negative-charge|red                                                            │
│ positive-spin|red                                                              │
│ green|positive-charge                                                          │
│ green|negative-charge                                                          │
│ green|positive-spin                                                            │
│ green|negative-spin                                                            │
│ blue|positive-charge                                                           │
│ blue|positive-spin                                                             │
│ positive-charge|positive-spin                                                  │
│ negative-charge|positive-spin                                                  │
└────────────────────────────────────────────────────────────────────────────────┘
```

Testwise will run with these defaults:
```
Options:
  -V, --version          output the version number
  -n, --n <number>       the number n for n-wise coverage (default: 2)
  -m, --manifest <path>  manifest file path path (default: ".testwise.yml")
  -t, --tests <path>     tests file path (default: "tests.yml")
  -h, --help             display help for command
```


## Known Limitations

* parameter values must be unique
* output of the cli sets should be cleaned up
* output of the cli should have the test name
* does not support coverage thresholds with corresponding exit error codes for CI
