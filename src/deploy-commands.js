const { REST, Routes } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

// Configure environment variables on launch.
require('dotenv').config();

const commands = [];
// Grab all the command files from the commands directory you created earlier
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith('.js'));

// Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    commands.push(command.data.toJSON());
}

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
                { body: commands }
            );

            console.log(
                `Successfully reloaded ${data.length} application (/) commands in the testing guild.`
            );
        } else {
            // The put method is used to fully refresh all commands globally
            const data = await rest.put(
                Routes.applicationCommands(process.env.CLIENT_ID),
                { body: commands }
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
