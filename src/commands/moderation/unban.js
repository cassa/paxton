const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unban')
        .setDescription('Select a member and unban them.')
        .addUserOption((option) =>
            option
                .setName('target')
                .setDescription('The member to unban')
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .setDMPermission(false),

    async execute(interaction) {
        const target = interaction.options.getUser('target');
        const targetMember = interaction.guild.members.cache.get(target.id);

        if (!targetMember) {
            await interaction.reply({
                content: `Failed to ban ${target.username} because they are no longer in the guild.`,
                ephemeral: true,
            });
            return;
        }

        await interaction.guild.members
            .unban(target)
            .then(() => {
                interaction.reply({
                    content: `Unbanning ${target.username}`,
                    ephemeral: true,
                });
            })
            .catch((error) => {
                interaction.reply({
                    content: `Failed to ban ${target.username}: ${error.message}`,
                    ephemeral: true,
                });
                console.error(error);
            });
    },
};
