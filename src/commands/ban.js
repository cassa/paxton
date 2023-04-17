const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
} = require('discord.js');

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
        const reason =
            interaction.options.getString('reason') ?? 'No reason provided';

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

        const confirmButton = new ButtonBuilder()
            .setCustomId('confirm')
            .setLabel('Confirm Ban')
            .setStyle(ButtonStyle.Danger);

        const cancelButton = new ButtonBuilder()
            .setCustomId('cancel')
            .setLabel('Cancel Ban')
            .setStyle(ButtonStyle.Secondary);

        const row = new ActionRowBuilder().addComponents([
            confirmButton,
            cancelButton,
        ]);

        const response = await interaction.reply({
            content: `Are you sure you want to ban ${target.username} for reason: ${reason}?`,
            components: [row],
        });

        const filter = (i) => i.user.id === interaction.user.id;
        try {
            const confirmation = await response.awaitMessageComponent({
                filter,
                time: 60 * 1000,
            });

            if (confirmation.customId === 'confirm') {
                await targetMember.ban({ reason });
                await confirmation.update({
                    content: `${target.username} has been banned for reason: ${reason}`,
                    components: [],
                });
            } else {
                await confirmation.update({
                    content: `Ban cancelled.`,
                    components: [],
                });
            }
        } catch (error) {
            await interaction.editReply({
                content: `Timed out waiting for a response from ${interaction.user.username}.`,
                components: [],
            });
            return;
        }
    },
};
