const fetch = require("node-fetch");
const Discord = require('discord.js');

function unique(value, index, self) {
    return self.indexOf(value) === index;
}

module.exports = {
    name: 'stock',
    description: "stock info",
    execute(message, args) {
        if (!args.length) {
            return message.channel.send(`You didn't provide a stock ticker, ${message.author}!`);
        }
        var tickerList = args;
        tickerList = tickerList.map(function(x){return x.toUpperCase(); });
        tickerList = tickerList.filter(unique);
        for (let i = 0; i < tickerList.length; i++) {
            let ticker = tickerList[i];
            let url = `https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${process.env['stockToken']}`;
            fetch(url)
                .then((response) => {
                    return response.json()
                })
                .then((data) => {
                    if(data.c != 0) {
                        const stockEmbed = new Discord.MessageEmbed()
                            .setAuthor(ticker)
                            .setTimestamp()
                            .setURL(`https://finance.yahoo.com/quote/${ticker}`)
                            .addFields(
                                { name: 'Previous Close', value: `${parseFloat(data.pc).toLocaleString(undefined, {maximumFractionDigits: 2})}`, inline: true },
                                { name: 'Open', value: `${parseFloat(data.o).toLocaleString(undefined, {maximumFractionDigits: 2})}`, inline: true },
                                { name: 'Day\'s range', value: `${parseFloat(data.l).toLocaleString(undefined, {maximumFractionDigits: 2})} - ${parseFloat(data.h).toLocaleString(undefined, {maximumFractionDigits: 2})}`, inline: true },
                            );
                        if (ticker === "GME") {
                            message.channel.send(':rocket:');
                        };
                        var priceCurrent = parseFloat(data.c);
                        var priceDifference = data.c - data.pc;
                        var diffPercent = priceDifference/data.pc * 100;
                        if (priceDifference > 0) {
                            priceDifference = priceDifference.toLocaleString(undefined, {maximumFractionDigits: 2})
                            priceDifference = `+${priceDifference}`;
                            stockEmbed.setColor('GREEN');

                        } else if (priceDifference < 0){
                            priceDifference = priceDifference.toLocaleString(undefined, {maximumFractionDigits: 2})
                            stockEmbed.setColor('RED');
                        } else {
                            stockEmbed.setColor('GREY');
                        }
                        var fPrice = parseFloat(priceCurrent);
                        stockEmbed.setTitle(`$${fPrice.toLocaleString(undefined, {maximumFractionDigits: 2})} USD ${priceDifference} (${diffPercent.toLocaleString(undefined, {maximumFractionDigits: 2})}%)`);
                        message.channel.send({embed:stockEmbed});
                    } else {message.channel.send(`You might have the wrong ticker: ${ticker}`)};
                }) 
                .catch((error) => {
                    message.channel.send(`You might have the wrong ticker: ${ticker}`);
                })
        }
    }
}