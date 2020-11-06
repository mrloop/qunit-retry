retry('test default retry twice', function (assert, currentRun) {
  assert.expect(1)
  assert.equal(currentRun, 2)
})
