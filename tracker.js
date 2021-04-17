const fs = require('fs')
const chalk = require('chalk')

var config;
var discord;
var discordClient;
var rewards;
if (fs.existsSync('./config.json')) {
    config = require('./config.json')

    //Checks
    if (config.loginStorage !== "env" && config.loginStorage !== "config") {
        console.log(chalk.redBright("Invalid config option."))
        debugger
        process.exit(1)
    }

    if (config.mode !== "single" && config.mode !== "server") {
        console.log(chalk.redBright("Invalid config option."))
        debugger
        process.exit(1)
    }

    if (fs.existsSync('./rewards.json')) {
        rewards = require('./rewards.json')
    }
    else {
        rewards = {}
        fs.writeFileSync('./rewards.json', "{}")
    }

    if (config.mode === "server") {
        const express = require('express')
        const app = express()
        app.listen(8008)
        
        app.get('/', (req, res) => {
            return res.send('How to use: /servername/username')
        })

        app.get('/:server', (req,res) => {
            if (req.params.server === "*") {
                return res.send(JSON.stringify(rewards))
            }
            else {
                return res.send(JSON.stringify(rewards[req.params.server]))
            }
        })

        app.get('/:server/:user', (req,res) => {
            return res.send(JSON.stringify(rewards[req.params.server][req.params.user]))
        })
        
    }

    if (config.loginStorage === "single" && config.server.length < 1) {
        console.log(chalk.redBright("Invalid config option."))
        debugger
        process.exit(1)
    }

    if (!config.mcUsername) {
        console.log(chalk.redBright("Invalid config option."))
        debugger
        process.exit(1)
    }

    if (!config.mcPassword) {
        console.log(chalk.redBright("Invalid config option."))
        debugger
        process.exit(1)
    } 

    if (!config.authMode) {
        console.log(chalk.redBright("Invalid config option."))
        debugger
        process.exit(1)
    } 

    if (config.discord) {
        discord = require('discord.js')
        discordClient = new discord.Client()
        if (config.loginStorage === "env") {
            discordClient.login(process.env.discordBotToken)
        }
        else if (config.loginStorage === "config") {
            discordClient.login(config.discordBotToken)
        }
        else {
            console.error("Invalid config value!")
        }

        if (typeof config.discordThreshold !== "number") {
            console.log(chalk.redBright("Invalid config option."))
            debugger
            process.exit(1)
        }

        if (config.discordMessageServer.length !== 18) {
            console.log(chalk.redBright("Invalid config option."))
            debugger
            process.exit(1)
        }
    }
    
    if (config.loginStorage !== "single" && 1 > config.minehutThreshold) {
        console.log(chalk.redBright("Invalid config option."))
        debugger
        process.exit(1)
    }
}
else {
    fs.writeFileSync('./config.json', JSON.stringify({loginStorage: "env", mode: "single", servers: [], mcUsername: "email@email.com", mcPassword: "yourPassword", authMode: "mojang", discord: false, discordThreshold: 1, discordMessageServer: "000000000000000000", discordBotToken: "00000000000000000000000000000000000000000000000000000000000", minehutThreshold: 1, minehutCommands: []}, null, "\t"))
    /*
    loginStorage: How the login info will be stored. Can be 'env' or 'config'.
    mode: How this instance will operate. Can be 'single' or 'server'.
    servers: The target server to be used in single mode. Takes an array of servers (e.g ["myserver1", "myserver2"]). Must have at least 1 element if in single mode.
    mcUsername: Username/email to be used if loginStorage is set to config. Can be a string.
    mcPassword: Password to be used if loginStorage is set to config. Can be a string.
    authmode: What auth mode should be used for logging into minehut. Can be 'microsoft', 'mojang' or anything else minecraft-protocol accepts.
    discord: If discord integration should be activated. Can be true or false.
    discordThreshold: How many times the player must advertise before their reward. Can be a number. Must be more than 1.
    discordMessageServer: Where the bot should post if a user passes the threshold. Can be a string of the channel ID. Must be 18 characters.
    minehutThreshold: How many times the player must advertise before their reward. Can be a number. Must be more than 1.
    minehutCommands: What command(s) should be run if a player passes the threshold. Can be a string (%user% will be replaced by the user)
    */
   console.error(chalk.red("No config found!"))
   process.exit(1)
}


