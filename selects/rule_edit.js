const { MessageActionRow, Modal, TextInputComponent } = require('discord.js');
const fs = require('fs');

exports.response = async function(interaction, selections) {
    const rules = JSON.parse(fs.readFileSync('./rules.json'));
    const index = selections[0];
    const editor = new Modal()
        .setCustomId('rule_editor:' + index.toString())
        .setTitle('Rule Editor')
        .addComponents(
            new MessageActionRow().addComponents(
                new TextInputComponent()
                    .setCustomId('title')
                    .setLabel("Rule title")
                    .setStyle('SHORT')
                    .setPlaceholder("You know the rules, and so do I...")
                    .setValue(index < rules.length ? rules[selections].title : "")
            ),
            new MessageActionRow().addComponents(
                new TextInputComponent()
                    .setCustomId('content')
                    .setLabel("The content of the rule")
                    .setStyle('PARAGRAPH')
                    .setPlaceholder("A full commitment's what I'm thinking of, you wouldn't get this from any other guy...")
                    .setValue(index < rules.length ? rules[selections].content : "")
            )
        );

    await interaction.showModal(editor);
}