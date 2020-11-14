const discord = require('discord.js');
const fs = require('fs');
const config = JSON.parse(fs.readFileSync("config.json"))
const ytdl = require("ytdl-core")

const bot = new discord.Client();

bot.on("ready", () => {
    console.log("Bot online |'_'|")
})

let servers = []

function musicPlayer(connection, voiceChannel, i) {
    console.log(i)
    console.log(servers[voiceChannel.guild.id].queue)
    var dispatcher = connection.play(ytdl(servers[voiceChannel.guild.id].queue[i], { quality: 'highestaudio' }))
        .on("finish", () => {
            if (servers[voiceChannel.guild.id].queue[i + 1]) {
                musicPlayer(connection, voiceChannel, i + 1)
            }
            else {
                servers[voiceChannel.guild.id].playing = false
                voiceChannel.leave()

            }
        })
        .on("error", error => {
            console.log(error)
        })
}

bot.on('message', async message => {
    if (!servers[message.guild.id]) {
        servers[message.guild.id] = { queue: [], playing: false }
    }
    if (message.author.bot) return
    if (message.content.startsWith(config.prefix)) {
        let args = message.content.split(" ")
        switch (args[1]) {
            case "play"://dt play <url>
                let voiceChannel = message.member.voice.channel
                if (!voiceChannel) {
                    message.channel.send("Connect your voice first")
                    return
                }
                try {
                    var connection = await voiceChannel.join()
                } catch (error) {
                    console.log(error)
                }
                servers[message.guild.id].queue.push(args[2])
                if (!servers[message.guild.id].playing) {
                    musicPlayer(connection, voiceChannel, 0)
                    servers[message.guild.id].playing = true
                }
                break
            case "role"://dt role <message id> <emoji> <role id>
                message.channel.messages.fetch(args[2])
                    .then(message => {
                        message.react(args[3])
                    })
                
                bot.on("messageReactionAdd",async (reaction,user)=>{
                    if(reaction.message.id==args[2] && !user.bot){
                        if(reaction.emoji.name==args[3]) reaction.message.guild.members.cache.get(user.id).roles.add(args[4])
                        
                    }
                })
                bot.on("messageReactionRemove",async (reaction,user)=>{
                    if(reaction.message.id==args[2] && !user.bot){
                        if(reaction.emoji.name==args[3]) reaction.message.guild.members.cache.get(user.id).roles.remove(args[4])
                        
                    }
                })
                break
        }
    }
    else return
})
//     if (message.content.search(config.prefix) != -1) {

//         if (!servers[message.guild.id])
//             servers[message.guild.id] = { queue: [] }

//         let server = servers[message.guild.id]

//         let args = message.content.split(" ")

//         switch (args[1]) {
//             case "play":
//                 function play(connection) {
//                     server.dispatcher = connection.play(ytdl(server.queue[0], { filter: "audioonly" }))


//                     server.dispatcher.stream.on("end", () => {
//                         console.log("ended")
//                         if (server.queue[0]) {
//                             server.queue.shift()
//                             play(connection)

//                         }
//                         else
//                             connection.disconnect()
//                     })
//                 }
//                 if (!args[2]) {
//                     message.channel.send("You need to provide a name of a song")
//                 }
//                 else if (!message.member.voice.channel) {
//                     message.channel.send("Connect your voice first")
//                 }
//                 else {
//                     server.queue.push(args[2])
//                     console.log(server.queue)
//                     // console.log(message.guild.voice)


//                     if (!message.guild.voice) {
//                         console.log("totka")
//                         message.member.voice.channel.join()
//                             .then(connection => {
//                                 play(connection)
//                             })
//                     }
//                     else {

//                     }


//                 }
//                 break
//         }
//     }
// })

bot.login(process.env.TOKEN)
