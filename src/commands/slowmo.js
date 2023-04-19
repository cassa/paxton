const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

// channel parameter

module.exports = {
    data: new SlashCommandBuilder()
        .setName('slowmo')
        .setDescription("Limits the channel's message rate")
        .addSubcommand((subcommand) =>
            subcommand
                .setName('disable')
                .setDescription('Disables the rate limit')
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName('status')
                .setDescription('Shows the current rate limit')
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName('set')
                .setDescription('Sets the rate limit')
                .addIntegerOption((option) =>
                    option
                        .setName('rate')
                        .setDescription('The rate limit in seconds')
                        .setRequired(true)
                )
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
        .setDMPermission(false),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'disable') {
            await interaction.channel.setRateLimitPerUser(0);
            await interaction.reply({
                content: `Removed the rate limit for ${interaction.channel.name}.`,
                ephemeral: true,
            });
        } else if (subcommand === 'status') {
            const rate = interaction.channel.rateLimitPerUser;
            if (rate === 0) {
                await interaction.reply({
                    content: `There is no rate limit for ${interaction.channel.name}.`,
                    ephemeral: true,
                });
            } else {
                await interaction.reply({
                    content: `The rate limit for ${interaction.channel.name} is ${rate} seconds.`,
                    ephemeral: true,
                });
            }
        } else if (subcommand === 'set') {
            const rate = interaction.options.getInteger('rate');

            if (rate < 1 || rate > 21600) {
                await interaction.reply({
                    content: 'The rate must be between 1 and 21600 seconds.',
                    ephemeral: true,
                });
                return;
            }

            await interaction.channel.setRateLimitPerUser(rate);
            await interaction.reply({
                content: `Set the rate limit for ${interaction.channel.name} to ${rate} seconds.`,
                ephemeral: true,
            });
        }
    },
};
