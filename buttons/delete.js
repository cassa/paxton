const { MessageEmbed } = require('discord.js');

var message_embed = function(description, colour="#FF0000") {
	return new MessageEmbed()
		.setColor(colour)
		.setDescription(description);
}

exports.response = async function(interaction) {
    if (interaction.message.interaction.user.id === interaction.user.id) {
        try {
            await interaction.message.delete();
            await interaction.reply({embeds: [message_embed("Message deleted!", "#00FF00")], ephemeral: true});
        } catch (error) {
            if (error.message === "Missing Access") {
                await interaction.reply({embeds: [message_embed("Missing access to channel.", "#FF0000")], ephemeral: true})
            } else {
                throw error;
            }
        }
    } else {
        await interaction.reply({embeds: [message_embed("You can only delete commands you sent.", "#FF0000")], ephemeral: true});
    }
}