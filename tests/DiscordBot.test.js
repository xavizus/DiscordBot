const chai = require('chai');
require('chai').should();

const DiscordBot = require('../DiscordBot');

describe('DiscordBot', () => {
    it('should return string without prefix', () => {
        const prefix = "!20";
        const tempDiscordBot = new DiscordBot(prefix);
        const string = "Command";
        tempDiscordBot.removePrefix(prefix+string).should.equal(string);
    });

    it('should run correct function', () => {
        const discordBot = new DiscordBot();

        discordBot.commandParser({content: '!queue https://www.youtube.com/watch?v=pw9DYgs5flc', guild: {id: 1200123}}).should.be.true;
        discordBot.commandParser({content: '!notAcommand'}).should.be.false;
    });
});
