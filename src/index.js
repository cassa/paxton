const {
    Client,
    GatewayIntentBits,
    Collection,
    Events,
    ActivityType,
} = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

// Configure environment variables on launch.
require('dotenv').config();

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildModeration],
});

client.commands = new Collection();
client.cooldowns = new Collection();

// Load commands found under the 'commands/' directory into a collection.
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);

    // Set a new item in the Collection with the key as the command name and the value as the exported module.
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
    } else {
        console.log(
            `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
        );
    }
}

client.once(Events.ClientReady, async (c) => {
    console.log(`Ready! Logged in as ${c.user.tag}!`);

    c.user.setPresence({
        activities: [
            {
                name: 'you!',
                type: ActivityType.Watching,
            },
        ],
        state: 'dnd',
    });
});

client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) {
        console.error(
            `No command matching ${interaction.commandName} was found.`
        );
        return;
    }

    const { cooldowns } = client;

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
});

client.login(process.env.DISCORD_TOKEN);
