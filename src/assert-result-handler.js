export default class AssertResultHandler {
  constructor (retryObj) {
    this.retry = retryObj
    this.isSuccess = true
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

  pushResultFn (target) {
    return (result) => {
      this.isSuccess = this.isSuccess && result.result
      if (!this.retry.shouldRetry) {
        result.message = this.retryMessage(result.message, this.retry.currentRun)
        target.pushResult(result)
      }
    }
  }
}
