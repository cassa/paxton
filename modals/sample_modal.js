const { MessageActionRow, Modal, TextInputComponent } = require('discord.js');

exports.modal = new Modal()
    .setCustomId('sample')
    .setTitle('Sample Modal')
    .addComponents(
        new MessageActionRow().addComponents(
            new TextInputComponent()
                .setCustomId('name')
                .setLabel("What's your name?")
                .setStyle('SHORT')
        ),
        new MessageActionRow().addComponents(
            new TextInputComponent()
                .setCustomId('about')
                .setLabel("Tell us a bit about yourself")
                .setStyle('PARAGRAPH')
        )
    );

exports.response = async function(interaction) {
    const name = interaction.fields.getTextInputValue('name');
	const about = interaction.fields.getTextInputValue('about');

    await interaction.reply('Your submission was recieved successfully!\n**Name:** ' + name + "\n**About:** " + about);
}