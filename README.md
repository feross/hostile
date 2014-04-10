# hostile [![travis](https://img.shields.io/travis/feross/hostile.svg)](https://travis-ci.org/feross/hostile) [![npm](https://img.shields.io/npm/v/hostile.svg)](https://npmjs.org/package/hostile) [![gittip](https://img.shields.io/gittip/feross.svg)](https://www.gittip.com/feross/)

#### Simple, programmatic `/etc/hosts` manipulation (in node.js)

![hostile](https://raw.github.com/feross/hostile/master/img.png)

## install

```bash
npm install hostile
```

## usage

If you use OS X or Linux, this module assumes your hosts file is at `/etc/hosts`. On
Windows, it assumes your hosts file is at `C:/Windows/System32/drivers/etc/hosts`.

**Commands that modify the hosts file require root privileges.**

#### list all host file records

```bash
hostile list
```

#### set a domain in the hosts file

```bash
hostile set [ip] [host]
```

examples:
```bash
hostile set localhost domain.com
hostile set 192.168.33.10 domain.com
```

#### remove a domain from the hosts file

```bash
hostile remove [host]
```

example:
```bash
hostile remove domain.com
```

#### set up auto completion

bash:
```bash
hostile --completion >> ~/hostile.completion.sh
echo 'source ~/hostile.completion.sh' >> .bash_profile
```

zsh:
```bash
echo '. <(./hostile --completion)' >> .zshrc
```

## methods

Commands that modify the hosts file require root privileges.

I wouldn't recommend running your production node server with admin privileges unless you
downgrade to a normal user with
[`process.setuid(id)`](http://nodejs.org/api/process.html#process_process_setuid_id)
before you start accepting requests.

#### add a rule to /etc/hosts

```js
var hostile = require('hostile')
hostile.set('127.0.0.1', 'peercdn.com', function (err) {
  if (err) {
    console.error(err)
  } else {
    console.log('set /etc/hosts successfully!')
  }
})
```

If the rule already exists, then this does nothing.

#### remove a rule from /etc/hosts

```js
hostile.remove('127.0.0.1', 'peercdn.com', function (err) {
  if (err) {
    console.error(err)
  } else {
    console.log('set /etc/hosts successfully!')
  }
})
```

If the rule does not exist, then this does nothing.

#### get all lines in /etc/hosts

```js
// If `preserveFormatting` is true, then include comments, blank lines and other
// non-host entries in the result
var preserveFormatting = false

hostile.get(preserveFormatting, function (err, lines) {
  if (err) {
    console.error(err.message)
  }
  lines.forEach(function (line) {
    console.log(line)
  })
})
```

## contributors

- [Feross Aboukhadijeh](http://feross.org) (author)
- [Maayan Glikser](https://github.com/morsdyce)

## license

MIT. Copyright (c) [Feross Aboukhadijeh](http://feross.org).
