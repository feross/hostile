#!/usr/bin/env node

var hostile = require('./index.js');
var ipRegex = /^(([1-9]?\d|1\d\d|2[0-5][0-5]|2[0-4]\d)\.){3}([1-9]?\d|1\d\d|2[0-5][0-5]|2[0-4]\d)$/;

/**
 * Receive user input and try to match with an implemented method
 * If no match is found print help
 */
var userArguments = process.argv.slice(2),
    action = userArguments[0],
    params = userArguments.slice(1);

if (action === 'list') {
    return list();
} else if (action === 'set') {
    return set(params[0], params[1]);
} else if (action === 'remove') {
    return remove(params[0]);
}

// otherwise print help
help();


/**
 * Display all current ip records
 */
function list() {
    hostile.get(false, function (err, lines) {
        lines.forEach(function (item) {
            console.log(item);
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
        if (!new RegExp(ipRegex).test(ip)) {
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
            if (item.indexOf(host) > -1) {
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

/**
 * Display Help
 */
function help() {
    console.log('Hostile CLI');
    console.log('');
    console.log('Set a domain:');
    console.log('hostile set 127.0.0.1 domain.com');
    console.log('hostile set local domain.com (maps to 127.0.0.1)');
    console.log('hostile set localhost domain.com (maps to 127.0.0.1)');
    console.log('');
    console.log('Remove a domain');
    console.log('hostile remove domain.com');
    console.log('');
    console.log('list all domains');
    console.log('hostile list');
}


