//This is the file intended to be used by clients. They can implement anything they want here.

const fs = require('fs')
var config
if (fs.existsSync("./config.json")) {
    config = require('./config.json')
}
else {
    fs.writeFileSync('./config.json', JSON.stringify({loginStorage: "env", servers: [], discord: false, discordThreshold: 1, discordMessageServer: "000000000000000000", discordBotToken: "00000000000000000000000000000000000000000000000000000000000", minehut: false, minehutThreshold: 1, minehutCommands: []}, null, "\t"))
    /*
    loginStorage: How the login info will be stored. Can be 'env' or 'config'.
    servers: The target server to be used in single mode. Takes an array of servers (e.g ["myserver1", "myserver2"]). Must have at least 1 element if in single mode.
    discord: If discord integration should be activated. Can be true or false.
    discordThreshold: How many times the player must advertise before their reward. Can be a number. Must be more than 1.
    discordMessageServer: Where the bot should post if a user passes the threshold. Can be a string of the channel ID. Must be 18 characters.
    minehutThreshold: How many times the player must advertise before their reward. Can be a number. Must be more than 1.
    minehutCommands: What command(s) should be run if a player passes the threshold. Can be a string (%user% will be replaced by the user)
    */
   console.error("No config found!")
   process.exit(1)
}

if (config.servers.length === 0) {
    console.error("No servers to check in the config.")
    process.exit(1)
}

var discord
var client
if (config.discord) {
    discord = require('discord.js')
    client = new discord.Client()
    if (config.loginStorage === "env") {
        client.login(process.env.discordBotToken)
    }
    else if (config.loginStorage === "config") {
        client.login(config.discordBotToken)
    }
    else {
        console.error("Invalid config option!")
    }
}

var minehut
if (config.minehut) {
    minehut = require('../minehut.js')
    minehut.loginWithHAR('../minehut.har')
}

var oldRewards = []
const {EventEmitter} = require('events')
exports.update = new EventEmitter()
const http = require('http')
exports.checkServers = function () {
    config.servers.forEach(server => {
        var req = http.request('http://localhost:8008/' + server, (res) => {
            res.on('data', (data) => {
                var rewards = JSON.parse(data.toString())
                var entries = Object.entries(rewards)
                entries.forEach(entry => {
                    if (oldRewards[entry[0]]) {
                        if (rewards[entry[0]].count !== oldRewards[entry[0]].count) {
                            exports.update.emit('update', rewards[entry[0]], oldRewards[entry[0]])
                            oldRewards[entry[0]] = rewards[entry[0]]
                        }
                    }
                    else {
                        oldRewards[entry[0]] = rewards[entry[0]]
                        exports.update.emit('firstAd', rewards[entry[0]])
                    }
                })
            })
        })
        
        req.on('error', (err) => {
            console.error(err)
        })
        
        req.end()
    })
}
setInterval(exports.checkServers, 1000)

exports.update.on('firstAd', data => {
    console.log(data)
})

exports.update.on('update', data => {
    console.log(data)
})