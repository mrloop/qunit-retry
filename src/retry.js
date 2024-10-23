import AssertResultHandler from './assert-result-handler.js'
import extend from './extend.js'

export default class Retry {
  constructor (name, callback, maxRuns = 2, testFn) {
    this.name = name
    this.callback = callback
    this.maxRuns = maxRuns
    this.currentRun = 1
    this.assertResultHandler = new AssertResultHandler(this)

    testFn(name, async (assert) => {
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
      this.test.testEnvironment = extend({}, this.test.module.testEnvironment, false, true)
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
