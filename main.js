const { SlashCommandBuilder } = require('@discordjs/builders');
const { Client, Intents, MessageEmbed } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { token, client_id, testing_guild, testing_mode, bot_name, bot_author } = require('./config.json');
const fs = require('node:fs');

const sleep = ms => new Promise(r => setTimeout(r, ms));

const commands = [];
const command_responses = {};
const button_responses = {};
const button_files = fs.readdirSync('./buttons').filter(file => file.endsWith('.js'));
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of button_files) {
	button_responses[file.slice(0, -3)] = require("./buttons/" + file).response;
}

var commandsEmbed = new MessageEmbed()
	.setColor("#206694")
	.setTitle("Command List")
	.setDescription("Here's a list of commands for " + bot_name + ":\n(Required arguments look like `<this>` and optional ones look like `[this]`)")
	.setAuthor(bot_author);

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	commands.push(command.data.toJSON());
	command_responses[command.data.name] = command.response;

	let command_string = "/" + command.data.name;
	command.data.options.forEach(option => {
		let j = option.toJSON();
		if (j.required) {
			command_string += " <" + option.toJSON().name + ">";
		} else {
			command_string += " [" + option.toJSON().name + "]";
		}
	});
	commandsEmbed = commandsEmbed.addField(command.data.name, command.doc + "\n**Usage:** `" + command_string + "`\n** **");
}
commands.push(new SlashCommandBuilder().setName('commands').setDescription('Displays a list of commands!'));
command_responses["commands"] = async function(interaction) {
	await interaction.reply({embeds: [commandsEmbed]});
}

const rest = new REST({ version: '9' }).setToken(token);
const registered = [];

(async () => {
	try {
		console.log('Started refreshing slash commands.');

		if (testing_mode) {
			let registered_commands = await rest.put(	
				Routes.applicationGuildCommands(client_id, testing_guild),
				{ body: commands },
			);
			registered_commands.forEach(command => {
				registered.push(command.id);
			});
		} else {
			await rest.put(
				Routes.applicationCommands(client_id),
				{ body: commands },
			);
		}

		console.log('Successfully reloaded slash commands.');
	} catch (error) {
		console.error(error);
	}
})();

const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

// Change this if you want to give the bot a custom status
async function change_status() {
	while (true) {
		client.user.setActivity('YOU', { type: 'LISTENING' });
		await sleep(1000 * 60 * 2);
	}
}

client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`);
	// Uncomment to use custom status:
	//change_status().catch(e => {
	//	console.log("Status change failed:");
	//	console.log(e);
	//});
});

client.on('interactionCreate', async interaction => {
	if (interaction.isCommand()) {
		if (interaction.commandName in command_responses) {
			await command_responses[interaction.commandName](interaction);
		} else {
			await interaction.reply({embeds: [message_embed("That command isn't loaded in this version!", "#FF0000")]})
		}
	} else if (interaction.isButton()) {
		const [handler_name, ...rest] = interaction.customId.split(":");
		if (handler_name in button_responses) {
			await button_responses[handler_name](interaction, rest.join(":"));
		} else {
			await interaction.reply({embeds: [message_embed(`That button isn't loaded in this version!\nCustom ID: "${interaction.customId}"`, "#FF0000")]})
		}
	}
});

async function onExit() {
	console.log("\nExitting...");
	if (testing_mode) {
		let guild = await client.guilds.fetch(testing_guild);
		for (let i = 0; i < registered.length; i++) {
			const id = registered[i];
			let command = await guild.commands.fetch(id);
			await command.delete();
			console.log(`- Unregistered '${command.name}'.`);
		}
		console.log("Unregistered all commands; Exitting now.");
	} else {
		console.log("Production mode does not unregister commands; Exitting now.");
	}
}

process.on("SIGINT", () => {
	onExit().then(result => {
		process.exit();
	}).catch(error => {
		console.log(error);
		process.exit();
	});
});

client.login(token);
