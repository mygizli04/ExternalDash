//I know how bad this is shut up.

const request = require('request')
const apiURL = 'https://api.minehut.com'
//var apiURL = 'https://api.minehut.com'
const loginURL = 'https://authentication-service-prod.superleague.com/v1/user/login/ghost/'
const fs = require('fs')

exports.requestRaw = async function (path, method, headers, body) {
    var promiseResolve
    var promiseReject

    if (!method) {
        var method = 'GET'
    }

    if (!headers) {
        var headers = {}
    }

    if (!path) {
        return new Promise().reject("'path' is not defined.")
    }

    if (!body) {
        body = ""
    }
    else {
        body = JSON.stringify(body)
    }

    console.log(apiURL + path)

    request(apiURL + path, {method: method, headers: headers, body: body} , (err, res, body) => {
        if (err) {
            promiseReject(err)
            return
        }
        try {
            promiseResolve(JSON.parse(body))
        }
        catch (err) {
            promiseReject(err)
        }
    })

    return new Promise((resolve, reject) => {
        promiseResolve = resolve
        promiseReject = reject
    })
};

exports.servers = {
    list: async function () {
        var promiseResolve
        var promiseReject
        exports.requestRaw('/servers', 'GET', {}).then(res => promiseResolve(res)).catch(err => promiseReject(err))

        return new Promise((resolve, reject) => {
            promiseResolve = resolve
            promiseReject = reject
        })
    },

    fetch: async function (server, byName) {

        var url = '/server/' + server

        if (byName == true) {
            url += "?byName=true"
        }

        exports.requestRaw(url).then(res => {
            if (res.server.owner == iuserID) {
                addOwnedServerFuncs(res, res.server._id)
            }

            promiseResolve(res)
        })

        var promiseResolve
        var promiseReject
        return new Promise((resolve, reject) => {
            promiseResolve = resolve
            promiseReject = reject
        })
    },

    fetchOwn: async function (server) {
        var promiseResolve
        var promiseReject
        var promise = new Promise((resolve, reject) => {
            promiseResolve = resolve
            promiseReject = reject
        })

        if (authorizedOnly(promiseReject) == false) {
            return
        }

        exports.requestAuthorized('/server/' + server + '/server_data').then(res => {
            addOwnedServerFuncs(res, res.server._id)
            promiseResolve(res)
        }).catch(err => promiseReject(err))

        return promise
    },

    allData: async function () {
        var promiseResolve
        var promiseReject
        var promise = new Promise((resolve, reject) => {
            promiseResolve = resolve
            promiseReject = reject
        })

        if (authorizedOnly(promiseReject) == false) {
            return
        }

        exports.requestAuthorized('/servers/' + iuserID + '/all_data').then(res => {
            res.forEach((value, index, array) => {
                array[index] = addOwnedServerFuncs(value, value._id)
            })
            promiseResolve(res)
        })

        return promise
    }
}

function addOwnedServerFuncs(object, id) {
    object.status = function () {
        return exports.server.status(id)
    }

    object.startService = function () {
        return exports.server.startService(id)
    }

    object.start = function () {
        return exports.server.start(id)
    }

    object.shutdown = function () {
        return exports.server.shutdown(id)
    }

    object.destroyService = function () {
        return exports.server.destroyService(id)
    }

    object.repairFiles = function () {
        return exports.server.repairFiles(id)
    }
    
    object.resetAll = function () {
        return exports.server.resetAll(id)
    }


    object.sendCommand = function (command) {
        return exports.server.sendCommand(id,command)
    }

    object.changeName = function (name) {
        return exports.server.changeName(id, name)
    }

    object.changeMotd = function (motd) {
        return exports.server.changeMotd(id, motd)
    }


    object.setVisibility = function (visibility) {
        return exports.server.setVisibility(id, visib)
    }

    object.save = function () {
        return exports.server.save(id)
    }

    object.resetWorld = function () {
        return exports.server.resetWorld(id)
    }

    object.editServerProperties = function (properties) {
        return exports.server.editServerProperties(id, properties)
    }

    object.plugins = function () {
        return exports.server.plugins(id)
    }

    object.installPlugin = function (plugin) {
        return exports.server.installPlugin(id, plugin)
    }

    object.removePlugin = function (plugin) {
        return exports.server.removePlugin(id, plugin)
    }

    object.removePluginData = function (plugin) {
        return exports.server.removePluginData(id, plugin)
    }

    object.createBackup = function () {
        return exports.server.createBackup(id)
    }

    object.backups = function () {
        return exports.server.backups(id)
    }

    return object
}

