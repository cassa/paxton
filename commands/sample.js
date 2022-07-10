const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const { bot_author } = require('../config.json');

exports.data = new SlashCommandBuilder()
	.setName('sample')
	.setDescription('A sample comamnd :D');

var delete_row = new MessageActionRow()
	.addComponents(
		new MessageButton()
			.setCustomId("delete")
			.setLabel("Delete")
			.setEmoji("🗑️")
			.setStyle("DANGER"),
	);

exports.response = async function(interaction) {
	var embed = new MessageEmbed()
		.setColor("#206694")
		.setTitle("Sample Embed!")
		.setDescription("A little description")
		.setAuthor(bot_author)
		.addField("Field", "Field content")
		.addField("Second field", "More content");
	await interaction.reply({content: "Hello! This is a sample message!", embeds: [embed], components: [delete_row]});
}

exports.doc = `This appears in the '/commands' display!`
