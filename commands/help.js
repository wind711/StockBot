module.exports = {
    name: 'help',
    description: "help command",
    execute(message, args) {
        message.channel.send('-stonk __ticker(s)__ to see the current price of the stock');
        message.channel.send(`Watchlist Commands: \n \t  
                                -addlist __listName__ __ticker(s)__ \n \t
                                -list __listName__ to query the bot \n \t
                                -editlist __ticker(s)__ to overwrite \n \t
                                -showLists \n \t
                                -removelist __listName__`)
    }
}