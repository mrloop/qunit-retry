import Retry from './src/retry.js'

export default function setup (testFn) {
  const retry = function (name, callback, maxRuns = 2) {
    return new Retry([name], callback, maxRuns, testFn)
  }
  retry.todo = function (name, callback, maxRuns) {
    return new Retry([name], callback, maxRuns, testFn.todo)
  }
  retry.skip = function (name, callback, maxRuns) {
    return new Retry([name], callback, maxRuns, testFn.skip)
  }
  retry.if = function (name, condition, callback, maxRuns = 2) {
    return new Retry([name, condition], callback, maxRuns, testFn.if)
  }
  retry.only = function (name, callback, maxRuns) {
    return new Retry([name], callback, maxRuns, testFn.only)
  }

  retry.each = function (name, dataset, callback, maxRuns = 2) {
    return new Retry([name, dataset], callback, maxRuns, testFn.each)
  }
  retry.todo.each = function (name, dataset, callback, maxRuns) {
    return new Retry([name, dataset], callback, maxRuns, testFn.todo.each)
  }
  retry.skip.each = function (name, dataset, callback, maxRuns) {
    return new Retry([name, dataset], callback, maxRuns, testFn.skip.each)
  }
  retry.if.each = function (name, condition, dataset, callback, maxRuns = 2) {
    return new Retry([name, condition, dataset], callback, maxRuns, testFn.if.each)
  }
  retry.only.each = function (name, dataset, callback, maxRuns) {
    return new Retry([name, dataset], callback, maxRuns, testFn.only.each)
  }
  return retry
}
