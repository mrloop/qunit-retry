export default class AssertResultHandler {
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

  pushResultFn (target) {
    return (result) => {
      this.lastResult = result
      if (!this.retry.shouldRetry) {
        result.message = this.retryMessage(result.message, this.retry.currentRun)
        target.pushResult(result)
      }
    }
  }
}
