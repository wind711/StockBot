const fetch = require("node-fetch");
const Discord = require('discord.js');

function unique(value, index, self) {
    return self.indexOf(value) === index;
}

module.exports = {
    name: 'stock',
    description: "stock info",
    async execute(message, args) {
        if (!args.length) {
            return message.channel.send(`You didn't provide a stock ticker, ${message.author}!`);
        }
        let tickerList = args;
        tickerList = tickerList.map(function (x) { return x.toUpperCase(); });
        tickerList = tickerList.filter(unique);
        for (let i = 0; i < tickerList.length; i++) {
            let ticker = tickerList[i];
            let url = `https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${process.env['stockToken']}`;
            await fetch(url)
                .then((response) => {
                    return response.json()
                })
                .then((data) => {
                    if (data.c != 0) {
                        const stockEmbed = new Discord.MessageEmbed()
                            .setAuthor(ticker)
                            .setTimestamp()
                            .setURL(`https://finance.yahoo.com/quote/${ticker}`)
                            .addFields(
                                { name: 'Previous Close', value: `${parseFloat(data.pc).toLocaleString(undefined, { maximumFractionDigits: 2 })}`, inline: true },
                                { name: 'Open', value: `${parseFloat(data.o).toLocaleString(undefined, { maximumFractionDigits: 2 })}`, inline: true },
                                { name: 'Day\'s range', value: `${parseFloat(data.l).toLocaleString(undefined, { maximumFractionDigits: 2 })} - ${parseFloat(data.h).toLocaleString(undefined, { maximumFractionDigits: 2 })}`, inline: true },
                            );
                        let priceCurrent = parseFloat(data.c);
                        let priceDifference = data.c - data.pc;
                        let diffPercent = priceDifference / data.pc * 100;
                        if (priceDifference > 0) {
                            priceDifference = priceDifference.toLocaleString(undefined, { maximumFractionDigits: 2 })
                            priceDifference = `+${priceDifference}`;
                            stockEmbed.setColor('GREEN');

                        } else if (priceDifference < 0) {
                            priceDifference = priceDifference.toLocaleString(undefined, { maximumFractionDigits: 2 })
                            stockEmbed.setColor('RED');
                        } else {
                            stockEmbed.setColor('GREY');
                        }
                        let fPrice = parseFloat(priceCurrent);
                        stockEmbed.setTitle(`$${fPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })} USD ${priceDifference} (${diffPercent.toLocaleString(undefined, { maximumFractionDigits: 2 })}%)`);
                        message.channel.send({ embed: stockEmbed });
                    }
                    else { message.channel.send(`You might have the wrong ticker: ${ticker}`) };
                })
                .catch((error) => {
                    console.log(error);
                    message.channel.send(`You might have the wrong ticker: ${ticker}`);
                })
        }
        message.delete({ timeout: 30000 })
            .then(msg => console.log(`Deleted message from ${msg.author.username}`))
            .catch(console.error);
    }
}