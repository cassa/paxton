const fs = require('fs');
const path = require('path');

module.exports = {
    loadCommands() {
        // Load commands found under the 'commands/' directory into a collection.
        const commands = [];

        const foldersPath = path.join(__dirname, 'commands');
        const commandFolders = fs.readdirSync(foldersPath);

        for (const file of commandFolders) {
            const commandsPath = path.join(foldersPath, file);
            const commandFiles = fs
                .readdirSync(commandsPath)
                .filter((file) => file.endsWith('.js'));

            for (const file of commandFiles) {
                const filePath = path.join(commandsPath, file);
                const command = require(filePath);

                // Set a new item in the Collection with the key as the command name and the value as the exported module.
                if ('data' in command && 'execute' in command) {
                    commands.push({ name: command.data.name, command });
                } else {
                    console.log(
                        `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
                    );
                }
            }
        }

        return commands;
    },
};
