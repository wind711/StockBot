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

client.on('message', message => {
    if (!message.content.startsWith(prefix) || message.author.bot) return;
    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

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
        case 'addlist':
        case 'l':
        case 'list':
        case 'editlist':
        case 'listinfo':
        case 'showlists':
        case 'removelist':
            client.commands.get('watchlist').execute(message, client, command, args);
            break;
    }
});


client.login(process.env['discordToken']);
