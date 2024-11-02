qunit-retry
==============================================================================

[![Latest NPM release][npm-badge]][npm-badge-url]
[![CI](https://github.com/mrloop//qunit-retry/workflows/CI/badge.svg)](https://github.com/mrloop/qunit-retry/actions)

[npm-badge]: https://img.shields.io/npm/v/qunit-retry.svg
[npm-badge-url]: https://www.npmjs.com/package/qunit-retry

Drop in replacement for [QUnit](https://qunitjs.com/) [test](https://api.qunitjs.com/QUnit/test) to `retry` test upon failure.

```js
// retry this test on failure as third party service occasionally fails
// we need to test against third party service
// we can live with occasional third party service failure
retry("a test relying on 3rd party service that occasionally fails", async function(assert) {
  var result = await occasionallyFailingServiceTestResult();
  assert.equal(result, 42);
});
```

Use very sparingly, for a suite of 2024 tests, using this for a single acceptance test.

Blog post about `qunit-retry` available [here](https://blog.mrloop.com/javascript/2019/02/26/qunit-retry.html).

### Set Max Runs

To change the number of retries, set a value in the third parameter (`maxRuns`). The default value for `maxRuns` is `2` (one attempt and one retry):

```js
// retry this test **two times** (in addition to one initial attempt)
// on failure as third party service occasionally fails
// we need to test against third party service
// we can live with occasional third party service failure
retry("a test relying on 3rd party service that occasionally fails", async function(assert) {
  var result = await occasionallyFailingServiceTestResult();
  assert.equal(result, 42);
}, 3);
```

**Note:** It is generally advised to use the retry sparingly and this advice extends to setting a large number of retries.

Install
------------------------------------------------------------------------------

### npm

```bash
npm install --save-dev qunit-retry
```

or using [`yarn`](https://yarnpkg.com/):

```bash
yarn add --dev qunit-retry
```

or using [`pnpm`](https://pnpm.js.org/):

```bash
pnpm add --save-dev qunit-retry
```


### Node

```js
const setup = require('qunit-retry');

const retry = setup(QUnit.test);
```

### Directly in browser

```html
<script src="//code.jquery.com/qunit/qunit-2.9.3.js"></script>

<script type="module">
  import setup from 'https://unpkg.com/qunit-retry/main.js'

  const retry = setup(QUnit.test)

  retry("a test relying on 3rd party service that occasionally fails", async function(assert) {
    var result = await occasionallyFailingServiceTestResult();
    assert.equal(result, 42);
  });
</script>
```

Contributing
------------------------------------------------------------------------------

### How to Run Tests

```bash
pnpm test
```

### How to Run Linting

```bash
pnpm lint
```

License
------------------------------------------------------------------------------

qunit-retry is developed by and &copy;
[mrloop](http://mrloop.com) and contributors. It is released under the
[ISC License](https://github.com/mrloop/qunit-retry/blob/master/LICENSE.md).

