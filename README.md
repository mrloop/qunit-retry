qunit-retry
==============================================================================

[![TravisCI Build Status][travis-badge]][travis-badge-url]
[![Latest NPM release][npm-badge]][npm-badge-url]

[npm-badge]: https://img.shields.io/npm/v/qunit-retry.svg
[npm-badge-url]: https://www.npmjs.com/package/qunit-retry
[travis-badge]: https://img.shields.io/travis/com/mrloop/qunit-retry/master.svg
[travis-badge-url]: https://travis-ci.com/mrloop/qunit-retry

Drop in replacement for [QUnit](https://qunitjs.com/) [test](https://api.qunitjs.com/QUnit/test) to `retry` test upon failure.

```js
// retry this test on failure as third party service occasionally fails
// we need to test against third party service
// we can live with occasional third party service failure
retry("a test relying on 3rd party service that occassionaly fails", function(assert) {
  var result = occasionallyFailingServiceTestResult();
  assert.equal(result, 42);
});
```

Use very sparingly, for a suite of 2024 tests, using this for a single acceptance test.


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


Contributing
------------------------------------------------------------------------------

### How to Run Tests

```bash
npm test
```

License
------------------------------------------------------------------------------

qunit-retry is developed by and &copy;
[mrloop](http://mrloop.com) and contributors. It is released under the
[ISC License](https://github.com/mrloop/qunit-retry/blob/master/LICENSE.md).

