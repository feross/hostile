#!/usr/bin/env node

var chalk = require('chalk')
var hostile = require('../')
var minimist = require('minimist')
var inquirer = require('inquirer')
var net = require('net')
var fs = require('fs')

var argv = minimist(process.argv.slice(2))

var command = argv._[0]

if (command === 'list' || command === 'ls') list()
if (command === 'set') set(argv._[1], argv._[2])
if (command === 'remove') remove(argv._[1])
if (command === 'load') load(argv._[1])
if (command === 'unload') unload(argv._[1])
if (command === 'i' || command === 'interactive') interactive()
if (!command) help()

function interactive () {
  const sets = fs.readdirSync('./sets/').map(file => {
    return {
      name: file,
      checked: false
    }
  })

  function interactiveInternal () {
    console.log('\u001b[2J\u001b[0;0H')
    list()
    inquirer.prompt({
      type: 'checkbox',
      message: 'Choose a set of entries',
      name: 'sets',
      choices: sets.map(function (c) {
        return {name: c.name, value: c.name, checked: c.checked}
      })
    }).then(function (selections) {
      sets.forEach(function (set) {
        set.checked = selections.sets.includes(set.name)
        if (set.checked) {
          load('./sets/' + set.name)
        } else {
          unload('./sets/' + set.name)
        }
      })
      // console.log(sets)
      interactiveInternal()
    })
  }
  interactiveInternal()
}

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
    if (item.length > 1 && item[1] !== 'localhost' && item[1] !== 'broadcasthost') {
      console.log(item[0], chalk.green(item[1]))
    } else {
      // console.log(item)
    }
  })
  console.log('\n')
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
  // console.log(chalk.green('\nAdded %d hosts!'), lines.length)
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
  // console.log(chalk.green('Removed %d hosts!'), lines.length)
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
