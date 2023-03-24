
const { Client, GatewayIntentBits, Routes, Collection, Events, REST } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

// Configure environment variables on launch.
require('dotenv').config();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Load commands found under the 'commands/' directory into a collection.
client.commands = new Collection();
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
	}
	else {
		console.log(
			`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`,
		);
	}
}

const updatePresence = async (c, state) => {
	c.user.setPresence({
		activites: [{
			name: 'you',
			type: 'WATCHING',
		}],
		state
	});
};

client.once(Events.ClientReady, async c => {
	console.log(`Ready! Logged in as ${c.user.tag}!`);
	
	await updatePresence(c);
});

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

  	const command = interaction.client.commands.get(interaction.commandName);

 	if (!command) {
  		console.error(`No command matching ${interaction.commandName} was found.`);
    	return;
  	}

	try {
		await command.execute(interaction);
	}
	catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({
				content: 'There was an error while executing this command!',
				ephemeral: true,
			});
		}
		else {
			await interaction.reply({
				content: 'There was an error while executing this command!',
				ephemeral: true,
			});
		}
	}
});

async function onExit() {
	console.log("\nExitting...");
	if (inTestingMode) {
		const guild = await client.guilds.fetch(process.env.TESTING_GUILD_ID);

		// Remove all testing guild commands.
		guild.commands.set([]);

		console.log("Removed all commands registered in the testing guild; Exitting now.");
	} else {
		console.log("Production mode does not unregister commands; Exitting now.");
	}
}

process.on("SIGINT", () => {
	onExit().catch(error => {
		console.log(error);
	}).finally(
		process.exit()
	);
});

client.login(process.env.DISCORD_TOKEN);