var promiseReject;

exports.requestAuthorized = async function (path, method, body, headers) {
    var promiseReject
    var promise = new Promise((resolve, reject) => {
        promiseReject = reject
    })

    if (authorizedOnly(promiseReject) == false) {
        return promise;
    }

    if (!headers) {
        headers = {
            'authorization': iauthorization,
            'x-session-id': ixSessionID,
            'Content-Type': 'application/json'
        }
    }
    else {
        headers.authorization = iauthorization
        headers["x-session-id"] = ixSessionID
    }

    if (!path) {
        promiseReject('No path provided.')
        return promise
    }

    if (!method) {
        method = "GET"
    }

    return exports.requestRaw(path, method, headers, body)
}

exports.server = {
    status: async function (server) {
        if (authorizedOnly(promiseReject) == false) {
            return
        }

        return exports.requestAuthorized('/server/' + server + '/status')
    },

    startService: async function (server) {
        if (authorizedOnly(promiseReject) == false) {
            return
        }

        return exports.requestAuthorized('/server/' + server + '/start_service', 'POST')
    },

    start: async function (server) {
        if (authorizedOnly(promiseReject) == false) {
            return false
        }

        return exports.requestAuthorized('/server/' + server + '/start', 'POST')
    },

    shutdown: async function (server) {
        if (authorizedOnly(promiseReject) == false) {
            return
        }

        return exports.requestAuthorized('/server/' + server + '/shutdown', 'POST')
    },

    destroyService: async function (server) {
        if (authorizedOnly(promiseReject) == false) {
            return
        }

        return exports.requestAuthorized('/server/' + server + '/destroy_service', 'POST')
    },

    repairFiles: async function (server) {
        if (authorizedOnly(promiseReject) == false) {
            return
        }

        return exports.requestAuthorized('/server/' + server + '/repair_files', 'POST')
    },

    resetAll: async function (server) {
        if (authorizedOnly(promiseReject) == false) {
            return
        }

        return exports.requestAuthorized('/server/' + server + '/reset_all', 'POST')
    },

    sendCommand: async function (server, command) {
        if (authorizedOnly(promiseReject) == false) {
            return
        }

        return exports.requestAuthorized('/server/' + server + '/send_command', 'POST', {
            "command": command
        })
    },

    changeName: async function (server, newName) {
        if (authorizedOnly(promiseReject) == false) {
            return
        }

        return exports.requestAuthorized('/server/' + server + '/change_name', 'POST', {
            "name": newName
        })
    },

    changeMotd: async function (server, newMotd) {
        if (authorizedOnly(promiseReject) == false) {
            return
        }

        return exports.requestAuthorized('/server/' + server + '/change_motd', 'POST', {
            "command": newMotd
        })
    },

    setVisibility: async function (server, visibility) {
        if (authorizedOnly(promiseReject) == false) {
            return
        }

        return exports.requestAuthorized('/server/' + server + '/visibility', 'POST', {
            "command": visibility
        })
    },

    save: async function (server) {
        if (authorizedOnly(promiseReject) == false) {
            return
        }

        return exports.requestAuthorized('/' + server + '/save', 'POST')
    },

    resetWorld: async function (server) {
        if (authorizedOnly(promiseReject) == false) {
            return
        }

        return exports.requestAuthorized('/server/' + server + '/reset_world', 'POST')
    },
    
    editServerProperties: async function (server, properties) {
        if (authorizedOnly(promiseReject) == false) {
            return
        }

        return exports.requestAuthorized('/server/' + server + '/save', 'POST', properties)
    },

    plugins: async function (server) {
        if (authorizedOnly(promiseReject) == false) {
            return
        }

        return exports.requestAuthorized('/server/' + server + '/plugins')
    },

    installPlugin: async function (server,plugin) {
        if (authorizedOnly(promiseReject) == false) {
            return
        }

        return exports.requestAuthorized('/server/' + server + '/install_plugin', 'POST', {
            "plugin": plugin
        })
    },

    removePlugin: async function (server,plugin) {
        if (authorizedOnly(promiseReject) == false) {
            return
        }

        return exports.requestAuthorized('/server/' + server + '/remove_plugin', 'POST', {
            "plugin": plugin
        })
    },

    removePluginData: async function (server,plugin) {
        if (authorizedOnly(promiseReject) == false) {
            return
        }

        return exports.requestAuthorized('/server/' + server + '/remove_plugin_data', 'POST', {
            "plugin": plugin
        })
    },

    backups: async function (server) {
        var promiseResolve;
        var promiseReject;
        var promise = new Promise((res, rej) => {
            promiseResolve = res
            promiseReject = rej
        })

        if (authorizedOnly(promiseReject) == false) {
            return
        }

        exports.requestAuthorized('/v1/server/' + server + '/backups').then(res => {
            res.backups.forEach((value, index, array) => {
                array[index] = addBackupFuncs(value)
            })
            res.rolling_backup = addBackupFuncs(res.rolling_backup)
            promiseResolve(res)
        })

        return promise
    },

    createBackup: async function (server) {
        var promiseResolve;
        var promiseReject;
        var promise = new Promise((res, rej) => {
            promiseResolve = res
            promiseReject = rej
        })

        if (authorizedOnly(promiseReject) == false) {
            return
        }

        exports.requestAuthorized('/v1/server/' + server + '/backup/create').then(res => {
            res.backups.forEach((value, index, array) => {
                array[index] = addBackupFuncs(value)
            })
            res.rolling_backup = addBackupFuncs(res.rolling_backup)
            promiseResolve(res)
        })

        return promise
    },

    applyBackup: async function (server, backup) {
        var promiseResolve;
        var promiseReject;
        var promise = new Promise((res, rej) => {
            promiseResolve = res
            promiseReject = rej
        })

        if (authorizedOnly(promiseReject) == false) {
            return
        }

        exports.requestAuthorized('/v1/server/' + server + '/backup/apply', 'POST', {
            "backup_id": backup
        }).then(() => {
            promiseResolve()
        })

        return promise
    },

    updateBackupDesc: async function (server, backup, description) {
        var promiseResolve;
        var promiseReject;
        var promise = new Promise((res, rej) => {
            promiseResolve = res
            promiseReject = rej
        })

        if (authorizedOnly(promiseReject) == false) {
            return
        }

        exports.requestAuthorized('/v1/server/' + server + '/backup', 'POST', {
            "backup_id": backup,
            "description": description
        }).then(() => {
            res.backups.forEach((value, index, array) => {
                array[index] = addBackupFuncs(value)
            })
            res.rolling_backup = addBackupFuncs(res.rolling_backup)
            promiseResolve(res)
        })

        return promise
    },

    createBackup: async function (server) {
        var promiseResolve;
        var promiseReject;
        var promise = new Promise((res, rej) => {
            promiseResolve = res
            promiseReject = rej
        })

        if (authorizedOnly(promiseReject) == false) {
            return
        }

        exports.requestAuthorized('/v1/server/' + server + '/backup/create', 'POST', {
            "backup_id": null
        }).then(res => {
            res.backups.forEach((value, index, array) => {
                array[index] = addBackupFuncs(value)
            })
            res.rolling_backup = addBackupFuncs(res.rolling_backup)
            promiseResolve(res)
        })

        return promise
    },

    deleteBackup: async function (server, backup) {
        var promiseResolve;
        var promiseReject;
        var promise = new Promise((res, rej) => {
            promiseResolve = res
            promiseReject = rej
        })

        if (authorizedOnly(promiseReject) == false) {
            return
        }  

        exports.requestAuthorized('/v1/server/' + server + '/backup', 'DELETE', {
            "backup_id": backup
        }).then(res => {
            if (!res.backups) {
                if (res.error) {
                    promiseReject(res.error)
                    return
                }
                promiseReject(res)
                return;
            }
            res.backups.forEach((value, index, array) => {
                array[index] = addBackupFuncs(value)
            })
            res.rolling_backup = addBackupFuncs(res.rolling_backup)
            promiseResolve(res)
        })

        return promise
    }
}


