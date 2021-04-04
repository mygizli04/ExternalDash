if (!process.stdin.isTTY) { //We need the users to be able to make choices, so an input method is required.
    console.error("No TTY detected. Please run this program in a terminal.")
    process.exit(1)
}

const fs = require('fs')
const chalk = require('chalk')
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
            console.log("You have more than 1 server, please choose which server you'd like to manage:")
            allData.forEach((server, index) => {
                console.log("[" + (index + 1) + "] " + server.name)
            })
            process.stdin.once('data', data => {
                data = isNumber(data)
                if (data) {
                    data = data - 1
                    if (0 <= data <= allData.length) {
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
            if (servers[selected].active_server_plan_details) {
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
                                        listOptions()
                                    })
                                }
                                else {
                                    servers[selected].start().then(res => {
                                        colorStart('orange')
                                        console.log(res)
                                        colorEnd()
                                        listOptions()
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
                    listOptions()
                }}

                const readlineSync = require('readline-sync') // Lifesaver.

                function listOptions() {
                    //Only Skript for now
                    console.log("What would you like to do?")
                    console.log("[1] Skript")
                    process.stdin.once('data', data => {
                        if (1 <= data <= 1) { //Minimum acceptable option <= data <= Maximum acceptable option
                            console.log("Would you like to download skripts or upload them?")
                            console.log("[1] Download")
                            console.log("[2] Upload")
                            waitForInput(data => 1 <= data <= 2).then(data => {
                                data = parseInt(data)
                                switch (data) {
                                    case 1:
                                        try {
                                            fs.mkdirSync('./skripts')
                                            fs.mkdirSync('./skriptArchive')
                                        }
                                        catch (err) {
                                            //I'm a great programmer!
                                        }
                                        console.log("Which skript would you like to download?")                                        
                                        console.log("[0] All of them")
                                        console.log("[1] Every enabled one")
                                        console.log("[2] Only ones i don't have")
                                        minehut.file.listDir(servers[selected]._id, "/plugins/Skript/scripts").then(dir => {
                                            dir.forEach((file,index,array) => {if (file.blocked) {array.splice(index, 1)}})
                                            dir.forEach((file,index,array) => array[index] = file.name)
                                            dir.forEach((file, index) => {
                                                console.log("[" + (index + 3) + "] " + file)
                                            })
                                            waitForInput(input => 0 <= input <= (input + dir.length)).then(input => {
                                                input = parseInt(input)
                                                switch (input) {
                                                    case 0:
                                                        var warned = false;
                                                        dir.forEach(file => {
                                                            if (fs.existsSync('./skripts/' + file)) {
                                                                if (!warned) {
                                                                    console.log(chalk.yellowBright("Warning: One or more files you're trying to download already exist. If they are older than 1 day they will be moved into a seperate folder, or else they will be updated."))
                                                                    warned = true
                                                                }
                                                                if (fs.statSync('./skripts/' + file).mtime.getTime() < new Date().getTime() - 86400000) {
                                                                    console.log("Archiving " + file)
                                                                    fs.rename('./skripts/' + file, './skriptArchive/' + file, (err) => {
                                                                        if (err) {
                                                                            console.error(chalk.redBright("An error occured moving files!\n\n") + err)
                                                                        }
                                                                    })
                                                                }
                                                                else {
                                                                    console.log("Replacing " + file)
                                                                }
                                                            }

                                                            minehut.file.readFile(servers[selected]._id, "/plugins/Skript/scripts/" + file).then(skript => {
                                                                fs.writeFileSync('./skripts/' + file, skript.content)
                                                                console.log("Downloaded " + file)
                                                                if (file == dir[dir.length - 1]) process.exit(0)
                                                            })
                                                        })
                                                    case 1:
                                                        dir.forEach((file, index, array) => {if (file.startsWith("-")) {array.splice(index, 1)}})
                                                        var warned = false;
                                                        dir.forEach(file => {
                                                            if (fs.existsSync('./skripts/' + file)) {
                                                                if (!warned) {
                                                                    console.log(chalk.yellowBright("Warning: One or more files you're trying to download already exist. If they are older than 1 day they will be moved into a seperate folder, or else they will be updated."))
                                                                    warned = true
                                                                }
                                                                if (fs.statSync('./skripts/' + file).mtime.getTime() < new Date().getTime() - 86400000) {
                                                                    console.log("Archiving " + file)
                                                                    fs.rename('./skripts/' + file, './skriptArchive/' + file, (err) => {
                                                                        if (err) {
                                                                            console.error(chalk.redBright("An error occured moving files!\n\n") + err)
                                                                        }
                                                                    })
                                                                }
                                                                else {
                                                                    console.log("Replacing " + file)
                                                                }
                                                            }

                                                            minehut.file.readFile(servers[selected]._id, "/plugins/Skript/scripts/" + file).then(skript => {
                                                                fs.writeFileSync('./skripts/' + file, skript.content)
                                                                console.log("Downloaded " + file)
                                                                if (file == dir[dir.length - 1]) process.exit(0)
                                                            })
                                                        })
                                                    case 2:
                                                        dir.forEach((file, index, array) => {if (fs.existsSync('./skripts/' + file)) {array.splice(index, 1)}})
                                                        var warned = false;
                                                        dir.forEach(file => {
                                                            if (fs.existsSync('./skripts/' + file)) {
                                                                if (!warned) {
                                                                    console.log(chalk.yellowBright("Warning: One or more files you're trying to download already exist. If they are older than 1 day they will be moved into a seperate folder, or else they will be updated."))
                                                                    warned = true
                                                                }
                                                                if (fs.statSync('./skripts/' + file).mtime.getTime() < new Date().getTime() - 86400000) {
                                                                    console.log("Archiving " + file)
                                                                    fs.rename('./skripts/' + file, './skriptArchive/' + file, (err) => {
                                                                        if (err) {
                                                                            console.error(chalk.redBright("An error occured moving files!\n\n") + err)
                                                                        }
                                                                    })
                                                                }
                                                                else {
                                                                    console.log("Replacing " + file)
                                                                }
                                                            }

                                                            minehut.file.readFile(servers[selected]._id, "/plugins/Skript/scripts/" + file).then(skript => {
                                                                fs.writeFileSync('./skripts/' + file, skript.content)
                                                                console.log("Downloaded " + file)
                                                                if (file == dir[dir.length - 1]) process.exit(0)
                                                            })
                                                        })
                                                    default:
                                                        let file = dir[input - 3]
                                                        if (fs.existsSync('./skripts/' + file)) {
                                                            console.log(chalk.yellowBright("Warning: The file you're trying to download already exists. If it is older than 1 day it will be moved into a seperate folder, or else it will be updated."))

                                                            if (fs.statSync('./skripts/' + file).mtime.getTime() < new Date().getTime() - 86400000) {
                                                                console.log("Archiving " + file)
                                                                fs.rename('./skripts/' + file, './skriptArchive/' + file, (err) => {
                                                                    if (err) {
                                                                        console.error(chalk.redBright("An error occured moving files!\n\n") + err)
                                                                    }
                                                                })
                                                            }
                                                            else {
                                                                console.log("Replacing " + file)
                                                            }
                                                        }

                                                        minehut.file.readFile(servers[selected]._id, "/plugins/Skript/scripts/" + file).then(skript => {
                                                            fs.writeFileSync('./skripts/' + file, skript.content)
                                                            console.log("Downloaded " + file)
                                                            process.exit(0)
                                                        })
                                                }
                                            })
                                        })
                                    case 2:

                                }
                            })
                        }
                        else {
                            console.error(chalk.redBright("That is not a valid option."))
                            process.exit(1)
                        }
                    })
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

async function waitForInput(check, string) { //Woo hoo literally only async function in the file how efficent
    if (string) {
        console.log(string)
    }
    return new Promise((resolve, reject) => {
        process.stdin.once('data', data => {
            data = data.toString().trim()
            if (!check) {
                resolve(data)
            }
            else {
                let checkResult = check(data)
                if (typeof checkResult == "Promise") {
                    checkResult.then(() => resolve(data)).catch(() => {
                        console.error(chalk.redBright("That is not a valid answer."))
                        process.exit(1)
                    })
                }
                else {
                    resolve(data)
                }
            }
        })
    })
}

