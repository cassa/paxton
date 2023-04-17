const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
} = require('discord.js');

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
        const reason =
            interaction.options.getString('reason') ?? 'No reason provided';

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

        const confirmButton = new ButtonBuilder()
            .setCustomId('confirm')
            .setLabel('Confirm Kick')
            .setStyle(ButtonStyle.Danger);

        const cancelButton = new ButtonBuilder()
            .setCustomId('cancel')
            .setLabel('Cancel Kick')
            .setStyle(ButtonStyle.Secondary);

        const row = new ActionRowBuilder().addComponents([
            confirmButton,
            cancelButton,
        ]);

        const response = await interaction.reply({
            content: `Are you sure you want to kick ${target.username} for reason: ${reason}?`,
            components: [row],
        });

        const filter = (i) => i.user.id === interaction.user.id;
        try {
            const confirmation = await response.awaitMessageComponent({
                filter,
                time: 60 * 1000,
            });

            if (confirmation.customId === 'confirm') {
                await targetMember.kick(reason);
                await interaction.editReply({
                    content: `${target.username} has been kicked for reason: ${reason}`,
                    components: [],
                });
            } else {
                await interaction.editReply({
                    content: `Kick cancelled.`,
                    components: [],
                });
            }
        } catch (error) {
            await interaction.editReply({
                content: `Timed out waiting for response from ${interaction.user.username}.`,
                components: [],
            });
        }
    },
};
