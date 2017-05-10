var fs = require('fs')
var once = require('once')
var split = require('split')
var through = require('through')
var net = require('net')

var WINDOWS = process.platform === 'win32'
var EOL = WINDOWS
  ? '\r\n'
  : '\n'

exports.HOSTS = WINDOWS
  ? 'C:/Windows/System32/drivers/etc/hosts'
  : '/etc/hosts'

  /**
   * Get a list of the lines that make up the filePath. If the
   * `preserveFormatting` parameter is true, then include comments, blank lines
   * and other non-host entries in the result.
   *
   * @param  {boolean}   preserveFormatting
   * @param  {function(err, lines)=} cb
   */

exports.getFile = function (filePath, preserveFormatting, cb) {
  var lines = []
  if (typeof cb !== 'function') {
    fs.readFileSync(filePath, { encoding: 'utf8' }).split(/\r?\n/).forEach(online)
    return lines
  }

  cb = once(cb)
  fs.createReadStream(filePath, { encoding: 'utf8' })
    .pipe(split())
    .pipe(through(online))
    .on('close', function () {
      cb(null, lines)
    })
    .on('error', cb)

  function online (line) {
    // Remove all comment text from the line
    var lineSansComments = line.replace(/#.*/, '')
    var matches = /^\s*?(.+?)\s+(.+?)\s*$/.exec(lineSansComments)
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
  }
}

/**
 * Wrapper of `getFile` for getting a list of lines in the Host file
 *
 * @param  {boolean}   preserveFormatting
 * @param  {function(err, lines)=} cb
 */
exports.get = function (preserveFormatting, cb) {
  return exports.getFile(exports.HOSTS, preserveFormatting, cb)
}

/**
 * Add a rule to /etc/hosts. If the rule already exists, then this does nothing.
 *
 * @param  {string}   ip
 * @param  {string}   host
 * @param  {function(Error)=} cb
 */
exports.set = function (ip, host, cb) {
  var didUpdate = false
  if (typeof cb !== 'function') {
    return _set(exports.get(true))
  }

  exports.get(true, function (err, lines) {
    if (err) return cb(err)
    _set(lines)
  })

  function _set (lines) {
    // Try to update entry, if host already exists in file
    lines = lines.map(mapFunc)

    // If entry did not exist, let's add it
    if (!didUpdate) {
      // If the last line is empty, or just whitespace, then insert the new entry
      // right before it
      var lastLine = lines[lines.length - 1]
      if (typeof lastLine === 'string' && /\s*/.test(lastLine)) {
        lines.splice(lines.length - 1, 0, [ip, host])
      } else {
        lines.push([ip, host])
      }
    }

    exports.writeFile(lines, cb)
  }

  function mapFunc (line) {
    // replace a line if both hostname and ip version of the address matches
    if (Array.isArray(line) && line[1] === host && net.isIP(line[0]) === net.isIP(ip)) {
      line[0] = ip
      didUpdate = true
    }
    return line
  }
}

/**
 * Remove a rule from /etc/hosts. If the rule does not exist, then this does
 * nothing.
 *
 * @param  {string}   ip
 * @param  {string}   host
 * @param  {function(Error)=} cb
 */
exports.remove = function (ip, host, cb) {
  if (typeof cb !== 'function') {
    return _remove(exports.get(true))
  }

  exports.get(true, function (err, lines) {
    if (err) return cb(err)
    _remove(lines)
  })

  function _remove (lines) {
    // Try to remove entry, if it exists
    lines = lines.filter(filterFunc)
    return exports.writeFile(lines, cb)
  }

  function filterFunc (line) {
    return !(Array.isArray(line) && line[0] === ip && line[1] === host)
  }
}

/**
 * Write out an array of lines to the host file. Assumes that they're in the
 * format that `get` returns.
 *
 * @param  {Array.<string|Array.<string>>} lines
 * @param  {function(Error)=} cb
 */
exports.writeFile = function (lines, cb) {
  lines = lines.map(function (line, lineNum) {
    if (Array.isArray(line)) {
      line = line[0] + ' ' + line[1]
    }
    return line + (lineNum === lines.length - 1 ? '' : EOL)
  })

  if (typeof cb !== 'function') {
    var stat = fs.statSync(exports.HOSTS)
    fs.writeFileSync(exports.HOSTS, lines.join(''), { mode: stat.mode })
    return true
  }

  cb = once(cb)
  fs.stat(exports.HOSTS, function (err, stat) {
    if (err) {
      return cb(err)
    }
    var s = fs.createWriteStream(exports.HOSTS, { mode: stat.mode })
    s.on('close', cb)
    s.on('error', cb)

    lines.forEach(function (data) {
      s.write(data)
    })
    s.end()
  })
}
