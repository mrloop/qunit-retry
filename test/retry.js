const setup = require('../index.js')
const QUnit = require('qunit')
const timeout = function (ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

const retry = setup(QUnit.test)

QUnit.module('test retries and result message', hooks => {
  hooks.after(assert => {
    assert.equal(QUnit.config.current.assertions[0].message, '(Retried 5 times)', 'message shows retries')
  })

  retry('test retry five times', function (assert, currentRun) {
    assert.equal(currentRun, 5)
  }, 5)
})

QUnit.module('test retries, should stop at 3 retries', hooks => {
  hooks.after(assert => {
    assert.equal(QUnit.config.current.assertions[0].message, '(Retried 3 times)', 'message shows retries')
  })

  retry('test retry five times', function (assert, currentRun) {
    assert.equal(currentRun, 3)
  }, 5)
})

retry('test default: retry runs twice - initial attempt plus one retry', function (assert, currentRun) {
  assert.expect(1)
  assert.equal(currentRun, 2)
})

retry('test retry five times', function (assert, currentRun) {
  assert.expect(1)
  assert.equal(currentRun, 5)
}, 5)

retry('test retry async', async function (assert, currentRun) {
  assert.expect(1)
  await timeout(100)
  assert.equal(currentRun, 4)
}, 4)

retry('promise reject', async function (assert, currentRun) {
  if (currentRun === 2) {
    await Promise.reject(new Error('should be handled'))
  }
  assert.equal(currentRun, 5)
}, 5)

QUnit.module('hook context', function (hooks) {
  hooks.beforeEach(function () {
    this.sharedValue = 'myContext'
  })

  QUnit.test('qunit test', function (assert) {
    assert.equal(this.sharedValue, 'myContext')
  })

  retry('retry matches qunit test behaviour', function (assert, currentRun) {
    assert.equal(this.sharedValue, 'myContext')
    assert.equal(currentRun, 2)
  })

  retry('environment it reset on each retry', function (assert, currentRun) {
    assert.equal(this.localValue, undefined)
    this.localValue = 'local'
    assert.equal(currentRun, 2)
  })
})

QUnit.module('currentRun count', function () {
  // tests are order dependent
  // count retries in retryTest
  // assert correct count in another test
  let execCount = 0

  retry('count retries', function (assert, currentRun) {
    execCount = execCount + 1
    assert.equal(currentRun, 5)
  }, 5)

  QUnit.test('execCount for retryTest', function (assert) {
    assert.equal(execCount, 5)
  })
})

QUnit.module('hooks count', function () {
  // tests are order dependent
  // count retries in retryTest
  // assert correct count in another test
  let execCount = 0
  let beforeCount = 0
  let afterCount = 0

  QUnit.module('count hooks async', function (hooks) {
    hooks.beforeEach(async function () {
      await timeout(100)
      beforeCount++
    })
    hooks.afterEach(async function () {
      await timeout(100)
      afterCount++
    })

    retry('count retries', function (assert, currentRun) {
      execCount++
      assert.equal(beforeCount, currentRun, 'beforeCount should match currentRun')
      assert.equal(afterCount, currentRun - 1, 'afterCount one less than currentRun')
      assert.equal(currentRun, 5)
    }, 5)
  })

  QUnit.test('test hooks count', function (assert) {
    assert.equal(execCount, 5)
    assert.equal(beforeCount, 5)
    assert.equal(afterCount, 5)
  })
})
