const { SlashCommandBuilder } = require('@discordjs/builders');
const { sample } = require("../modals.js");

exports.data = new SlashCommandBuilder()
	.setName('modal')
	.setDescription('Test out modals!');

exports.response = async function(interaction) {
	await interaction.showModal(sample);
}

exports.doc = `Test out a modal!`;
