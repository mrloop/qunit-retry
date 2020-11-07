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
