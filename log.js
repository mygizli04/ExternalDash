if (!process.stdin.isTTY) {
    console.error("No TTY detected. Please run this program in a terminal.")
    process.exit(1)
}

const fs = require('fs')
const chalk = require('chalk')
var minehut = {};
const pollingInterval = 5; //I never had a problem with 1, but if you want to be safe you can use 5 instead to be safe.

if (pollingInterval < 5) {
    console.log(chalk.yellowBright("Warning: The polling interval has been set to less than 5. We haven't seen anyone getting blocked from using this software, but keep in mind we make no guarantees."))
}

try {
     minehut = require('./minehut.js')
}
catch (err) {
    console.error(chalk.redBright("minehut.js could not be loaded. Please make sure the file exists and is correct.\n\n") + err)
    process.exit(1)
}

Object.freeze(minehut)

{
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
            console.error(chalk.redBright("Your minehut.json file is invalid!"))
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

var servers
function Start() {
    minehut.servers.allData().then(allData => {
        servers = allData
        var selected = 0;
        if (servers.length == 0) {
            console.error("You have no servers.")
            process.exit(1)
        }
        else if (servers.length == 1) {
            console.log("You only have 1 server (" + servers[selected].name + ") so it has been selected.")
            onlineCheck()
        }
        else {
            console.log("You have more than 1 server, please choose which server you want to access the logs of:")
            allData.forEach((server, index) => {
                console.log("[" + (index + 1) + "] " + server.name)
            })
            process.stdin.once('data', data => {
                data = isNumber(data)
                if (data) {
                    data = data - 1
                    if ((0 <= data) && (data <= allData.length)) {
                        selected = data
                        onlineCheck()
                    }
                    else {
                        console.error("Invalid choice!")
                        process.exit(1)
                    }
                }
                else {
                    console.error("Invalid choice!")
                    process.exit(1)
                }
            })
        }

        function onlineCheck() {
            if (servers[selected].active_server_plan_details.max_plugins) {
                if (servers[selected].active_plugins.length > 12) {
                    console.error(chalk.redBright("You have more plugins than your plan supports. Please remove plugins or buy a server plan."))
                    process.exit(1)
                }
            }
                    if (!servers[selected].online) {
                    process.stdout.write("The server is currently not online, would you like to turn it on? (Y/N) ")
                        process.stdin.once('data', answer => {
                            answer = answer.toString().trim().toUpperCase()
                            if (answer === "N") {
                                console.error(chalk.redBright("Aborted."))
                                process.exit(1)
                            }
                            else if (answer === "Y") {
                                console.log(chalk.yellowBright("Starting the server..."))
                                if (!servers[selected].service_online) {
                                    servers[selected].startService().then(res => {
                                        colorStart('orange')
                                        console.log(res)
                                        colorEnd()
                                        startLog()
                                    })
                                }
                                else {
                                    servers[selected].start().then(res => {
                                        colorStart('orange')
                                        console.log(res)
                                        colorEnd()
                                        startLog()
                                    })
                                }
                            }
                            else {
                                console.error("That is not a valid answer.")
                                process.exit(1)
                            }
                        })
                }
                else {
                    startLog()
                }}

        function startLog() {
            console.log(chalk.greenBright("Connected!"))
            if (!fs.existsSync('./sentlogs')) fs.mkdirSync('./sentlogs')
            let date = new Date()
            var outgoingLogName = "./sentlogs/" + servers[selected].name + "-" + date.getFullYear() + "-" + date.getMonth() + "-" + date.getDay() + "-" + date.getHours() + "-" + date.getMinutes() + '-sent.log'
            const log = fs.createWriteStream(outgoingLogName, {flags: 'a'})
                process.stdin.on('data', command => {
                    command = command.toString().trim()
                    servers[selected].sendCommand(command).catch(reason => {
                        console.error(chalk.red("Failed sending command! Please try again later.\n") + reason)
                    })
                    log.write(command)
                })
                var logLength = 0
                var incomingLogName = ""
                {
                if (!fs.existsSync('./logs')) fs.mkdirSync('./logs')
                    let date = new Date()
                    incomingLogName = "./logs/" + servers[selected].name + "-" + date.getFullYear() + "-" + date.getMonth() + "-" + date.getDay() + "-" + date.getHours() + "-" + date.getMinutes() + '.log'
                }
                setInterval(() => {
                    minehut.file.readFile(servers[selected]._id, "/logs/latest.log").then(log => {
                        if (log.error) {
                            console.error(log.error)
                            process.exit(1)
                        }
                        log.content = log.content.trim()
                        fs.writeFile(incomingLogName, log.content, (err) => {
                            if (err) {
                                console.error(chalk.redBright("Error writing log file.\n\n") + err)
                            }
                        })
                        if (log.content.length == logLength) {
                            return;
                        }
                        if (logLength > log.content.length) {
                            console.error(chalk.yellowBright("Was the server restarted? There are some lines missing."))
                            logLength = 0
                            console.log(log.content)
                        }
                        else {
                            console.log(log.content.substring(logLength).trim())
                            logLength = log.content.length
                        }
                    }).catch(reason => {
                        //console.error(chalk.red("Error reading log file.\n") + reason)
                        // Commented out because it could be confusing to users. You can uncomment the line if something is not working.
                    })
                }, pollingInterval * 1000)
        }

    })
}

function isNumber(string) {
    if (string.toString) {
        string = string.toString()
    }

    string = string.trim()

    if (typeof string != "string") {
        return undefined;
    }

    if (Number.isNaN(Number.parseInt(string))) {
        return false;
    }

    if (string.length == Number.parseInt(string).toString().length) {
        return Number.parseInt(string);
    }
    else {
        return false;
    }
}

function colorStart(color) {
    process.stdout.write(chalk.keyword(color)("DELETEME").split("DELETEME")[0])
}

function colorEnd() {
    process.stdout.write("\x1B[39m")
}
