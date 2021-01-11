let token = 'bvtt3a748v6pijnf025g';
const { SystemChannelFlags } = require("discord.js");
const fetch = require("node-fetch");

module.exports = {
    name: 'stock',
    description: "stock info",
    execute(message, args) {
        if (!args.length) {
            return message.channel.send(`You didn't provide a stock ticker, ${message.author}!`);
        }
        for (let i = 0; i < args.length; i++) {
            let ticker = args[i].toUpperCase();
            let url = `https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${token}`;
            fetch(url)
                .then((response) => {
                    return response.json()
                })
                .then((data) => {
                    if(data.c != 0) {
                        message.channel.send(`${ticker}: $${data.c}`);
                    } else {message.channel.send(`You might have the wrong ticker: ${ticker}`)};
                }) 
                .catch((err) => {
                    console.log(err);
                })
        }
    }
}