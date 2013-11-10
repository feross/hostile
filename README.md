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

The MIT License (MIT)

Copyright (c) Feross Aboukhadijeh

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
