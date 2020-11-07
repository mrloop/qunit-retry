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
  class AssertResultHandler {
    constructor (retryObj) {
      this.retry = retryObj
    }

    get (target, prop, receiver) {
      if (prop === 'pushResult') {
        return this.pushResultFn(target)
      }
      return Reflect.get(target, prop, receiver)
    }

    retryMessage (message, retryNum) {
      message = message ? message + '\n' : ''
      return `${message}(Retried ${retryNum} times)`
    }

    get isSuccess () {
      return this.lastResult && this.lastResult.result
    }

    noop () {}

    pushResultFn (target) {
      return (result) => {
        this.lastResult = result
        if (this.retry.shouldRetry) {
          return this.noop
        } else {
          result.message = this.retryMessage(result.message, this.retry.currentRun)
          target.pushResult(result)
        }
      }
    }
  }

  class Retry {
    constructor (name, callback, maxRuns) {
      this.name = name
      this.callback = callback
      this.maxRuns = maxRuns
      this.currentRun = 1
      this.assertResultHandler = new AssertResultHandler(this)

      qunit.test(name, async (assert) => {
        this.assertProxy = new Proxy(assert, this.assertResultHandler)
        await this.retry(this.currentRun)
      })
    }

    get shouldRetry () {
      return this.currentRun < this.maxRuns && !this.assertResultHandler.isSuccess
    }

    get test () {
      return this.assertProxy.test
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
        await hook.call(this.testEnvironment, this.assertProxy)
      }
    }

    async runTest () {
      if (this.notFirstRun) {
        await this.runHooks(this.beforeEachHooks)
      }
      await this.tryTest()
      // only run afterEach hooks if going to retry test
      if (this.shouldRetry) {
        await this.runHooks(this.afterEachHooks.reverse())
      }
    }

    async tryTest () {
      try {
        await this.callback.call(this.testEnvironment, this.assertProxy, this.currentRun)
      } catch (err) {
        if (!this.shouldRetry) {
          throw err
        }
      }
    }

    async retry () {
      await this.runTest()
      if (this.shouldRetry) {
        this.currentRun++
        await this.retry()
      }
    }
  }

  return function (name, callback, maxRuns = 2) {
    return new Retry(name, callback, maxRuns)
  }
}))
