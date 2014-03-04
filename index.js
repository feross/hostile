/** global chrome */

var fs = require('fs')
var split = require('split')
var through = require('through')

const WINDOWS = (process.platform === 'win32')
const EOL = WINDOWS ? '\r\n' : '\n'
const HOSTS = WINDOWS ? 'C:/Windows/System32/drivers/etc/hosts' : '/etc/hosts'

/**
 * Get a list of the lines that make up the /etc/hosts file. If the
 * `preserveFormatting` parameter is true, then include comments, blank lines
 * and other non-host entries in the result.
 *
 * @param  {boolean}   preserveFormatting
 * @param  {function(err, lines)} cb
 */
exports.get = function (preserveFormatting, cb) {
  var lines = []
  fs.createReadStream(HOSTS, 'utf8')
    .pipe(split())
    .pipe(through(function (line) {
      var matches = /^\s*?([^#]+?)\s+([^#]+?)$/.exec(line)
      if (matches && matches.length === 3) {
        // Found a hosts entry
        var ip = matches[1]
        var host = matches[2]
        lines.push([ip, host])
      } else {
        // Found a comment, blank line, or something else
        if (preserveFormatting) {
          lines.push(line)
        }
      }
    }))
    .on('close', function () {
      cb(null, lines)
    })
    .on('error', cb)
}

/**
 * Add a rule to /etc/hosts. If the rule already exists, then this does nothing.
 *
 * @param  {string}   ip
 * @param  {string}   host
 * @param  {function(Error)} cb
 */
exports.set = function (ip, host, cb) {
  exports.get(true, function (err, lines) {

    // Try to update entry, if host already exists in file
    var didUpdate = false
    lines = lines.map(function (line) {
      if (Array.isArray(line) && line[1] === host) {
        line[0] = ip
        didUpdate = true
      }
      return line
    })

    // If entry did not exist, let's add it
    if (!didUpdate) {
      lines.push([ip, host])
    }

    exports.writeFile(lines, cb)
  })
}

/**
 * Remove a rule from /etc/hosts. If the rule does not exist, then this does
 * nothing.
 *
 * @param  {string}   ip
 * @param  {string}   host
 * @param  {function(Error)} cb
 */
exports.remove = function (ip, host, cb) {
  exports.get(true, function (err, lines) {

    // Try to remove entry, if it exists
    lines = lines.filter(function (line) {
      return !(Array.isArray(line) && line[0] === ip && line[1] === host)
    })

    exports.writeFile(lines, cb)
  })
}

/**
 * Write out an array of lines to the host file. Assumes that they're in the
 * format that `get` returns.
 *
 * @param  {Array.<string|Array.<string>>} lines
 * @param  {function(Error)} cb
 */
exports.writeFile = function (lines, cb) {
  fs.stat(HOSTS, function (err, stat) {
    if (err) {
      cb(err)
    } else {
      var s = fs.createWriteStream(HOSTS, { mode: stat.mode })
      s.on('close', cb)
      s.on('error', cb)

      lines.forEach(function (line, lineNum) {
        if (Array.isArray(line)) {
          line = line[0] + ' ' + line[1]
        }
        s.write(line + (lineNum === lines.length - 1 ? '' : EOL))
      })
      s.end()
    }
  })
}
