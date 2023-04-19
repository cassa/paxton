const { REST, Routes } = require('discord.js');
const { loadCommands } = require('./load-commands');

// Configure environment variables on launch.
require('dotenv').config();

const commands = loadCommands();
const payload = commands.map(({ command }) => command.data.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

const inTestingMode = 'TESTING_GUILD_ID' in process.env;

(async () => {
    try {
        if (inTestingMode) {
            console.log(
                `Started removing ${commands.length} application (/) commands in the testing guild.`
            );

            await rest.put(
                Routes.applicationGuildCommands(
                    process.env.CLIENT_ID,
                    process.env.TESTING_GUILD_ID
                ),
                { body: [] }
            );

            await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), {
                body: [],
            });

            console.log(
                `Successfully removed application (/) commands in the testing guild.`
            );
        }

        console.log(
            `Started refreshing ${commands.length} application (/) commands.`
        );

        if (inTestingMode) {
            // The put method is used to fully refresh all commands in the testing_guild only.
            const data = await rest.put(
                Routes.applicationGuildCommands(
                    process.env.CLIENT_ID,
                    process.env.TESTING_GUILD_ID
                ),
                { body: payload }
            );

            console.log(
                `Successfully reloaded ${data.length} application (/) commands in the testing guild.`
            );
        } else {
            // The put method is used to fully refresh all commands globally
            const data = await rest.put(
                Routes.applicationCommands(process.env.CLIENT_ID),
                { body: payload }
            );

            console.log(
                `Successfully reloaded ${data.length} application (/) commands globally.`
            );
        }
    } catch (error) {
        // And of course, make sure you catch and log any errors!
        console.error(error);
    }
})();
