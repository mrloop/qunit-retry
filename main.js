import Retry from './src/retry.js'

export default function setup (testFn) {
  const retry = function (name, callback, maxRuns = 2) {
    return new Retry([name], callback, maxRuns, testFn)
  }
  retry.each = function (name, dataset, callback, maxRuns = 2) {
    return new Retry([name, dataset], callback, maxRuns, testFn.each)
  }
  return retry
}
