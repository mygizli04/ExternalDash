if (!process.stdin.isTTY) { //We need the users to be able to make choices, so an input method is required.
    console.error("No TTY detected. Please run this program in a terminal.")
    process.exit(1)
}

const pollingInterval = 1

const fs = require('fs')
const chalk = require('chalk');
var minehut = {}; //I hate scopes.

try {
    minehut = require('./minehut.js')
}
catch (err) {
   console.error(chalk.redBright("minehut.js could not be loaded. Please make sure the file exists and is correct.\n\n") + err)
   process.exit(1)
}

Object.freeze(minehut) //I hate scopes so much.

{ //Keeping login stuff exactly the same
    const harExists = fs.existsSync('./minehut.har')
    const jsonExists = fs.existsSync('./minehut.json')
    if (!harExists && !jsonExists) {
        console.error(chalk.redBright("Login information could not be found. (minehut.har or minehut.json)"))
        process.exit(1)
    }

    function jsonLogin(secondTry) {
        let minehutLogin = {}
        try {
            minehutLogin = require('./minehut.json')
        }
        catch (err) {
            console.error(chalk.redBright("Your minehut.json file is invalid! Please try again."))
            fs.rmSync('./minehut.json')
            debugger
            console.error(err)
            process.exit(1)
        }
        minehut.ghostLogin(minehutLogin.xSlgUser, minehutLogin.xSlgSession, minehutLogin.xSessionID).then(info => {
            console.log(chalk.greenBright("Login successful! (JSON)"))
            fs.writeFile("./minehut.json", JSON.stringify({xSlgUser: info[4][0], xSlgSession: info[4][1], xSessionID: info[4][2]}), (err) => {
                if (!err) {
                    console.log(chalk.greenBright("minehut.json written!"))
                }
                else {
                    console.error("Error writing minehut.json!\n\n" + err)
                    process.exit(1)
                }
            })
            Start()
        }).catch(reason => {
            console.error(chalk.redBright("Logging with the json file failed!\n\n") + reason)
            debugger
            if (harExists && !secondTry) {
                console.log(chalk.yellowBright("Trying to login with har file..."))
                harLogin(true)
            }
            else {
                process.exit(1)
            }
        })
    }

    function harLogin(secondTry) {
        minehut.loginWithHAR('./minehut.har').then(info => {
            console.log(chalk.green("Login successful! (HAR)"))
            fs.writeFile("./minehut.json", JSON.stringify({xSlgUser: info[4][0], xSlgSession: info[4][1], xSessionID: info[4][2]}), (err) => {
                if (!err) {
                    console.log(chalk.keyword('orange')("minehut.json written!"))
                }
                else {
                    console.error(chalk.red("Error writing minehut.json!\n\n") + err)
                    process.exit(1)
                }
            })
            Start()
        }).catch(reason => {
            console.error(chalk.redBright(chalk.red("Logging with the har file failed!\n\n")) + reason)
            debugger
            if (jsonExists && !secondTry) {
                console.log(chalk.yellowBright("Trying to login with json file..."))
                jsonLogin(true)
            }
            else {
                process.exit(1)
            }
        })
    }

    if (jsonExists) {
        jsonLogin(false)
    }
    else if (harExists) {
        harLogin(false)
    }
    else {
        console.error(chalk.red("Unreachable code."))
        debugger
        process.exit(255)
    }
}

var onlineServers = []
var offlineServers = []

function Start() {
    minehut.servers.allData().then(servers => {
        if (servers.length == 0) {
            console.error(chalk.redBright("You have no servers."))
            process.exit(1)
        }
        else {
            servers.forEach(server => {
                if (server.online) {
                    onlineServers.push(server)
                }
                else {
                    offlineServers.push(server)
                }
            })
            startMonitor()
        }
    })
}

var saved = []