function addBackupFuncs(object) {
    object.apply = function () {
        return exports.server.applyBackup(object.server_id, object._id)
    }  

    object.updateDesc = function (desc) {
        return exports.server.updateBackupDesc(object.server_id, object._id, desc)
    }  

    object.delete = function () {
        return exports.server.deleteBackup(object.server_id, object._id)
    }

    return object;
}



function authorizedOnly(reject) {
    if (loggedIn == false) {
        reject('Not logged in.')
    }

    return loggedIn
}

exports.fetchPublicPlugins = async function () {
        exports.requestRaw('/plugins_public').then(res => {
            res.all.forEach((value, index, array) => {
                array[index].install = function (server) {
                    return exports.server.installPlugin(server, value._id)
                }

                array[index].remove = function (server) {
                    return exports.server.removePlugin(server, value._id)
                }

                array[index].removeData = function (server) {
                    return exports.server.removePlugin(server, value._id)
                }
            })
            promiseResolve(res)
        }).catch(err => promiseReject(err))

        var promiseResolve
        var promiseReject
        return new Promise((resolve, reject) => {
            promiseResolve = resolve
            promiseReject = reject
        })
    }

var iauthorization;
var ixSessionID;
var iuserID;
var iservers;
var loggedIn = false
exports.ghostLogin = async function (xSlgUser, xSlgSession, xSessionID) {
    var promiseResolve
    var promiseReject
    var promise = new Promise((resolve, reject) => {
        promiseResolve = resolve
        promiseReject = reject
    })

    request(loginURL, {headers: {
        'x-slg-user': xSlgUser,
        'x-slg-session': xSlgSession,
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        'minehutSessionId': xSessionID,
        'slgSessionId': xSlgSession
    }),
    method: 'POST'
    }, (err, res, body) => {

        if (err) {
            promiseReject(err)
            return
        }
        body = JSON.parse(body)
        if (!body.minehutSessionData) {
            if (body.message) {
                promiseReject(body.message)
                return
            }
            promiseReject(body)
            return
        }

        iuserID = body.minehutSessionData._id
        iservers = body.minehutSessionData.servers
        iauthorization = body.minehutSessionData.token
        ixSessionID = body.minehutSessionData.sessionId
        loggedIn = true
        promiseResolve([iuserID, iservers, iauthorization, ixSessionID, [body.slgSessionData.slgUserId, body.slgSessionData.slgSessionId, body.minehutSessionData.sessionId]])
    })

    return promise
}

