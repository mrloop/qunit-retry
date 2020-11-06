QUnit.module('test retries and result message', hooks => {
  hooks.after(assert => {
    assert.equal(QUnit.config.current.assertions[0].message, '(Retried 6 times)', 'message shows retries')
  })

  retry('test default retry six times', function (assert, currentRun) {
    assert.equal(currentRun, 6)
  }, 6)
})
