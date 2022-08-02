const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageSelectMenu } = require('discord.js');
const fs = require('fs');

exports.data = new SlashCommandBuilder()
	.setName('edit-rules')
	.setDescription('Edit the rules');

exports.response = async function(interaction) {
	const rules = JSON.parse(fs.readFileSync('./rules.json'));

	var options = [];
	for (var i = 0; i < rules.length; i++) {
		options.push({
			label: rules[i].title,
			value: i.toString()
		});
	}
	options.push({
		label: 'Add rule',
		value: rules.length.toString()
	});

	const select = new MessageSelectMenu()
		.setCustomId("rule_edit")
		.addOptions(options)
		.setMaxValues(1)
		.setMinValues(1);

	await interaction.reply({ content: "Pick a rule to edit or add a new one!", components: [new MessageActionRow().addComponents(select)] });
}

exports.doc = `Edit the rules`;
