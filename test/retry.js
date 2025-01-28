import setup from 'qunit-retry'
import QUnit from 'qunit'
const timeout = function (ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

const retry = setup(QUnit.test)

QUnit.module('test retries and result message', (hooks) => {
  const messages = []

  hooks.afterEach(function () {
    if (QUnit.config.current.assertions.length) {
      messages.push(QUnit.config.current.assertions[0].message)
    }
  })

  retry(
    'test retry five times',
    function (assert, currentRun) {
      assert.equal(currentRun, 5)
    },
    5
  )

  retry(
    'test retry five times with custom message',
    function (assert, currentRun) {
      assert.equal(currentRun, 5, 'should equal 5')
    },
    5
  )

  retry(
    'test stopping at 3 retries',
    function (assert, currentRun) {
      assert.equal(currentRun, 3)
    },
    5
  )

  retry(
    'test stopping at 3 retries with custom message',
    function (assert, currentRun) {
      assert.equal(currentRun, 3, 'should equal 3')
    },
    5
  )

  retry(
    'test stopping at 1 try',
    function (assert, currentRun) {
      assert.equal(currentRun, 1)
    },
    5
  )

  retry(
    'test stopping at 1 try with custom message',
    function (assert, currentRun) {
      assert.equal(currentRun, 1, 'should equal 1')
    }
  )

  QUnit.test('verify retries', function (assert) {
    assert.deepEqual(messages.slice(0, 6), [
      '(Tried 5 times)',
      'should equal 5\n(Tried 5 times)',
      '(Tried 3 times)',
      'should equal 3\n(Tried 3 times)',
      undefined,
      'should equal 1'
    ])
  })
})

retry(
  'test default: retry runs twice - initial attempt plus one retry',
  function (assert, currentRun) {
    assert.expect(1)
    assert.equal(currentRun, 2)
  }
)

retry(
  'test retry five times',
  function (assert, currentRun) {
    assert.expect(1)
    assert.equal(currentRun, 5)
  },
  5
)

retry(
  'test retry async',
  async function (assert, currentRun) {
    assert.expect(1)
    await timeout(100)
    assert.equal(currentRun, 4)
  },
  4
)

QUnit.module('error handling', function () {
  retry(
    'rejected promise is handled',
    async function (assert, currentRun) {
      if (currentRun === 2) {
        await Promise.reject(new Error('should be handled'))
      }
      assert.equal(currentRun, 5)
    },
    5
  )

  retry.todo(
    'rejected promise on the last try is is not handled',
    async function (assert, currentRun) {
      if (currentRun === 5) {
        await Promise.reject(new Error('should not be handled'))
      }
      assert.equal(currentRun, 5)
    },
    5
  )

  retry(
    'error is handled',
    async function (assert, currentRun) {
      if (currentRun === 2) {
        throw new Error('should be handled')
      }
      assert.equal(currentRun, 5)
    },
    5
  )

  retry.todo(
    'error on the last try is not handled',
    async function (assert, currentRun) {
      if (currentRun === 5) {
        throw new Error('should not be handled')
      }
      assert.equal(currentRun, 5)
    },
    5
  )

  retry(
    'failed assertion is handled',
    async function (assert, currentRun) {
      assert.equal(currentRun, 5)
      assert.ok(true)
    },
    5
  )

  retry.todo(
    'failed assertion on the last try is not handled',
    async function (assert, currentRun) {
      assert.ok(false)
      assert.ok(true)
    },
    5
  )
})

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

  retry(
    'count retries',
    function (assert, currentRun) {
      execCount = execCount + 1
      assert.equal(currentRun, 5)
    },
    5
  )

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

    retry(
      'count retries',
      function (assert, currentRun) {
        execCount++
        assert.equal(
          beforeCount,
          currentRun,
          'beforeCount should match currentRun'
        )
        assert.equal(
          afterCount,
          currentRun - 1,
          'afterCount one less than currentRun'
        )
        assert.equal(currentRun, 5)
      },
      5
    )
  })

  QUnit.test('test hooks count', function (assert) {
    assert.equal(execCount, 5)
    assert.equal(beforeCount, 5)
    assert.equal(afterCount, 5)
  })
})

QUnit.module('default max runs', function () {
  const calls = []
  const retryThrice = setup(QUnit.test, { maxRuns: 3 })

  retryThrice('count retries', function (assert, currentRun) {
    calls.push(currentRun)

    assert.equal(currentRun, 3)
  })

  QUnit.test('verify calls', function (assert) {
    assert.deepEqual(calls, [1, 2, 3])
  })
})

QUnit.module('beforeRetry hook', function () {
  const calls = []
  const retryWithHook = setup(QUnit.test, {
    beforeRetry: function (assert, currentRun) {
      calls.push(['hook', currentRun])
    }
  })

  retryWithHook(
    'count retries',
    function (assert, currentRun) {
      calls.push(['test', currentRun])

      assert.equal(currentRun, 2)
    },
    2
  )

  QUnit.test('verify calls', function (assert) {
    assert.deepEqual(calls, [
      ['test', 1],
      ['hook', 2],
      ['test', 2]
    ])
  })
})

