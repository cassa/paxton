const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow } = require('discord.js');
const { overall, functions } = require("../selects.js");

exports.data = new SlashCommandBuilder()
	.setName('select')
	.setDescription('Test out select menus!')
    .addBooleanOption(option =>
        option.setName("functions")
            .setDescription("Use the example with individual functions for each option?")
            .setRequired(true)
    );

exports.response = async function(interaction) {
    const use_functions = interaction.options.getBoolean("functions");
	await interaction.reply({ content: "Select menus!", components: [new MessageActionRow().addComponents(use_functions ? functions : overall )] });
}

exports.doc = `Test out a select menu!`;
