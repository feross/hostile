#!/usr/bin/env node

var chalk = require('chalk')
var hostile = require('../')
var omelette = require('omelette')
var program = require('commander')

var IP_RE = /^(([1-9]?\d|1\d\d|2[0-5][0-5]|2[0-4]\d)\.){3}([1-9]?\d|1\d\d|2[0-5][0-5]|2[0-4]\d)$/

var complete = omelette('hostile <action> <host>')

/**
 * Set up auto completion
 */
complete.on('action', function () {
  return this.reply(['list', 'set', 'remove'])
})

complete.on('host', function (action) {
  if (action === 'set') {
    return this.reply(['localhost'])
  }
})

complete.init()


/**
 * Set up command parameters
 */
program
  .command('list')
  .description('List all current domain records in hosts file')
  .action(list)

program
  .command('set [ip] [host]')
  .description('Set a domain in the hosts file')
  .action(set)

program
  .command('remove [domain]')
  .description('Remove a domain from the hosts file')
  .action(remove)

// process application arguments
program.parse(process.argv)

/**
 * If no args are given display help
 */
if (!program.args.length) {
  program.help()
}

/**
 * Display all current ip records
 */
function list () {
  hostile.get(false, function (err, lines) {
    if (err) {
      return error(err.message)
    }
    lines.forEach(function (item) {
      if (item.length > 1) {
        console.log(item[0], chalk.green(item[1]))
      } else {
        console.log(item)
      }
    })
  })
}

/**
 * Set a new host
 * @param {string} ip
 * @param {string} host
 */
function set (ip, host) {
  if (!ip || !host) {
    return error('Invalid syntax: hostile set <ip> <host>')
  }

  if (ip === 'local' || ip === 'localhost') {
    ip = '127.0.0.1'
  } else if (!IP_RE.test(ip)) {
    return error('Invalid IP address')
  }

  hostile.set(ip, host, function (err) {
    if (err) {
      return error('Error: ' + err.message + '. Are you running as root?')
    }
    console.log(chalk.green('Added ' + host))
  })
}

/**
 * Remove a host
 * @param {string} host
 */
function remove (host) {
  hostile.get(false, function (err, lines) {
    lines.forEach(function (item) {
      if (item[1].indexOf(host) > -1) {
        hostile.remove(item[0], host, function (err) {
          if (err) {
            return error(err.message)
          }
          console.log(chalk.green('Removed ' + host))
        })
        return
      }
    })
  })
}

/**
 * Print an error and exit the program
 * @param {string} message
 */
function error (message) {
  console.error(chalk.red(message))
  process.exit(-1)
}
