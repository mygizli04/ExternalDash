//This is the file intended to be used by clients. They can implement anything they want here.

const http = require('http')
var req = http.request('http://localhost:8008', (res) => {
    res.on('data', (data) => {
        data = data.toString()
        //Woop woop
    })
})

req.on('error', (err) => {
    console.error(err)
})

req.end()