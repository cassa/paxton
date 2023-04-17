const { Events, Collection } = require('discord.js');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (!interaction.isChatInputCommand()) return;

        const command = interaction.client.commands.get(
            interaction.commandName
        );

        if (!command) {
            console.error(
                `No command matching ${interaction.commandName} was found.`
            );
            return;
        }

        const { cooldowns } = interaction.client;

        if (!cooldowns.has(command.data.name)) {
            cooldowns.set(command.data.name, new Collection());
        }

        const now = Date.now();
        const timestamps = cooldowns.get(command.data.name);
        const defaultCooldownSeconds = 3;
        const cooldownMs = (command.cooldown ?? defaultCooldownSeconds) * 1000;

        if (timestamps.has(interaction.user.id)) {
            const expirationTimestamp =
                timestamps.get(interaction.user.id) + cooldownMs;

            if (now < expirationTimestamp) {
                const timeLeft = Math.floor(expirationTimestamp / 1000);
                interaction.reply({
                    content: `Please wait <t:${timeLeft}:R> seconds before reusing the \`${command.data.name}\` command.`,
                    ephemeral: true,
                });
                setTimeout(
                    () =>
                        interaction.editReply({
                            content: `You can now use the \`${command.data.name}\` command again!`,
                            ephemeral: true,
                        }),
                    expirationTimestamp - now
                );
                return;
            }
        }

        timestamps.set(interaction.user.id, now);
        setTimeout(() => timestamps.delete(interaction.user.id), cooldownMs);

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({
                    content: 'There was an error while executing this command!',
                    ephemeral: true,
                });
            } else {
                await interaction.reply({
                    content: 'There was an error while executing this command!',
                    ephemeral: true,
                });
            }
        }
    },
};
