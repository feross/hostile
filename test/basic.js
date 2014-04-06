var fs = require('fs')
var hostile = require('../')
var os = require('os')
var path = require('path')
var test = require('tape')

var TMP = os.tmpdir()
var TEST_HOSTS = path.join(TMP, 'hostile-hosts')

test('setup', function (t) {
  // copy hosts file to /tmp
  fs.createReadStream(hostile.HOSTS)
    .pipe(fs.createWriteStream(TEST_HOSTS))
    .on('close', function () {

      // monkey patch the `fs` module
      var _createReadStream = fs.createReadStream
      fs.createReadStream = function (filename) {
        var args = Array.prototype.slice.call(arguments, 0)
        if (filename === hostile.HOSTS) {
          args[0] = TEST_HOSTS
        }
        return _createReadStream.apply(fs, args)
      }
      var _createWriteStream = fs.createWriteStream
      fs.createWriteStream = function (filename) {
        var args = Array.prototype.slice.call(arguments, 0)
        if (filename === hostile.HOSTS) {
          args[0] = TEST_HOSTS
        }
        return _createWriteStream.apply(fs, args)
      }

      t.pass('setup complete')
      t.end()
    })
    .on('error', function (err) {
      t.fail(err.message)
    })
})

test('set', function (t) {
  t.plan(3)
  hostile.set('127.0.0.1', 'peercdn.com', function (err) {
    t.error(err)
    hostile.get(false, function (err, lines) {
      t.error(err)
      lines.forEach(function (line) {
        if (line[0] === '127.0.0.1' && line[1] === 'peercdn.com') {
          t.pass('set worked')
        }
      })
    })
  })
})

test('remove', function (t) {
  t.plan(2)
  hostile.remove('127.0.0.1', 'peercdn.com', function (err) {
    t.error(err)
    hostile.get(false, function (err, lines) {
      t.error(err)
      lines.forEach(function (line) {
        if (line[0] === '127.0.0.1' && line[1] === 'peercdn.com') {
          t.fail('remove failed')
        }
      })
    })
  })
})
