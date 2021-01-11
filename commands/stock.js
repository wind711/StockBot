const { SystemChannelFlags } = require("discord.js");
const fetch = require("node-fetch");

module.exports = {
    name: 'stonk',
    description: "stock info",
    execute(message, args) {
        if (!args.length) {
            return message.channel.send(`You didn't provide a stock ticker, ${message.author}!`);
        }
        for (let i = 0; i < args.length; i++) {
            let ticker = args[i].toUpperCase();
            let url = `https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${process.env['stockToken']}`;
            fetch(url)
                .then((response) => {
                    return response.json()
                })
                .then((data) => {
                    if(data.c != 0) {
                        if (ticker === "GME") {
                            message.channel.send(':rocket:')
                        };
                        try {var priceCurrent = data.c.toLocaleString();
                        }catch (error) {
                        }
                        var priceDifference = data.c - data.pc;
                        var diffPercent = priceDifference/data.pc * 100;
                        if (priceDifference > 0) {
                            priceDifference = priceDifference.toFixed(2);
                            priceDifference = `+${priceDifference}`;
                        } else {
                            priceDifference = priceDifference.toFixed(2);
                        }

                        
                        message.channel.send(`${ticker}: $${priceCurrent} USD ${priceDifference} (${diffPercent.toFixed(2)}%)`);
                    } else {message.channel.send(`You might have the wrong ticker: ${ticker}`)};
                }) 
                .catch((err) => {
                    console.log(err);
                })
        }
    }
}