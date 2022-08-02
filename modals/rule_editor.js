const { MessageActionRow, Modal, MessageButton } = require('discord.js');
const fs = require('fs');

exports.modal = new Modal().setCustomId("rule_editor");

exports.response = async function(interaction, arg) {
    const title = interaction.fields.getTextInputValue('title');
	const content = interaction.fields.getTextInputValue('content');

    const index = parseInt(arg);

    let rules = JSON.parse(fs.readFileSync('./rules.json'));

    rules[index] = {
        title: title,
        content: content
    };

    fs.writeFileSync('./rules.json', JSON.stringify(rules));

    await interaction.reply({content: 'Updated rule ' + (index + 1).toString() + '!\n**Title:** ' + title + "\n**Content:**\n>>> " + content, ephemeral: true});
    await interaction.message.delete();
}