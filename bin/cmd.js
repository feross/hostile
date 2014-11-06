#!/usr/bin/env node

var chalk = require('chalk')
var hostile = require('../')
var minimist = require('minimist')

var IP_RE = /^(([1-9]?\d|1\d\d|2[0-5][0-5]|2[0-4]\d)\.){3}([1-9]?\d|1\d\d|2[0-5][0-5]|2[0-4]\d)$/

var argv = minimist(process.argv.slice(2))

var command = argv._[0]

if (command === 'list' || command === 'ls') list()
if (command === 'set') set(argv._[1], argv._[2])
if (command === 'remove') remove(argv._[1])
if (!command) help()

/**
 * Print help message
 */
function help () {
  console.log(function () {/*
  Usage: hostile [command]

    Commands:

      list                   List all current domain records in hosts file
      set [ip] [host]        Set a domain in the hosts file
      remove [domain]        Remove a domain from the hosts file

    */}.toString().split(/\n/).slice(1, -1).join('\n'))
}

/**
 * Display all current ip records
 */
function list () {
  hostile.get(false).forEach(function (item) {
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
  } else if (!IP_RE.test(ip)) {
    return error('Invalid IP address')
  }

  hostile.set(ip, host)
  console.log(chalk.green('Added ' + host))
}

/**
 * Remove a host
 * @param {string} host
 */
function remove (host) {
  hostile.get(false).forEach(function (item) {
    if (item[1].indexOf(host) > -1) {
      hostile.remove(item[0], host)
      console.log(chalk.green('Removed ' + host))
    }
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
