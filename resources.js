const { MessageEmbed } = require('discord.js');
const config = require('./config.json');

exports.message_embed = function(description, colour="#FF0000") {
	return new MessageEmbed()
		.setColor(colour)
		.setDescription(description);
}
exports.sleep = ms => new Promise(r => setTimeout(r, ms));

exports.random_choice = function(array) {
	return array[Math.floor((Math.random()*array.length))];
}

exports.author_embed = function() {
	const colour = config.colour ?? config.color ?? null;
	if (colour !== null) {
		return new MessageEmbed().setAuthor(config.bot_author).setColor(colour);
	} else {
		return new MessageEmbed().setAuthor(config.bot_author);
	}
}