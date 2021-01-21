require('dotenv').config()
const Discord = require('discord.js');
const Sequelize = require('sequelize');

const client = new Discord.Client();

const prefix = '-';

const fs = require('fs');

const sequelize = new Sequelize('database', 'user', 'password', {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    storage: 'database.sqlite',
});

const Tags = sequelize.define('tags', {
    name: {
        type: Sequelize.STRING,
        unique: true,
    },
    description: Sequelize.STRING,
    username: Sequelize.STRING,
    usage_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false,
    },
});

client.commands = new Discord.Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);

    client.commands.set(command.name, command);
}

client.once('ready', () => {
    Tags.sync();
    console.log('StockBot started');
});

client.on('message', async message => {
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();
    const commandArgs = args.join(' ');

    switch (command) {
        case 'ping':
            client.commands.get('ping').execute(message, args);
            break;
        case 'help':
            client.commands.get('help').execute(message, args);
            break;
        case 'stonk':
        case 's':
            client.commands.get('stock').execute(message, args);
            break;
    }

    if (command === 'addlist') {
        const splitArgs = commandArgs.split(' ');
        const tagName = splitArgs.shift();
        if (tagName === '') {
            return message.reply('Empty list name is not accepted');
        }
        const tagDescription = splitArgs.join(' ');

        try {
            // equivalent to: INSERT INTO tags (name, description, username) values (?, ?, ?);
            const tag = await Tags.create({
                name: tagName,
                description: tagDescription,
                username: message.author.username,
            });
            return message.reply(`List ${tag.name} added.`);
        }
        catch (e) {
            if (e.name === 'SequelizeUniqueConstraintError') {
                return message.reply('That list already exists.');
            }
            return message.reply('Something went wrong with adding a list.');
        }
    } else if (command === 'list') {
        const tagName = commandArgs;

        // equivalent to: SELECT * FROM tags WHERE name = 'tagName' LIMIT 1;
        const tag = await Tags.findOne({ where: { name: tagName } });
        if (tag) {
            // equivalent to: UPDATE tags SET usage_count = usage_count + 1 WHERE name = 'tagName';
            tag.increment('usage_count');
            if (tag.get('description') != '') 
            {
                try {
                    console.log(tag.get('description'));
                    var input = tag.get('description').split(' ');
                    return client.commands.get('stock').execute(message, input);
                } catch (error) {
                    console.log(error);
                }
            }
        }
        return message.reply(`Could not find list: ${tagName}`);
    } else if (command === 'editlist') {
        const splitArgs = commandArgs.split(' ');
        const tagName = splitArgs.shift();
        const tagDescription = splitArgs.join(' ');

        // equivalent to: UPDATE tags (description) values (?) WHERE name='?';
        const affectedRows = await Tags.update({ description: tagDescription }, { where: { name: tagName } });
        if (affectedRows > 0) {
            return message.reply(`List ${tagName} was edited.`);
        }
        return message.reply(`Could not find a list with name ${tagName}.`);
    } else if (command === 'listinfo') {
        const tagName = commandArgs;

        // equivalent to: SELECT * FROM tags WHERE name = 'tagName' LIMIT 1;
        const tag = await Tags.findOne({ where: { name: tagName } });
        if (tag) {
            return message.channel.send(`${tagName} was created by ${tag.username} at ${tag.createdAt} and has been used ${tag.usage_count} times. \n 
            ${tag.get('description')}`);
        }
        return message.reply(`Could not find list: ${tagName}`);
    } else if (command === 'showlists') {
        // equivalent to: SELECT name FROM tags;
        const tagList = await Tags.findAll({ attributes: ['name'] });
        const tagString = tagList.map(t => t.name).join(', ') || 'No lists set.';
        return message.channel.send(`Lists: ${tagString}`);
    } else if (command === 'removelist') {
        const tagName = commandArgs;
        // equivalent to: DELETE from tags WHERE name = ?;
        const rowCount = await Tags.destroy({ where: { name: tagName } });
        if (!rowCount) return message.reply('That list did not exist.');

        return message.reply('list deleted.');
    }
});


client.login(process.env['discordToken']);
