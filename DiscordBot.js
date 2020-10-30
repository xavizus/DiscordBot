const ytdl = require('ytdl-core');

class DiscordBot {

    prefix;

    guildsPlaylists = {};

    commands = new Map([
        ['queue', (msg, args) => this.addSongToQueue(msg, args)],
        ['ping', (msg, args) => this.ping(msg, args)],
        ['play', (msg, args) => this.play(msg, args)],
        ['imposter', (msg, args) => this.playSoundFile(msg, args, 'imposter')],
        ['kill', (msg, args) => this.playSoundFile(msg, args, 'kill')]
    ]);

    constructor(prefix = '!') {
        this.prefix = prefix
    }

    commandParser (msg) {
        try {
            if(!msg.content.startsWith(this.prefix)) return false;
            let [command, ...args] = msg.content.split(" ");
            let commandWithoutPrefix = this.removePrefix(command);
            let func = this.commands.get(commandWithoutPrefix);
            if(!func) return false;
            func(msg, args);
            return true;
        } catch(error) {
            console.error(error.message);
        }

    }

    removePrefix(string) {
        return string.replace(this.prefix, '');
    }

    createGuildPlayList(guildId) {
        if(!Object.keys(this.guildsPlaylists).includes(guildId)) {
            console.log("Guild does not got an playlist. Creates playlist.");
            this.guildsPlaylists[guildId] = [];
        }
    }

    async addSongToQueue(msg, args) {
        try {
            if(!msg.guild) throw new Error('You need to be in a guild to use this command!');
            this.createGuildPlayList(msg.guild.id);
            const url = args[0];
            if(!ytdl.validateURL(url)) throw new Error('Not a Valid youtube url');
            const info = await ytdl.getInfo(url);
            const title = info.playerResponse.videoDetails.title;
            const length = info.playerResponse.videoDetails.lengthSeconds
            this.guildsPlaylists[msg.guild.id].push({
                title,
                url,
                addedBy: msg.author.username,
                length
            });
            msg.channel.send(`Added **${title}** to the playlist!`);
        } catch(error) {
            msg.channel.send('Could not add youtube video because of: ' + error.message)
            console.error(error.message);
        }
    }

    ping(msg) {
        msg.channel.send('pong');
    }


    async playSoundFile(msg, args, soundType) {
        if(msg.member.voice.channel) {
            const name = args[0];
            const connection = await msg.member.voice.channel.join();
            const dispatcher = connection.play(`./soundFiles/${name}/${soundType}.mp3`, {
                volume: 0.9
            });

            dispatcher.on('finish', () => {
                dispatcher.destroy();
            });
        }
    }

    isEmpty(guildId) {
        return (this.guildsPlaylists[guildId].length) ? false : true;
    }

    async play(msg) {
        if(msg.member.voice.channel) {
            const connection = await msg.member.voice.channel.join();
            this.createGuildPlayList(msg.guild.id);

            if(this.isEmpty(msg.guild.id)) return false;

            const dispatcher = connection.play(ytdl(this.guildsPlaylists[msg.guild.id][0].url,{filter: 'audioonly'}), {
                volume: 0.2
            });
            this.guildsPlaylists[msg.guild.id].shift();
            dispatcher.on('finish', () => {
                dispatcher.destroy();
                if(this.isEmpty(msg.guild.id)) {
                    msg.channel.send('The playlist is now empty!');
                    dispatcher.end();
                    return;
                }
                this.play(msg);
            });
        } else {
            msg.reply('You need to join a voice channel first!');
        }
    }

    skip(msg) {

    }
}

module.exports = DiscordBot;