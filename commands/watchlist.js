const Sequelize = require('sequelize');

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

module.exports = {

    name: 'watchlist',
    description: "watchlist command",
    async execute(message, client, command, args) {
        console.log(command);
        const commandArgs = args.join(' ');
        if (command === 'addlist' || command === 'al') {
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
        } else if (command === 'list' || command === 'l') {
            const tagName = commandArgs;
    
            // equivalent to: SELECT * FROM tags WHERE name = 'tagName' LIMIT 1;
            const tag = await Tags.findOne({ where: { name: tagName } });
            if (tag) {
                // equivalent to: UPDATE tags SET usage_count = usage_count + 1 WHERE name = 'tagName';
                tag.increment('usage_count');
                if (tag.get('description') != '') 
                {
                    try {
                        var input = tag.get('description').split(' ');
                        return client.commands.get('stock').execute(message, input);
                    } catch (error) {
                        console.log(error);
                    }
                }
            }
            return message.reply(`Could not find list: ${tagName}`);
        } else if (command === 'editlist' || command === 'el') {
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
        } else if (command === 'showlists' || command === 'sl') {
            // equivalent to: SELECT name FROM tags;
            const tagList = await Tags.findAll({ attributes: ['name'] });
            const tagString = tagList.map(t => t.name).join(', ') || 'No lists set.';
            return message.channel.send(`Lists: ${tagString}`);
        } else if (command === 'removelist' || command === 'rl') {
            const tagName = commandArgs;
            // equivalent to: DELETE from tags WHERE name = ?;
            const rowCount = await Tags.destroy({ where: { name: tagName } });
            if (!rowCount) return message.reply('That list did not exist.');
    
            return message.reply('list deleted.');
        }
    }
}