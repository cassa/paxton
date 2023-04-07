const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('slowmo')
        .setDescription("Limits the channel's message rate")
        .addIntegerOption((option) =>
            option
                .setName('rate')
                .setDescription('The rate limit in seconds')
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
        .setDMPermission(false),

    async execute(interaction) {
        const rate = interaction.options.getInteger('rate');

        if (rate < 0 || rate > 21600) {
            await interaction.reply({
                content: 'The rate must be between 0 and 21600 seconds.',
                ephemeral: true,
            });
            return;
        }

        const channel = interaction.channel;

        await channel.setRateLimitPerUser(rate);

        if (rate === 0) {
            await interaction.reply({
                content: `Removed the rate limit for ${channel.name}.`,
                ephemeral: true,
            });
            return;
        }

        await interaction.reply({
            content: `Set the rate limit for ${channel.name} to ${rate} seconds.`,
            ephemeral: true,
        });
    },
};
