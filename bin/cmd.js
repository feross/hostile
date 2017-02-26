#!/usr/bin/env node

var chalk = require('chalk')
var hostile = require('../')
var minimist = require('minimist')
var net = require('net')

var argv = minimist(process.argv.slice(2))

var command = argv._[0]

if (command === 'list' || command === 'ls') list()
if (command === 'set') set(argv._[1], argv._[2])
if (command === 'remove') remove(argv._[1])
if (command === 'load') load(argv._[1])
if (command === 'unload') unload(argv._[1])
if (!command) help()

/**
 * Print help message
 */
function help () {
  console.log(function () { /*
  Usage: hostile [command]

    Commands:

      list                   List all current domain records in hosts file
      set [ip] [host]        Set a domain in the hosts file
      remove [domain]        Remove a domain from the hosts file
      load [file]            Load a set of host entries from a file
      unload [file]          Remove a set of host entries from a file

  */ }.toString().split(/\n/).slice(1, -1).join('\n'))
}

/**
 * Display all current ip records
 */
function list () {
  var lines
  try {
    lines = hostile.get(false)
  } catch (err) {
    return error(err)
  }
  lines.forEach(function (item) {
    if (item.length > 1) {
      console.log(item[0], chalk.green(item[1]))
    } else {
      console.log(item)
    }
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
  } else if (!net.isIP(ip)) {
    return error('Invalid IP address')
  }

  try {
    hostile.set(ip, host)
  } catch (err) {
    return error('Error: ' + err.message + '. Are you running as root?')
  }
  console.log(chalk.green('Added ' + host))
}

/**
 * Remove a host
 * @param {string} host
 */
function remove (host) {
  var lines
  try {
    lines = hostile.get(false)
  } catch (err) {
    return error(err)
  }
  lines.forEach(function (item) {
    if (item[1] === host) {
      try {
        hostile.remove(item[0], host)
      } catch (err) {
        return error('Error: ' + err.message + '. Are you running as root?')
      }
      console.log(chalk.green('Removed ' + host))
    }
  })
}

/**
 * Load hosts given a file
 * @param {string} filePath
 */
function load (filePath) {
  var lines = parseFile(filePath)

  lines.forEach(function (item) {
    set(item[0], item[1])
  })
  console.log(chalk.green('\nAdded %d hosts!'), lines.length)
}

/**
 * Remove hosts given a file
 * @param {string} filePath
 */
function unload (filePath) {
  var lines = parseFile(filePath)

  lines.forEach(function (item) {
    remove(item[1])
  })
  console.log(chalk.green('Removed %d hosts!'), lines.length)
}

/**
 * Get all the lines of the file as array of arrays [[IP, host]]
 * @param {string} filePath
 */
function parseFile (filePath) {
  var lines
  try {
    lines = hostile.getFile(filePath, false)
  } catch (err) {
    return error(err)
  }
  return lines
}

/**
 * Print an error and exit the program
 * @param {string} message
 */
function error (err) {
  console.error(chalk.red(err.message || err))
  process.exit(-1)
}
