import Retry from './src/retry.js'

export default function setup (testFn, { maxRuns: defaultMaxRuns = 2, beforeRetry } = {}) {
  const retry = function (name, callback, maxRuns = defaultMaxRuns) {
    return new Retry([name], callback, maxRuns, testFn, beforeRetry)
  }
  retry.todo = function (name, callback, maxRuns = defaultMaxRuns) {
    return new Retry([name], callback, maxRuns, testFn.todo, beforeRetry)
  }
  retry.skip = function (name, callback, maxRuns = defaultMaxRuns) {
    return new Retry([name], callback, maxRuns, testFn.skip, beforeRetry)
  }
  retry.if = function (name, condition, callback, maxRuns = defaultMaxRuns) {
    return new Retry([name, condition], callback, maxRuns, testFn.if, beforeRetry)
  }
  retry.only = function (name, callback, maxRuns = defaultMaxRuns) {
    return new Retry([name], callback, maxRuns, testFn.only, beforeRetry)
  }

  retry.each = function (name, dataset, callback, maxRuns = defaultMaxRuns) {
    return new Retry([name, dataset], callback, maxRuns, testFn.each, beforeRetry)
  }
  retry.todo.each = function (name, dataset, callback, maxRuns = defaultMaxRuns) {
    return new Retry([name, dataset], callback, maxRuns, testFn.todo.each, beforeRetry)
  }
  retry.skip.each = function (name, dataset, callback, maxRuns = defaultMaxRuns) {
    return new Retry([name, dataset], callback, maxRuns, testFn.skip.each, beforeRetry)
  }
  retry.if.each = function (name, condition, dataset, callback, maxRuns = defaultMaxRuns) {
    return new Retry([name, condition, dataset], callback, maxRuns, testFn.if.each, beforeRetry)
  }
  retry.only.each = function (name, dataset, callback, maxRuns = defaultMaxRuns) {
    return new Retry([name, dataset], callback, maxRuns, testFn.only.each, beforeRetry)
  }
  return retry
}
