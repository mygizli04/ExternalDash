const fs = require('fs')
const chalk = require('chalk')

var config;
var discord;
var discordClient;
if (fs.existsSync('./config.json')) {
    config = require('./config.json')

    //Checks
    if (config.loginStorage !== "env" || config.loginStorage !== "config") {
        console.log(chalk.redBright("Invalid config option."))
        debugger
        process.exit(1)
    }

    if (config.loginStorage !== "single" || config.loginStorage !== "server") {
        console.log(chalk.redBright("Invalid config option."))
        debugger
        process.exit(1)
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

    if (!config.authmode) {
        console.log(chalk.redBright("Invalid config option."))
        debugger
        process.exit(1)
    } 

    if (config.discord) {
        discord = require('discord.js')
        discordClient = new discord.Client()

        if (typeof config.discordThreshold !== "number") {
            console.log(chalk.redBright("Invalid config option."))
            debugger
            process.exit(1)
        }

        if (config.discordMessageServer.length !== 16) {
            console.log(chalk.redBright("Invalid config option."))
            debugger
            process.exit(1)
        }
    }
    
    if (config.loginStorage !== "single" || 1 > config.minehutThreshold) {
        console.log(chalk.redBright("Invalid config option."))
        debugger
        process.exit(1)
    }
}
else {
    fs.writeFileSync('./config.json', JSON.stringify({loginStorage: "env", mode: "single", server: [], mcUsername: "email@email.com", mcPassword: "yourPassword", authMode: "mojang", discord: false, discordThreshold: 1, discordMessageServer: "0000000000000000", minehutThreshold: 1, minehutCommands: []}, null, "\t"))
    /*
    loginStorage: How the login info will be stored. Can be 'env' or 'config'.
    mode: How this instance will operate. Can be 'single' or 'server'.
    server: The target server to be used in single mode. Takes an array of servers (e.g ["myserver1", "myserver2"]). Must have at least 1 element if in single mode.
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
            for (i = 3; i < packet.extra.length; i++) {
                message += packet.extra[i].text
            }
        }
        console.log("Ad detected!")
        console.log("Advertiser: " + advertiser)
        console.log("Rank: " + rank)
        console.log("Server: " + server)
        console.log("Message: " + message)
    }
})