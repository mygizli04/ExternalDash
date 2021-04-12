const mc = require('minecraft-protocol')
var client = mc.createClient({
    host: "minehut.com",
    username: process.env.mcUsername,
    password: process.env.mcPassword,
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