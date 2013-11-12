# hostile
### Simple, programmatic `/etc/hosts` manipulation (in node.js)

![hostile](https://raw.github.com/feross/hostile/master/img.png)

## Installation

`npm install hostile`

## OS Support

- **OS X** and **Linux**: Assumes hosts file will be at `/etc/hosts`.
- **Windows**: Assumes hosts file is at `/Windows/System32/drivers/etc/hosts`.

## Must run with `sudo`

If your OS requires admin privileges to edit the hosts file (most OSs do), then you'll need to run your node script with `sudo`. I use `hostile` in a command line script, so running with `sudo` is easy and not a security risk.

I wouldn't recommend running your production node server with admin privileges unless you downgrade to a normal user with [`process.setuid(id)`](http://nodejs.org/api/process.html#process_process_setuid_id) before you start accepting requests.

## Simple Usage

```js
var hostile = require('hostile')
hostile.set('127.0.0.1', 'cdn.peercdn.com', function (err) {
  if (err) {
    console.error(err)
  } else {
    console.log('set /etc/hosts successfully!')
  }
})
```

This adds a rule to /etc/hosts. If the rule already exists, then this does nothing.

```js
hostile.remove('127.0.0.1', 'cdn.peercdn.com', function (err) {
  if (err) {
    console.error(err)
  } else {
    console.log('set /etc/hosts successfully!')
  }
})
```

This removes a rule from /etc/hosts. If the rule does not exist, then this does
nothing.

## Advanced usage

For other features (not documented), see `index.js`. If this module doesn't do exactly what you need, feel free to send a pull request!

## License

MIT
