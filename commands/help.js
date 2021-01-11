module.exports = {
    name: 'help',
    description: "help command",
    execute(message, args) {
        message.channel.send('-stonk TICKER to see the current price of the stock');
        message.channel.send('Supports multiple tickers in 1 command');
        message.channel.send(':rocket:');
    }
}