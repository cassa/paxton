const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const fs = require('fs');

exports.data = new SlashCommandBuilder()
	.setName('print-rules')
	.setDescription('Print all the rules to a channel');

exports.response = async function(interaction) {
    const rules = JSON.parse(fs.readFileSync('./rules.json'));
    for (var i = 0; i < rules.length; i++) {
        var embed = new MessageEmbed()
            .setTitle(i.toString() + ". " + rules[i].title)
            .setDescription(rules[i].content)
        interaction.channel.send({embeds: [embed]})
    }
	await interaction.reply({content: "Rules printed!", ephemeral: true});
}

exports.doc = `Print the rules!`;