exports.file = {
    listRootDir: async function (server) {
        var promiseResolve
        var promiseReject
        var promise = new Promise((resolve, reject) => {
            promiseResolve = resolve
            promiseReject = reject
        })

        if (!server) {
            promiseReject("No server provided!")
            return
        }

        if (authorizedOnly(promiseReject) == false) {
            return
        }

        exports.requestAuthorized('/file/' + server + '/list/').then(res => {
            if (res.error) {
                promiseReject(res.error)
                return;
            }
            promiseResolve(addDirFuncs(res.files, '/', server))
        })

        return promise
    },

    listDir: async function (server, dir) {
        var promiseResolve
        var promiseReject
        var promise = new Promise((resolve, reject) => {
            promiseResolve = resolve
            promiseReject = reject
        })

        if (!server) {
            promiseReject("No server provided!")
            return
        }

        if (!dir) {
            promiseReject("No directory provided! Use listRootDir() instead!")
            return
        }

        if (authorizedOnly(promiseReject) == false) {
            return
        }

        exports.requestAuthorized('/file/' + server + '/list' + dir, 'GET').then(dir => {
            if (dir.error) {
                promiseReject(dir.error)
            }
            else {
                promiseResolve(dir.files)
            }
        }).catch(promiseReject)

        return promise
    },

    readFile: async function (server, file) {
        var promiseResolve
        var promiseReject
        var promise = new Promise((resolve, reject) => {
            promiseResolve = resolve
            promiseReject = reject
        })

        if (!server) {
            promiseReject("No server provided!")
            return
        }

        if (!file) {
            promiseReject("No file path provided!")
            return
        }

        if (authorizedOnly(promiseReject) == false) {
            return
        }

        exports.requestAuthorized('/file/' + server + '/read' + file).then(res => {
            if (res.error) {
                promiseReject(res.error)
            }
            else {
                promiseResolve(addFileFuncs(res, file, server))
            }
        }).catch(reason => {
            debugger
            promiseReject(reason)
        })

        return promise
    },

    editFile: async function (server, file, content) {
        var promiseResolve
        var promiseReject
        var promise = new Promise((resolve, reject) => {
            promiseResolve = resolve
            promiseReject = reject
        })

        if (!server) {
            promiseReject("No server provided!")
            return
        }

        if (!file) {
            promiseReject("No file path provided!")
            return
        }

        if (!content) {
            promiseReject("No content to replace the file with! Use deleteFile() instead!")
        }

        if (authorizedOnly(reject) == false) {
            return
        }

        exports.requestAuthorized('/file/' + server + '/edit/' + file, 'POST', {
            "content": content
        })

        return promise
    },

    deleteFile: async function (server, file) {
        var promiseResolve
        var promiseReject
        var promise = new Promise((resolve, reject) => {
            promiseResolve = resolve
            promiseReject = reject
        })

        if (!server) {
            promiseReject("No server provided!")
            return
        }

        if (!file) {
            promiseReject("No file path provided!")
            return
        }

        if (authorizedOnly(promiseReject) == false) {
            return
        }

        exports.requestAuthorized('/file/' + server + '/delete/' + file, 'POST').then(promiseResolve)

        return promise
    },

    createFolder: async function (server, dir, name) {
        var promiseResolve
        var promiseReject
        var promise = new Promise((resolve, reject) => {
            promiseResolve = resolve
            promiseReject = reject
        })

        if (!server) {
            promiseReject("No server provided!")
            return
        }

        if (!dir) {
            promiseReject("No directory path provided!")
            return
        }

        if (authorizedOnly(promiseReject) == false) {
            return
        }

        exports.requestAuthorized('/file/' + server + '/folder/create', 'POST', {
            "name": name,
            "directory": dir
        }).then(promiseResolve)

        return promise
    },

    uploadFile: async function (server, localFile, remotePath) {
        return exports.uploadFile(localFile ,'/file/upload/' + server + '/' + remotePath)
    },

    deleteFolder: async function (server, path) {
        path = path.split("/")
        payload = {name: path[path.length - 1]}
        path.splice(path.length - 1, 1)
        payload.directory = path.join("")
        return exports.requestAuthorized("/file/" + server + "/folder/delete", "POST", payload)
    }
}