var username;
var password;
if (config.loginStorage === "env") {
    username = process.env.mcUsername
    password = process.env.mcPassword
}
else {
    username = config.mcUsername
    password = config.mcPassword
}

const mc = require('minecraft-protocol')
var client = mc.createClient({
    host: "minehut.com",
    username: username,
    password: password,
    auth: 'mojang'
})

const minehut = require('./minehut.js')
minehut.loginWithHAR('./minehut.har')

client.on('chat', packet => {
    packet = JSON.parse(packet.message)
    if (!packet.extra) return
    if (packet.extra[0].text === '[AD] ') {
        console.log(packet)
        var advertiser = packet.extra[1].text.substring(0, packet.extra[1].text.indexOf(": "))
        var rank = "DEFAULT"
        if (advertiser.includes("] ")) {
            rank = advertiser.substring(1, advertiser.indexOf("]"))
            advertiser = advertiser.substring(advertiser.indexOf("]") + 2)
        }
        let server = packet.extra[2].text.substring(6, packet.extra[2].text.indexOf(" ", 6))
        let message = packet.extra[2].text.substring(7 + server.length)
        if (packet.extra.length > 3) {
            for (let i = 3; i < packet.extra.length; i++) {
                message += packet.extra[i].text
            }
        }

        if (!rewards[server]) {
            rewards[server] = {}
        }

        if (!rewards[server][advertiser]) {
            rewards[server][advertiser] = {}
        }

        if (!rewards[server][advertiser].count) {
            rewards[server][advertiser].count = 0
        }

        if (config.mode === "single") {
                

                if (rewards[server][advertiser].count === config.minehutThreshold) {
                    minehut.servers.allData().then(servers => {
                        servers.forEach(remoteServer => {
                            if (remoteServer.name.toUpperCase() === server.toUpperCase()) {
                                config.minehutCommands.forEach(command => {
                                    remoteServer.sendCommand(command)
                                })
                            }
                        })
                    })
                }

                if (rewards[server][advertiser].count === config.discordThreshold) {
                    discordClient.channels.fetch(config.discordMessageServer).then(channel => {
                        channel.send(new discord.MessageEmbed().setAuthor(advertiser, "https://minotar.net/helm/" + advertiser + "/256").addFields(
                            {name: "Rank", value: rank, inline: true},
                            {name: "Advertiser", value: advertiser, inline: true},
                            {name: "Server", value: server, inline: true},
                            {name: "Ad", value: "`" + message + "`"}
                        ))
                    })
                }

                if (rewards[server][advertiser].count >= config.discordThreshold && rewards[server][advertiser].count >= config.minehutThreshold) {
                    rewards[server][advertiser].count = 0
                }
                else {
                    rewards[server][advertiser].count++
                }

                rewards[server][advertiser].rank = rank
                rewards[server][advertiser].lastAd = message

                fs.writeFileSync('./rewards.json', JSON.stringify(rewards))
        }
        else {
            rewards[server][advertiser].count++
            if (rewards[server][advertiser].lastAdvertised < new Date().getTime() - 86400000) {
                rewards[server][advertiser].count = 0
                rewards[server][advertiser].lastAdvertised = 0
            }
            else {
                rewards[server][advertiser].lastAdvertised = new Date().getTime()
            }
            rewards[server][advertiser].rank = rank
            rewards[server][advertiser].lastAd = message
            fs.writeFileSync('./rewards.json', JSON.stringify(rewards))
        }
    }
})