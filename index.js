// https://discord.com/api/oauth2/authorize?client_id=687328646830096477&permissions=3303424&scope=bot

// https://discord.js.org/#/docs/main/master/class/Message

require('dotenv').config();
const prefix = require('./config');
const ytdl = require('ytdl-core');
const Discord = require('discord.js');
const {ReactionCollector} = require('discord.js');
const client = new Discord.Client();

let guildsPlaylists = {};

client.on('ready',() => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', async (msg) => {
   if (msg.content === prefix + 'ping') {
       let message = await msg.channel.send('pong');

       const reactionFilter = (reaction) => {
           return true;
       }

       const reactionCollector = new ReactionCollector(message, reactionFilter);
       reactionCollector.on('collect', (reaction, user) => {
           console.log(reaction.message.reactions.cache.get('👍').count);
           console.log(reaction.message.reactions.cache.get('👎').count);
       });

       message.react('👍');
       message.react('👎');

   }
   if(msg.content.startsWith(prefix+'play')) {
       if(!Object.keys(guildsPlaylists).includes(msg.guild.id)) {
           console.log("Guild does not got an playlist. Creates playlist.");
           guildsPlaylists[msg.guild.id] = [];
       }
       const url = msg.content.split('!play ')[1];
       const info = await ytdl.getInfo(url);
       const title = info.playerResponse.videoDetails.title;
       const length = info.playerResponse.videoDetails.lengthSeconds
       guildsPlaylists[msg.guild.id].push({
           title,
           url,
           addedBy: msg.author.username,
           length
       });
       msg.channel.send(`Added **${title}** to the playlist!`)
   }

   if(msg.content === prefix + 'join') {
       if(msg.member.voice.channel) {
           const connection = await msg.member.voice.channel.join();
           const dispatcher = connection.play(ytdl('https://www.youtube.com/watch?v=pw9DYgs5flc',{filter: 'audioonly'}), {
               volume: 0.01
           });
           dispatcher.on('finish', () => {
               console.log('Finished playing!');
               dispatcher.destroy();
               connection.disconnect();
           });
       } else {
           msg.reply('You need to join a voice channel first!');
       }
   }
});

client.login(process.env.token);