function addFileFuncs(object, path, server) {
    object.edit = function (content) {
        return exports.file.editFile(server, path, content)
    }

    object.delete = function () {
        return exports.file.deleteFile(server, path)
    }

    object.read = function () {
        return exports.file.readFile(server, path)
    }

    return object
}

function addDirFuncs(object, path, server) {
    object.forEach((value, index, array) => {
        if (value.blocked == true) {
            return;
        }

        if (value.directory == false) {
            addFileFuncs(object[index], path + object[index].name, server)
            return;
        }

        array[index].list = async function () {
            return exports.file.listDir(server, path)
        }

        array[index].createFolder = async function (name) {
            return exports.file.createFolder(server, path, name)
        }
    })
    object.list = async function () {
        return exports.file.listDir(server, path)
    }

    object.createFolder = async function (name) {
        return exports.file.createFolder(server, path, name)
    }

    return object
}

exports.loginWithHAR = async function (file) {
    var promiseResolve;
    var promiseReject;
    var promise = new Promise((resolve, reject) => {
        promiseResolve = resolve
        promiseReject = reject
    })
    
    try {
        file = fs.readFileSync(file)
        file = JSON.parse(file)
        var response;
        file.log.entries.forEach(value => {
            if (value.request.url == "https://authentication-service-prod.superleague.com/v1/user/login/ghost" && value.request.method == "POST") {
                response = value.response.content.text
            }
        })
        if (response) {
            response = JSON.parse(response)
            exports.ghostLogin(response.slgSessionData.slgUserId, response.slgSessionData.slgSessionId, response.minehutSessionData.sessionId).then(res => {
                promiseResolve(res)
            }).catch(reason => {
                promiseReject(reason)
            })
        }
        else {
            promiseReject("Couldn't find the required information in the file!")
        }
    }
    catch (err) {
        promiseReject(err)
    }

    return promise
}

exports.uploadFile = async function (localPath, remotePath) {
    console.log("uploading " + localPath + " to " + remotePath)
    return new Promise((resolve, reject) => {
        request.post(apiURL + remotePath, {headers: {
            'authorization': iauthorization,
            'x-session-id': ixSessionID,
        }}, (err, res, body) => {
            if (err) {
                reject(err)
            }
            else {
                resolve(JSON.parse(body))
            }
        }).form().append('file', fs.createReadStream(localPath))
    })
}