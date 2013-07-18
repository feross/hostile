var hostile = require('./')

hostile.set('127.0.0.1', 'cdn.peercdn.com', function (err) {
  if (err) {
    console.error(err)
  } else {
    console.log('set /etc/hosts successfully!')
  }
})

// hostile.remove('127.0.0.1', 'cdn.peercdn.com', function (err) {
//   if (err) {
//     console.error(err)
//   } else {
//     console.log('set /etc/hosts successfully!')
//   }
// })