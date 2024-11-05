const setup = require('../index.js')
const QUnit = require('qunit')

const retry = setup(QUnit.test)

QUnit.module('retry.only', function () {
  const calls = []

  retry.only('count only retries', function (assert, currentRun) {
    calls.push(['only', currentRun])

    assert.equal(currentRun, 2)
  })

  retry('count non-only retries', function (assert, currentRun) {
    calls.push(['non-only', currentRun])

    assert.equal(currentRun, 2)
  })

  QUnit.test('verify calls', function (assert) {
    assert.deepEqual(calls, [['only', 1], ['only', 2]])
  })
})

QUnit.module('retry.only.each', function () {
  const calls = []

  retry.only.each('count only retries', ['A', 'B'], function (assert, data, currentRun) {
    calls.push(['only', data, currentRun])

    assert.equal(currentRun, 2)
  })

  retry.each('count non-only retries', ['A', 'B'], function (assert, data, currentRun) {
    calls.push(['non-only', data, currentRun])

    assert.equal(currentRun, 2)
  })

  QUnit.test('verify calls', function (assert) {
    assert.deepEqual(calls, [['only', 'A', 1], ['only', 'A', 2], ['only', 'B', 1], ['only', 'B', 2]])
  })
})