QUnit.module('assert.expect', function () {
  const calls = []

  retry(
    'should pass with retries',
    function (assert, currentRun) {
      calls.push(['with', currentRun])

      assert.expect(3)
      assert.ok(true)
      if (currentRun === 1) {
        throw new Error('fail')
      }
      assert.ok(true)
      if (currentRun === 2) {
        throw new Error('fail')
      }
      assert.ok(true)
    },
    3
  )

  retry('should pass without retries', function (assert, currentRun) {
    calls.push(['without', currentRun])

    assert.expect(2)
    assert.ok(true)
    assert.ok(true)
  })

  retry.todo('should fail with incorrect count', function (assert, currentRun) {
    calls.push(['incorrect', currentRun])

    assert.expect(2)
    assert.ok(true)
    if (currentRun === 1) {
      throw new Error('fail')
    }
  })

  QUnit.test('verify calls', function (assert) {
    assert.deepEqual(calls, [
      ['with', 1],
      ['with', 2],
      ['with', 3],
      ['without', 1],
      ['incorrect', 1],
      ['incorrect', 2]
    ])
  })
})

QUnit.module('assert.throws', function () {
  const calls = []

  retry('count retries', function (assert, currentRun) {
    calls.push(currentRun)

    assert.throws(() => {
      if (currentRun === 2) throw new Error('fail')
    })
  })

  QUnit.test('verify calls', function (assert) {
    assert.deepEqual(calls, [1, 2])
  })
})

QUnit.module('retry.todo', function () {
  const calls = []

  retry.todo('count retries', function (assert, currentRun) {
    calls.push(currentRun)

    assert.ok(false)
  })

  QUnit.test('verify calls', function (assert) {
    assert.deepEqual(calls, [1, 2])
  })
})

QUnit.module('retry.skip', function () {
  const calls = []

  retry.skip('count retries', function (assert, currentRun) {
    calls.push(currentRun)

    assert.equal(currentRun, 2)
  })

  QUnit.test('verify calls', function (assert) {
    assert.deepEqual(calls, [])
  })
})

QUnit.module('retry.if', function () {
  const calls = []

  retry.if('count true retries', true, function (assert, currentRun) {
    calls.push([true, currentRun])

    assert.equal(currentRun, 2)
  })

  retry.if('count false retries', false, function (assert, currentRun) {
    calls.push([false, currentRun])

    assert.equal(currentRun, 2)
  })

  QUnit.test('verify calls', function (assert) {
    assert.deepEqual(calls, [
      [true, 1],
      [true, 2]
    ])
  })
})

QUnit.module('retry.each', function () {
  const calls = []

  retry.each(
    'count retries',
    ['A', 'B', 'C'],
    function (assert, data, currentRun) {
      calls.push([data, currentRun])

      assert.equal(currentRun, 2)
    }
  )

  QUnit.test('verify calls', function (assert) {
    assert.deepEqual(calls, [
      ['A', 1],
      ['A', 2],
      ['B', 1],
      ['B', 2],
      ['C', 1],
      ['C', 2]
    ])
  })
})

QUnit.module('retry.todo.each', function () {
  const calls = []

  retry.todo.each(
    'count retries',
    ['A', 'B', 'C'],
    function (assert, data, currentRun) {
      calls.push([data, currentRun])

      assert.ok(false)
    }
  )

  QUnit.test('verify calls', function (assert) {
    assert.deepEqual(calls, [
      ['A', 1],
      ['A', 2],
      ['B', 1],
      ['B', 2],
      ['C', 1],
      ['C', 2]
    ])
  })
})

QUnit.module('retry.skip.each', function () {
  const calls = []

  retry.skip.each(
    'count retries',
    ['A', 'B', 'C'],
    function (assert, data, currentRun) {
      calls.push([data, currentRun])

      assert.equal(currentRun, 2)
    }
  )

  QUnit.test('verify calls', function (assert) {
    assert.deepEqual(calls, [])
  })
})

QUnit.module('retry.if.each', function () {
  const calls = []

  retry.if.each(
    'count true retries',
    true,
    ['A', 'B'],
    function (assert, data, currentRun) {
      calls.push([true, data, currentRun])

      assert.equal(currentRun, 2)
    }
  )

  retry.if.each(
    'count false retries',
    false,
    ['A', 'B'],
    function (assert, data, currentRun) {
      calls.push([false, data, currentRun])

      assert.equal(currentRun, 2)
    }
  )

  QUnit.test('verify calls', function (assert) {
    assert.deepEqual(calls, [
      [true, 'A', 1],
      [true, 'A', 2],
      [true, 'B', 1],
      [true, 'B', 2]
    ])
  })
})
