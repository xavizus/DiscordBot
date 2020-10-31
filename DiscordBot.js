const ytdl = require('ytdl-core');

class DiscordBot {

    prefix;

    guildList = {};

    commands = {
        'queue': (msg, args) => this.addSongToQueue(msg, args),
        'ping': (msg, args) => this.ping(msg, args),
        'play': (msg, args) => this.play(msg, args),
        'imposter': (msg, args) => this.playSoundFile(msg, args, 'imposter'),
        'medbay': (msg, args) => this.playSoundFile(msg, args, 'medbay'),
        'sus': (msg, args) => this.playSoundFile(msg, args, 'sus'),
        'blame': (msg, args) => this.playSoundFile(msg, args, 'blame'),
        'skip': (msg) => this.skip(msg),
    };

    constructor(prefix = '!') {
        this.prefix = prefix
    }

    commandParser (msg) {
        try {
            if(!msg.content.startsWith(this.prefix)) return false;
            let [command, ...args] = msg.content.split(" ");
            let commandWithoutPrefix = this.removePrefix(command);
            let func = this.commands[commandWithoutPrefix];
            if(!func) return false;
            func(msg, args);
            return true;
        } catch(error) {
            msg.reply(error.message);
            console.error(error.message);
        }

    }

    removePrefix(string) {
        return string.replace(this.prefix, '');
    }

    createGuildList(guildId) {
        if(!Object.keys(this.guildList).includes(guildId)) {
            this.guildList[guildId] = {
                playlist: [],
                connection: null,
                dispatcher: null
            };
        }
    }

    async addSongToQueue(msg, args) {
        try {
            if(!msg.guild) throw new Error('You need to be in a guild to use this command!');
            this.createGuildList(msg.guild.id);
            const url = args[0];
            if(!ytdl.validateURL(url)) throw new Error('Not a Valid youtube url');
            const info = await ytdl.getInfo(url);
            const title = info.playerResponse.videoDetails.title;
            const length = info.playerResponse.videoDetails.lengthSeconds
            this.guildList[msg.guild.id].playlist.push({
                title,
                url,
                addedBy: msg.author.username,
                length
            });
            msg.channel.send(`Added **${title}** to the playlist!`);
        } catch(error) {
            msg.reply('Could not add youtube video because of: ' + error.message)
        }
    }

    ping(msg) {
        msg.channel.send('pong');
    }


    async playSoundFile(msg, args, soundType) {
        const name = args[0];
        await this.joinChannel(msg);
        if(['blame', 'sus'].includes(soundType)) {
            soundType += `_${args[1]}`;
        }
        const guildId = msg.guild.id;
        this.guildList[guildId].dispatcher = this.guildList[guildId].connection.play(`./soundFiles/${name}/${soundType}.mp3`, {
            volume: 0.9
        });
        this.guildList[guildId].dispatcher.on('finish', () => {
            this.guildList[guildId].dispatcher.destroy();
        });
    }

    isEmpty(guildId) {
        return (this.guildList[guildId].playlist.length) ? false : true;
    }

    async joinChannel(msg) {
        const guildId = msg.guild.id;
        this.createGuildList(guildId);
        if(!msg.member.voice.channel) {
            throw new Error('You need to join a voice channel first!');
        }
        if(this.guildList[guildId].connection && this.guildList[guildId].connection.status == 0) {
            return;
        }
        this.guildList[guildId].connection = await msg.member.voice.channel.join();
    }

    createDispatcher(guildId) {
        this.guildList[guildId].dispatcher = this.guildList[guildId].connection.play(ytdl(this.guildList[guildId].playlist[0].url,{filter: 'audioonly'}), {
            volume: 0.2
        });
    }

    isPlaying(guildId) {
        return true;
    }

    async play(msg) {
        if(msg.member.voice.channel) {
            const guildId = msg.guild.id;
            await this.joinChannel(msg);
            if(this.isEmpty(guildId)) return false;
            if(!this.isPlaying(guildId)) return false;
            this.createDispatcher(guildId);
            this.guildList[guildId].playlist.shift();
            this.guildList[guildId].dispatcher.on('finish', () => {
                this.guildList[guildId].dispatcher.destroy();
                if(this.isEmpty(guildId)) {
                    msg.channel.send('The playlist is now empty!');
                    return;
                }
                this.play(msg);
            });
        } else {
            msg.reply('You need to join a voice channel first!');
        }
    }

    stop(msg) {

    }

    skip(msg) {
        if(this.guildList[msg.guild.id].dispatcher) {
            this.guildList[msg.guild.id].dispatcher.end();
        }
    }
}

module.exports = DiscordBot;