if (!process.stdin.isTTY) { //We need the users to be able to make choices, so an input method is required.
    console.error("No TTY detected. Please run this program in a terminal.")
    process.exit(1)
}

const fs = require('fs')
const chalk = require('chalk');
const { dir } = require('console');
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
                    if (!servers[selected].service_online) {
                    process.stdout.write("The server is currently not online, would you like to turn it on? (Y/N) ")
                        process.stdin.once('data', answer => {
                            answer = answer.toString().trim().toUpperCase()
                            if (answer === "N") {
                                console.error(chalk.redBright("Aborted."))
                                process.exit(1)
                            }
                            else if (answer === "Y") {
                                console.log(chalk.yellowBright("Starting the server...\nKeep in mind minehut takes a few seconds to actually make the files available, so we recommend waiting a few seconds before proceeding."))
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

                function listOptions() {
                    //Only Skript for now
                    console.log("What would you like to do?")
                    console.log("[1] Skript")
                    console.log("[2] Plugins")
                    process.stdin.once('data', data => {
                        if (1 <= data <= 2) { //Minimum acceptable option <= data <= Maximum acceptable option
                            data = parseInt(data)
                            switch(data) {
                                case 1:
                                    console.log("Would you like to download skripts or upload them?")
                                    console.log("[1] Download")
                                    console.log("[2] Upload")
                                    console.log("[3] Sync")
                                    waitForInput(data => 1 <= data <= 3).then(data => {
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
                                                console.log("Which skript(s) would you like to download?")                                        
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
                                                                break
                                                            case 2:
                                                                dir = dir.filter(file => !fs.existsSync('./skripts/' + file))
                                                                if (dir.length === 0) {
                                                                    console.error("There aren't any files to download.")
                                                                    process.exit(1)
                                                                }
                                                                var warned = false;
                                                                var downloadCount = 0;
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
                                                                        downloadCount++
                                                                        if (downloadCount == dir.length) {
                                                                            process.exit(0)
                                                                        }
                                                                    })
                                                                })
                                                                break
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
                                                break
                                            case 2:
                                                try {
                                                    fs.mkdirSync('./skripts')
                                                    fs.mkdirSync('./skriptArchive')
                                                }
                                                catch (err) {
                                                    //I'm a great programmer!
                                                }
                                                console.log(chalk.yellowBright("WARNING: Due to a bug, files containing the dash symbol (-)'s in file names get replaced with underscores(_) "))
                                                console.log(chalk.yellowBright('So, "-skript.sk" would become "_skript.sk"'))
                                                console.log("Which skript(s) would you like to upload?")                                        
                                                console.log("[0] All of them")
                                                console.log("[1] Every enabled one")
                                                console.log("[2] Only ones that aren't uploaded already")
                                                var dir = fs.readdirSync('./skripts')
                                                dir.forEach((file, index, array) => {if (!file.endsWith(".sk")) array.splice(index, 1)})
                                                dir.forEach((file, index) => console.log("[" + (index + 3) + "] " + file))
                                                waitForInput(input => 0 <= input <= dir.length + 2).then(input => {
                                                    input = parseInt(input)
                                                    switch (input) {
                                                        case 0:
                                                            dir.forEach((file, index) => {
                                                                minehut.file.uploadFile(servers[selected]._id, './skripts/' + file,"/plugins/Skript/scripts/" + file).then(res => {
                                                                    console.log(res)
                                                                    if (index == dir.length - 1) {
                                                                        process.exit(0)
                                                                    }
                                                                })
                                                            })
                                                            break
                                                        case 1:
                                                            dir.forEach((file,index,array) => {if (file.startsWith("-")) {array.splice(index, 1)}})
                                                            dir.forEach((file, index) => {
                                                                minehut.file.uploadFile(servers[selected]._id, './skripts/' + file,"/plugins/Skript/scripts/" + file).then(res => {
                                                                    console.log(res)
                                                                    if (index == dir.length - 1) {
                                                                        process.exit(0)
                                                                    }
                                                                })
                                                            })
                                                            break
                                                        case 2:
                                                            minehut.file.listDir(servers[selected]._id, '/plugins/Skript/scripts').then(remoteDir => {
                                                                remoteDir.forEach((dir,index,array) => array[index] = dir.name)
                                                                dir = dir.filter((file) => !remoteDir.includes(file))
                                                                if (dir.length == 0) {
                                                                    console.error(chalk.redBright("No files to upload!"))
                                                                    process.exit(1)
                                                                }
                                                                dir.forEach((file, index) => {
                                                                    minehut.file.uploadFile(servers[selected]._id, './skripts/' + file,"/plugins/Skript/scripts/" + file).then(res => {
                                                                        console.log(res)
                                                                        if (index == dir.length - 1) {
                                                                            process.exit(0)
                                                                        }
                                                                    })
                                                                })
                                                            })
                                                            break
                                                        default:
                                                            minehut.file.uploadFile(servers[selected]._id, './skripts/' + dir[input - 3], '/plugins/Skript/scripts/' + dir[input - 3]).then(() => {
                                                                console.log("Done!")
                                                                process.exit(0)
                                                            })
                                                    }
                                                })
                                                break
                                                case 3:
                                                    console.log("[1] Sync minehut with local directory (Deletes files on minehut)")
                                                    console.log("[2] Sync local directory with minehut (Deletes local files)")
                                                    waitForInput(input => 1 <= input <= 2).then(input => {
                                                        input = parseInt(input)
                                                        switch (input) {
                                                            case 1:
                                                                console.log(chalk.redBright("THIS WILL DELETE SKRIPTS ON MINEHUT."))
                                                                process.stdout.write("Are you sure? This will make the skript folder on minehut be the same as the skripts folder. (Y/N) ")
                                                                waitForInput(input => input.toUpperCase().trim() === "Y" || input.toUpperCase().trim() === "N").then(input => {
                                                                    switch (input.toUpperCase().trim()) {
                                                                        case "Y":
                                                                            minehut.file.listDir(servers[selected]._id, "/plugins/Skript/scripts").then(dir => {
                                                                                dir.forEach(file => {
                                                                                    if (file.name.endsWith(".sk")) {
                                                                                        minehut.file.deleteFile(servers[selected]._id, "/plugins/Skript/scripts/" + file.name).then(res => {
                                                                                            console.log(res)
                                                                                        })
                                                                                    }
                                                                                })
                                                                                fs.readdir('./skripts', (err, dir) => {
                                                                                    if (err) {
                                                                                        console.error(err)
                                                                                        process.exit(1)
                                                                                    }

                                                                                    dir = dir.filter(value => value.endsWith(".sk"))

                                                                                    var uploaded = 0
                                                                                    dir.forEach(file => {
                                                                                        minehut.file.uploadFile(servers[selected]._id, "./skripts/" + file, "/plugins/Skript/scripts/" + file).then(res => {
                                                                                            console.log(res)
                                                                                            uploaded++
                                                                                            if (uploaded == dir.length) {
                                                                                                process.exit(0)
                                                                                            }
                                                                                        })
                                                                                    })
                                                                                })
                                                                            })
                                                                        break
                                                                        case "N":
                                                                            console.log("Aborted")
                                                                            process.exit(1)
                                                                        break
                                                                    }
                                                                })
                                                            break
                                                            case 2:
                                                                console.log(chalk.redBright("THIS MIGHT DELETE SKRIPT FILES FROM THE SKRIPTS FOLDER."))
                                                                process.stdout.write("Are you sure? This will make the skripts folder on minehut be the same as the folder on minehut. (Y/N) ")
                                                                waitForInput(input => input.toUpperCase().trim() === "Y" || input.toUpperCase().trim() === "N").then(input => {
                                                                    switch (input.toUpperCase().trim()) {
                                                                        case "Y":
                                                                            fs.rm('./skripts/', {recursive: true}, (err) => {
                                                                                if (err) {
                                                                                    console.log(chalk.yellowBright("A non-fatal error occured, but it can be ignored."))
                                                                                }

                                                                                fs.mkdirSync('./skripts')

                                                                                minehut.file.listDir(servers[selected]._id, "/plugins/Skript/scripts").then(dir => {
                                                                                    dir.forEach((value,index,array) => array[index] = value.name)
                                                                                    dir = dir.filter(value => value.endsWith(".sk"))

                                                                                    dir.forEach(file => {
                                                                                        minehut.file.readFile(servers[selected]._id, "/plugins/Skript/scripts/" + file).then(skript => {
                                                                                            fs.writeFileSync('./skripts/' + file, skript.content, {flag: 'a'})
                                                                                            console.log("Downloaded " + file)
                                                                                            if (file == dir[dir.length - 1]) process.exit(0)
                                                                                        })
                                                                                    })
                                                                                })
                                                                            })
                                                                        break
                                                                        case "N":
                                                                            console.log("Aborted")
                                                                            process.exit(1)
                                                                        break
                                                                    }
                                                                })
                                                            break
                                                        }
                                                    })
                                                break
                                        }
                                    })
                                    break
                                    case 2:
                                        console.log("[1] Install Plugin")
                                        console.log("[2] Remove plugin")
                                        console.log("[3] Reset plugin")
                                        console.log("[4] Modify plugin configs")
                                        waitForInput(input => 1 <= input <= 4).then(input => {
                                            input = parseInt(input)
                                            switch (input) {
                                                case 1:
                                                    minehut.fetchPublicPlugins().then(plugins => {
                                                        waitForInput(null, "Which plugin would you like to install? ").then(input => {
                                                            var matches = []
                                                            input = input.trim().toUpperCase()
                                                            plugins.all.forEach(plugin => {
                                                                if (plugin.name.toUpperCase().includes(input)) {
                                                                    matches.push(plugin)
                                                                }
                                                            })

                                                            if (matches.length == 0) {
                                                                console.error("No matches found.")
                                                                process.exit(1)
                                                            }

                                                            if (matches.length > 10) {
                                                                matches = matches.slice(0, 9)
                                                            }

                                                            matches.forEach((match, index) => {
                                                                console.log("[" + (index + 1) + "] " + match.name)
                                                            })

                                                            waitForInput(input => 1 <= input <= matches.length).then(input => {
                                                                input = parseInt(input) - 1
                                                                console.log("Installing " + matches[input].name + " to " + servers[selected].name)
                                                                matches[input].install(servers[selected]._id).then(res => {
                                                                    console.log(res)
                                                                    process.exit(0)
                                                                })
                                                            })
                                                        })
                                                    })
                                                break
                                                case 2:
                                                    servers[selected].plugins().then(plugins => {
                                                        plugins = plugins.plugins
                                                        var installedPlugins = []
                                                        plugins.forEach(plugin => {
                                                            if (plugin.state === 'ACTIVE') {
                                                                installedPlugins.push(plugin)
                                                            }
                                                        })

                                                        if (installedPlugins.length === 0) {
                                                            console.error("You have no plugins installed.")
                                                            process.exit(1)
                                                        }

                                                        console.log("[0] All of them")

                                                        installedPlugins.forEach((plugin, index) => {
                                                            console.log("[" + (index + 1) + "] " + plugin.name)
                                                        })

                                                        waitForInput(input => {return 0 <= input <= installedPlugins.length}, "Which plugin would you like to uninstall? ").then(input => {
                                                            input = parseInt(input.trim())
                                                            if (input === 0) {
                                                                waitForInput(input => {return (input.trim().toUpperCase() == "Y") || (input.trim().toUpperCase() == "N")}, "Are you sure? " + chalk.redBright("THIS WILL REMOVE ALL YOUR PLUGINS") + " (Y/N) ").then(input => {
                                                                    input = input.trim().toUpperCase()
                                                                    if (input === "Y") {
                                                                        var deletedPlugins = 0
                                                                        installedPlugins.forEach(plugin => {
                                                                            minehut.server.removePlugin(servers[selected]._id, plugin._id).then(res => {
                                                                            console.log(res)
                                                                            deletedPlugins++
                                                                            if (deletedPlugins === installedPlugins.length) {
                                                                                console.log("Done!")
                                                                                process.exit(0)
                                                                            }
                                                                            })
                                                                        })
                                                                    }
                                                                    else {
                                                                        console.log(chalk.redBright("Aborted."))
                                                                        process.exit(1)
                                                                    }       
                                                                })
                                                            }
                                                            else {
                                                                minehut.server.removePlugin(servers[selected]._id, installedPlugins[input - 1]._id).then(res => {
                                                                    console.log(res)
                                                                    console.log("Done!")
                                                                    process.exit(0)
                                                                })
                                                            }
                                                        })
                                                    })
                                                break
                                                case 3:
                                                    servers[selected].plugins().then(plugins => {
                                                        plugins = plugins.plugins
                                                        var installedPlugins = []
                                                        plugins.forEach(plugin => {
                                                            if (plugin.state === 'ACTIVE') {
                                                                installedPlugins.push(plugin)
                                                            }
                                                        })

                                                        if (installedPlugins.length === 0) {
                                                            console.error("You have no plugins installed.")
                                                            process.exit(1)
                                                        }

                                                        console.log("[0] All of them")

                                                        installedPlugins.forEach((plugin, index) => {
                                                            console.log("[" + (index + 1) + "] " + plugin.name)
                                                        })

                                                        waitForInput(input => {return 0 <= input <= installedPlugins.length}, "Which plugin would you like to reset? ").then(input => {
                                                            input = parseInt(input.trim())
                                                            if (input === 0) {
                                                                waitForInput(input => {return (input.trim().toUpperCase() == "Y") || (input.trim().toUpperCase() == "N")}, "Are you sure? " + chalk.redBright("THIS WILL REMOVE ALL YOUR PLUGIN DATA") + " (Y/N) ").then(input => {
                                                                    input = input.trim().toUpperCase()
                                                                    if (input === "Y") {
                                                                        var deletedPlugins = 0
                                                                        installedPlugins.forEach(plugin => {
                                                                            minehut.server.removePluginData(servers[selected]._id, plugin._id).then(res => {
                                                                            console.log(res)
                                                                            deletedPlugins++
                                                                            if (deletedPlugins === installedPlugins.length) {
                                                                                console.log("Done!")
                                                                                process.exit(0)
                                                                            }
                                                                            })
                                                                        })
                                                                    }
                                                                    else {
                                                                        console.log(chalk.redBright("Aborted."))
                                                                        process.exit(1)
                                                                    }       
                                                                })
                                                            }
                                                            else {
                                                                waitForInput(input => {return (input.trim().toUpperCase() == "Y") || (input.trim().toUpperCase() == "N")}, "Are you sure? " + chalk.redBright("THIS WILL REMOVE ALL YOUR DATA AND CONFIGURATIONS OF " + installedPlugins[input - 1].name) + " (Y/N) ").then(answer => {
                                                                    minehut.server.removePluginData(servers[selected]._id, installedPlugins[input - 1]._id).then(res => {
                                                                        console.log(res)
                                                                        console.log("Done!")
                                                                        process.exit(0)
                                                                    })
                                                                })
                                                            }
                                                        })
                                                    })
                                                break
                                                case 4:
                                                    console.log("[1] Download configs")
                                                    console.log("[2] Upload configs")
                                                    waitForInput().then(input => {
                                                        input = parseInt(input.trim())
                                                        if (input === 1) {
                                                            console.log("[0] All of them")

                                                            minehut.file.listDir(servers[selected]._id,"/plugins").then(dir => {
                                                                dir = dir.filter(file => file.directory)
                                                                dir.forEach((file, index) => {
                                                                    console.log("[" + (index + 1) + "] " + file.name)
                                                                })
                                                                waitForInput(null, "Which plugin would you like to download the configs for? ").then(input => {
                                                                    input = isNumber(input)
                                                                    
                                                                    if (!input && input !== 0) {
                                                                        console.log("Invalid choice")
                                                                        process.exit(1)
                                                                    }
    
                                                                    if (0 <= input <= dir.length) {
                                                                        if (input === 0) {
                                                                            downloadRecursively("./plugins", "/plugins", servers[selected]._id)
                                                                        }
                                                                        else {
                                                                            downloadRecursively("./plugins/" + dir[input - 1].name, "/plugins/" + dir[input - 1].name, servers[selected]._id)
                                                                        }
                                                                    }
                                                                    else {
                                                                        console.log("Invalid choice")
                                                                        process.exit(1)
                                                                    }
                                                                })
                                                            })
                                                        }
                                                        else if (input === 2) {
                                                            console.log("[0] All of them")


                                                                var dir = fs.readdirSync('./plugins')
                                                                dir = dir.filter(dir => fs.lstatSync('./plugins/' + dir).isDirectory())
                                                                dir.forEach((file, index) => {
                                                                    console.log("[" + (index + 1) + "] " + file)
                                                                })
                                                                waitForInput(null, "Which plugin would you like to upload the configs for? ").then(input => {
                                                                    input = isNumber(input)
                                                                    
                                                                    if (!input && input !== 0) {
                                                                        console.log("Invalid choice")
                                                                        process.exit(1)
                                                                    }
    
                                                                    if (0 <= input <= dir.length) {
                                                                        if (input === 0) {
                                                                            uploadRecursively("./plugins", "/plugins", servers[selected]._id)
                                                                        }
                                                                        else {
                                                                            uploadRecursively("./plugins/" + dir[input - 1], "/plugins/" + dir[input - 1], servers[selected]._id)
                                                                        }
                                                                    }
                                                                    else {
                                                                        console.log("Invalid choice")
                                                                        process.exit(1)
                                                                    }
                                                                })
                                                        }
                                                        else {
                                                            console.error(chalk.redBright("Invalid choice!"))
                                                            process.exit(1)
                                                        }
                                                    })
                                                break
                                            }
                                        })
                                    break

                            }
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
        process.stdout.write(string)
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

var reRecurse = true

function downloadRecursively(localpath, remotepath, server) { //Horrible approach time! Woo hoo!
    var fileQueue = []
    var dirQueue = []

    function recurse(cd) { // I sure do hope you don't have a lot of files :(
        fileQueue.forEach(file => {
            console.log("Downloading " + file)

            minehut.file.readFile(server, remotepath + file).then(contents => {
                let downloadPath = (localpath + file).split("/")
                let downloadDir = downloadPath.join("/").replace(downloadPath[downloadPath.length - 1], "")
                if (!fs.existsSync(downloadDir)) {
                    fs.mkdirSync(downloadDir, {recursive: true})
                }

                fs.writeFile(localpath + file, contents.content, (err) => {
                    if (err) {
                        console.error("Error writing file!\n\n" + err)
                        process.exit(1)
                    }
                })
            })
        })

        fileQueue = []

        minehut.file.listDir(server, remotepath + cd).then(dir => {
            dir.forEach(file => {
                if (file.directory) {
                    if (cd === "/") { //  ¯\_(ツ)_/¯
                        dirQueue.push(cd + file.name)
                    }
                    else {
                        dirQueue.push(cd + '/' + file.name)
                    }
                    
                }

                if (!file.directory && !file.blocked) {
                    fileQueue.push(cd + '/' + file.name)
                }
            })

            if (dirQueue.length === 0 && fileQueue.length === 0) {
                console.log("Done!")
                process.exit(0)   
            }
            else {
                let seeDee = dirQueue.splice(0, 1)[0]
                if (!seeDee) {
                    if (reRecurse) {
                        reRecurse = false
                        recurse(cd)
                    }
                    else {
                        console.log("Done!")
                        setTimeout(process.exit, 1000) // hahahaha i LOVE async (If you remove the timeout the process exits before final file writes are completed)
                    }
                }
                else {
                    recurse(seeDee)
                }
            }
        })
    }

    recurse("/")
}

function uploadRecursively(localpath, remotepath, server) { //Horrible approach time! Woo hoo!
    var fileQueue = []
    var dirQueue = []

    function recurse(cd) { // I sure do hope you don't have a lot of files :(
        fileQueue.forEach(file => {
            console.log("Uploading " + file)

            //Iterate over fileQueue
            let uploadPath = (remotepath + file).split("/")
            let uploadDir = uploadPath.join("/").replace(uploadPath[uploadPath.length - 1], "")
            minehut.file.listDir(server, uploadDir).then(atTheEnd).catch(err => {
                let dirArray = (remotepath + file).split("/")
                let parentDir = dirArray.join("/").replace(dirArray[dirArray.length - 1], "")
                minehut.file.createFolder(server, parentDir, dirArray[dirArray.length - 1]).then(() => {
                    atTheEnd()
                })
            })

            function atTheEnd() {
                minehut.file.uploadFile(server ,localpath + file, remotepath + file)
            }
        })

        fileQueue = []

        //Queue files/dirs then recurse
        fs.readdir(localpath + cd, (err, dir) => {
            if (err) {
                debugger
                console.error(err)
                process.exit(1)
            }

            dir.forEach(file => {
                if (fs.lstatSync(localpath + cd + '/' + file).isDirectory()) {
                    if (cd === "/") { //  ¯\_(ツ)_/¯
                        dirQueue.push(cd + file)
                    }
                    else {
                        dirQueue.push(cd + '/' + file)
                    }
                }
                else if (isAllowed(file)) {
                    if (cd === "/") { //  ¯\_(ツ)_/¯
                        fileQueue.push(cd + file)
                    }
                    else {
                        fileQueue.push(cd + '/' + file)
                    }
                }
                else {
                    return
                }
            })

            if (dirQueue.length === 0 && fileQueue.length === 0) {
                console.log("Done!")
                setTimeout(process.exit, 2000)
            }
            else {
                let seeDee = dirQueue.splice(0, 1)[0]
                if (!seeDee) {
                    if (reRecurse) {
                        reRecurse = false
                        recurse(cd)
                    }
                    else {
                        console.log("Done!")
                        setTimeout(process.exit, 2000)
                    }
                }
                else {
                    recurse(seeDee)
                }
            }
        })
    }

    recurse("/")
}

/*
.yml
.json
.txt
.sk
.nbt
.mcfunction
.schematic
.properties
.csv
.png
.midi
.nbs
.mcmeta
.dat
.conf
.template
.schem
.jpg
.jpeg
.gif
.lang
*/

function isAllowed(filename) {
    const allowedExtensions = ['.yml','.json','.txt','.sk','.nbt','.mcfunction','.schematic','.properties','.csv','.png','.midi','.nbs','.mcmeta','.dat','.conf','.template','.schem','.jpg','.jpeg','.gif','.lang']
    return allowedExtensions.includes('.' + filename.split(".")[filename.split(".").length - 1])
}