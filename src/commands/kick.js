const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Select a member and kick them.')
        .addUserOption((option) =>
            option
                .setName('target')
                .setDescription('The member to kick')
                .setRequired(true)
        )
        .addStringOption((option) =>
            option.setName('reason').setDescription('The reason for kicking.')
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
        .setDMPermission(false),

    async execute(interaction) {
        const target = interaction.options.getUser('target');
        const targetMember = interaction.guild.members.cache.get(target.id);

        if (!targetMember) {
            await interaction.reply({
                content: `Failed to kick ${target.username} because they are no longer in the guild.`,
                ephemeral: true,
            });
            return;
        }

        if (!targetMember.kickable) {
            await interaction.reply({
                content: `Failed to kick ${target.username} because they cannot be kicked by you.`,
                ephemeral: true,
            });
            return;
        }

        const reason =
            interaction.options.getString('reason') ?? 'No reason provided';

        await targetMember
            .kick(reason)
            .then(() => {
                interaction.reply({
                    content: `Kicking ${target.username} for reason: ${reason}`,
                    ephemeral: true,
                });
            })
            .catch((error) => {
                interaction.reply({
                    content: `Failed to kick ${target.username}: ${error.message}`,
                    ephemeral: true,
                });
                console.error(error);
            });
    },
};