function startMonitor() {
    console.log(chalk.greenBright("Connected!"))
    var logLength = {}
    setInterval(() => {
        minehut.servers.allData().then(servers => {
            onlineServers = []
            offlineServers = []

            servers.forEach(server => {
                if (server.online) {
                    onlineServers.push(server)
                }
                else {
                    offlineServers.push(server)
                }
            })

            offlineServers.forEach((server, index, array) => {
                if (server.online) {
                    onlineServers.push(server)
                    array.splice(index, 1)
                }
            })
    
            onlineServers.forEach((server,index,array) => {
                if (!server.online) {
                    offlineServers.push(server)
                    array.splice(index, 1)
                    return
                }
    
                minehut.file.readFile(server._id, "/logs/latest.log").then(log => {
                    if (log.expired) {
                        console.error(log.message)
                        process.exit(1)
                    }
                    log.content = log.content.trim()
                    if (log.content.length == logLength[server.name]) {
                        return
                    }
    
                    if (logLength[server.name] > log.content.length) {
                        console.error(chalk.yellowBright("Was the server restarted? There are some lines missing."))
                        logLength[server.name] = 0
                        console.log(log.content)
                    }
                    else if (!logLength[server.name]) {
                        logLength[server.name] = log.content.length
                        return
                    }
                    else {
                        log.content.substring(logLength[server.name]).trim().split("\n").forEach(line => {
                            if (line.substring(33,41) === "NODESRV:") {
                                let user = line.substring(line.indexOf(":",41) + 1, line.indexOf(":", line.indexOf(":",41) + 1))
                                let command = line.substring(41, line.indexOf(":",41))
                                let text = line.substring(line.indexOf(":", line.indexOf(":",41) + 1) + 1)
                                console.log(user + " issued the command " + command + " with " + text)
                                switch (command) {
                                    case "SAVE":
                                        server.sendCommand("tellraw " + user + ' [{"text":"Successfully saved"}, {"text":" ' + text + '", "color": "aqua"},{"text":"!","color":"white"}]')
                                        saved[user] = text
                                    break
                                    case "LOAD":
                                        if (saved[user]) {
                                            server.sendCommand("tellraw " + user + ' [{"text":"You have saved"}, {"text":" ' + saved[user] + '", "color": "aqua"},{"text":"!","color":"white"}]')
                                        }
                                        else {
                                            server.sendCommand("tellraw " + user + ' {"text":"You have not saved anything."}')
                                        }
                                    break
                                    /*case "POS":
                                        let x = text.substring(3,text.indexOf(","))
                                        let y = text.substring(text.indexOf("y") + 3,text.indexOf(",", text.indexOf("y") + 3))
                                        let z = text.substring(text.indexOf("z: ") + 3)
                                        servers.forEach((oServer, oIndex, oArray) => {
                                            if (oIndex === index) {
                                                return
                                            }
                                            else {
                                                oServer.sendCommand('npc select ' + user).then(() => {
                                                    oServer.sendCommand('npc moveTo ' + x + ' ' + y + ' ' + z)
                                                })
                                            }
                                        })
                                    break*/
                                    case "JOIN":
                                        servers.forEach((oServer, oIndex, oArray) => {
                                            if (oIndex === index) {
                                                return
                                            }
                                            else {
                                                oServer.sendCommand('tellraw @a {"text":"' + user + ' joined the game.","color":"yellow"}')
                                                /*oServer.sendCommand('npc create ' + user + ' --at 0:255:0')
                                                oServer.sendCommand('npc gravity')
                                                oServer.sendCommand('npc look')*/
                                            }
                                        })
                                    break
                                    case "QUIT":
                                        servers.forEach((oServer, oIndex, oArray) => {
                                            if (oIndex === index) {
                                                return
                                            }
                                            else {
                                                oServer.sendCommand('tellraw @a {"text":"' + user + ' left the game.","color":"yellow"}')
                                                //oServer.sendCommand('npc remove ' + user)
                                            }
                                        })
                                    break
                                    case "CHAT":
                                        servers.forEach((oServer, oIndex, oArray) => {
                                            if (oIndex === index) {
                                                return
                                            }
                                            else {
                                                oServer.sendCommand('tellraw @a {"text":"[' + server.name + '] <' + user + '> ' + text + '"}')
                                                //oServer.sendCommand('npc remove ' + user)
                                            }
                                        })
                                    break
                                    default:
                                        console.error("Unkown command " + command)
                                    break
                                }
                            }
                        })
                        logLength[server.name] = log.content.length
                    }
                })
            })
        })

    }, pollingInterval * 1000)
}