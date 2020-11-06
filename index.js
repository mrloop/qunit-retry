// https://github.com/umdjs/umd/ - returnExports
(function (root, factory) {
  /* global define, QUnit */
  if (typeof define === 'function' && define.amd) {
    if (QUnit) { // if QUnit already globally defined
      // https://github.com/karma-runner/karma-qunit/issues/57
      define('qunit', [], function () {
        return QUnit
      })
    };
    // AMD. Register as an anonymous module, that depends on qunit
    define(['qunit'], factory)
  } else if (typeof module === 'object' && module.exports) {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like environments that support module.exports,
    // like Node.
    module.exports = factory(require('qunit'))
  } else {
    // Browser globals (root is window)
    root.returnExports = root.retry = factory(root.QUnit)
  }
}(typeof self !== 'undefined' ? self : this, function (qunit) {
  class Retry {
    constructor (name, callback, maxRuns) {
      this.name = name
      this.callback = callback
      this.maxRuns = maxRuns
      this.currentRun = 1

      qunit.test(name, async (assert) => {
        this.assert = assert
        await this.retry(1)
      })
    }

    get shouldRetry () {
      return this.currentRun < this.maxRuns && (!this.result || !this.result.result)
    }

    get test () {
      return this.assert.test
    }

    get module () {
      return this.test.module
    }

    get testEnvironment () {
      return this.test.testEnvironment
    }

    get beforeEachHooks () {
      return this.hooksFor(this.module, 'beforeEach')
    }

    get afterEachHooks () {
      return this.hooksFor(this.module, 'afterEach')
    }

    get notFirstRun () {
      return this.currentRun > 1
    }

    hooksFor (module, handler) {
      let hooks = []
      if (module.parentModule) {
        hooks = hooks.concat(this.hooksFor(module.parentModule, handler))
      }
      return hooks.concat(module.hooks[handler])
    }

    async runHooks (hooks) {
      for (const hook of hooks) {
        await hook.call(this.testEnvironment, this.assert)
      }
    }

    async runTest () {
      if (this.notFirstRun) {
        await this.runHooks(this.beforeEachHooks)
      }
      await this.bufferResult()
      // only run afterEach hooks if going to retry test
      if (this.shouldRetry) {
        await this.runHooks(this.afterEachHooks.reverse())
      }
    }

    async bufferResult () {
      const original = this.assert.pushResult
      this.assert.pushResult = (r) => { this.result = r }
      try {
        await this.callback.call(this.testEnvironment, this.assert, this.currentRun)
      } catch (err) {
        if (!this.shouldRetry) {
          throw err
        }
      }
      this.assert.pushResult = original
    }

    get resultWithRetryMessage () {
      const message = this.result.message ? this.result.message + '\n' : ''
      this.result.message = message + '(Retried ' + this.maxRuns + ' times)'
      return this.result
    }

    async retry () {
      await this.runTest()
      if (this.shouldRetry) {
        this.currentRun++
        await this.retry()
      } else {
        this.assert.pushResult(this.resultWithRetryMessage)
      }
    }
  }

  return function (name, callback, maxRuns = 2) {
    return new Retry(name, callback, maxRuns)
  }
}))
