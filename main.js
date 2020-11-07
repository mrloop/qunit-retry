import Retry from './src/retry.js'

export default function setup (testFn) {
  return function retry (name, callback, maxRuns = 2) {
    return new Retry(name, callback, maxRuns, testFn)
  }
}
