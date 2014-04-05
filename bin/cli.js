#!/usr/bin/env node

var hostile = require('../'),
    program = require('commander'),
    colors = require('colors'),
    omelette = require("omelette"),
    ipRegex = /^(([1-9]?\d|1\d\d|2[0-5][0-5]|2[0-4]\d)\.){3}([1-9]?\d|1\d\d|2[0-5][0-5]|2[0-4]\d)$/,
    complete = omelette("hostile <action> <host>");


/**
 * Set up auto completion
 */
complete.on('action', function () {
    return this.reply(['list', 'set', 'remove']);
});

complete.on('host', function(action) {
    if (action === 'set') {
        return this.reply(['localhost']);
    }
});

complete.init();


/**
 * Set up command parameters
 */
program
    .command('list')
    .description('List all current domain records in hosts file')
    .action(list);

program
    .command('set [ip] [host]')
    .description('Set a domain in the hosts file')
    .action(set);

program
    .command('remove [domain]')
    .description('Remove a domain from the hosts file')
    .action(remove);

// process application arguments
program.parse(process.argv);

/**
 * If no args are given display help
 */
if (!program.args.length) {
    program.help();
}

/**
 * Display all current ip records
 */
function list() {
    hostile.get(false, function (err, lines) {
        lines.forEach(function (item) {
            if (item.length > 1) {
                console.log(item[0],item[1].green);
            } else {
                console.log(item);
            }

        });
    });
}

/**
 * Set a new host
 */
function set(ip, host) {
    if (!ip || !host) {
        console.log('Invalid syntax: hostile set ip host');
        return;
    }

    if (ip === 'local' || ip === 'localhost') {
        ip = '127.0.0.1';
    } else {
        if (!ipRegex.test(ip)) {
            console.log('Invalid IP address');
            return;
        }
    }

    hostile.set(ip, host, function (err) {
        if (err) {
            console.log('Error: ' + err);
            return;
        }
        console.log('added ' + host);
    });
}

/**
 * Remove a host
 */
function remove(host) {
    hostile.get(false, function (err, lines) {
        lines.forEach(function (item) {
            if (item[1].indexOf(host) > -1) {
                console.log(item[1]);
                hostile.remove(item[0], host, function(err) {
                    if (err) {
                        console.log('Error: ' + err);
                    }
                    console.log('Removed ' + host);
                });
                return;
            }
        });
    });

}

