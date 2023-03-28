const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

const CHAT_PURGE_SECONDS = 60 * 60 * 24 * 7;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Select a member and ban them.')
        .addUserOption((option) =>
            option
                .setName('target')
                .setDescription('The member to ban')
                .setRequired(true)
        )
        .addStringOption((option) =>
            option.setName('reason').setDescription('The reason for banning.')
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

        if (!targetMember.bannable) {
            await interaction.reply({
                content: `Failed to ban ${target.username} because they cannot be banned by you.`,
                ephemeral: true,
            });
            return;
        }

        const reason =
            interaction.options.getString('reason') ?? 'No reason provided';

        await targetMember
            .ban({
                deleteMessageSeconds: CHAT_PURGE_SECONDS,
                reason,
            })
            .then(() => {
                interaction.reply({
                    content: `Banning ${target.username} for reason: ${reason}`,
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
