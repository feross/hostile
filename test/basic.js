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
      var functions = ['createReadStream', 'createWriteStream', 'readFileSync', 'writeFileSync']
      functions.forEach(function (name) {
        var _func = fs[name]
        fs[name] = function (filename) {
          var args = Array.prototype.slice.call(arguments, 0)
          if (filename === hostile.HOSTS) {
            args[0] = TEST_HOSTS
          }
          return _func.apply(fs, args)
        }
      })

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

test('set ipv6', function (t) {
  t.plan(4)
  hostile.set('::1', 'peercdn.com', function (err) {
    t.error(err)
    hostile.get(false, function (err, lines) {
      t.error(err)
      var exists = lines.some(function (line) {
        return line[0] === '::1' && line[1] === 'peercdn.com'
      })
      t.ok(exists, 'ipv6 line was added')
      exists = lines.some(function (line) {
        return line[0] === '127.0.0.1' && line[1] === 'peercdn.com'
      })
      t.ok(exists, 'ipv4 line still exists & was not replaced')
    })
  })
})

test('remove ipv4', function (t) {
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

test('remove ipv6', function (t) {
  t.plan(2)
  hostile.remove('::1', 'peercdn.com', function (err) {
    t.error(err)
    hostile.get(false, function (err, lines) {
      t.error(err)
      lines.forEach(function (line) {
        if (line[0] === '::1' && line[1] === 'peercdn.com') {
          t.fail('remove failed')
        }
      })
    })
  })
})

test('set and get space-separated domains', function (t) {
  t.plan(3)
  hostile.set('127.0.0.5', 'www.peercdn.com  m.peercdn.com', function (err) {
    t.error(err)
    hostile.get(false, function (err, lines) {
      t.error(err)
      var exists = lines.some(function (line) {
        return line[0] === '127.0.0.5' && line[1] === 'www.peercdn.com  m.peercdn.com'
      })
      t.ok(exists, 'host line exists')
    })
  })
})

test('concurrent async set', function (t) {
  t.plan(7)
  var completed = 0
  var hostnames = ['peercdn1.com', 'peercdn2.com', 'peercdn3.com']
  hostnames.forEach(function (hostname) {
    hostile.set('127.0.0.6', hostname, function (err) {
      t.error(err)
      completed++
      if (completed === 3) {
        hostile.get(false, function (err, lines) {
          t.error(err)
          lines.forEach(function (line) {
            if (line[0] === '127.0.0.6' && hostnames.indexOf(line[1]) > -1) {
              t.pass('set worked')
            }
          })
        })
      }
    })
  })
})

test('concurrent async remove', function (t) {
  t.plan(4)
  var completed = 0
  var hostnames = ['peercdn1.com', 'peercdn2.com', 'peercdn3.com']
  hostnames.forEach(function (hostname) {
    hostile.remove('127.0.0.6', hostname, function (err) {
      t.error(err)
      completed++
      if (completed === 3) {
        hostile.get(false, function (err, lines) {
          t.error(err)
          lines.forEach(function (line) {
            if (line[0] === '127.0.0.6' && hostnames.indexOf(line[1]) > -1) {
              t.fail('remove failed')
            }
          })
        })
      }
    })
  })
})
