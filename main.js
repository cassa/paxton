const { SlashCommandBuilder } = require('@discordjs/builders');
const { Client, Intents } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { token, client_id, testing_guild, testing_mode, bot_name, bot_author } = require('./config.json');
const fs = require('node:fs');

const { message_embed, sleep, author_embed } = require("./resources.js");

const commands = [];
const functional_select_responses = {};
const select_responses = {};
const command_responses = {};
const button_responses = {};
const modal_responses = {};
const modal_files = fs.readdirSync('./modals').filter(file => file.endsWith('.js'));
const button_files = fs.readdirSync('./buttons').filter(file => file.endsWith('.js'));
const command_files = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
const select_files = fs.readdirSync('./selects').filter(file => file.endsWith('.js'));

for (const file of select_files) {
	const name = file.slice(0, -3);
	const mod = require("./selects/" + file);
	if ((mod.response === undefined || mod.response === null) && (mod.min ?? 1 === 1) && (mod.max ?? 1 === 1)) {
		functional_select_responses[name] = {};
		for (const [value, item] of Object.entries(mod.items)) {
			if (item.response === undefined || item.response === null) {
				throw new Error(name + ": If there is no response function for the overall select, each option must have one. (Missing: '" + value + "')");
			}
			functional_select_responses[name][value] = item.response;
		}
		
	} else {
		for (const [value, item] of Object.entries(mod.items)) {
			if (item.response !== undefined && item.response !== null) {
				throw new Error(file + ": For individual item responses to be used on a select, the minimum and maximum options must be 1 and there must be no overall response function.");
			}
		}
		select_responses[name] = mod.response;
	}
}
for (const file of button_files) {
	button_responses[file.slice(0, -3)] = require("./buttons/" + file).response;
}
for (const file of modal_files) {
	const mod = require("./modals/" + file);
	modal_responses[mod.modal.customId] = mod.response;
}

var commandsEmbed = author_embed()
	.setTitle("Command List")
	.setDescription("Here's a list of commands for " + bot_name + ":\n(Required arguments look like `<this>` and optional ones look like `[this]`)");

for (const file of command_files) {
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
	} else if (interaction.isModalSubmit()) {
		const [handler_name, ...rest] = interaction.customId.split(":");
		if (handler_name in modal_responses) {
			await modal_responses[handler_name](interaction, rest.join(":"));
		} else {
			await interaction.reply({embeds: [message_embed(`That modal isn't loaded in this version!\nCustom ID: "${interaction.customId}"`, "#FF0000")]})
		}
	} else if (interaction.isSelectMenu()) {
		const [handler_name, ...rest] = interaction.customId.split(":");
		if (handler_name in select_responses) {
			await select_responses[handler_name](interaction, interaction.values, rest.join(":"));
		} else if (handler_name in functional_select_responses) {
			await functional_select_responses[handler_name][interaction.values[0]](interaction, rest.join(":"));
		} else {
			await interaction.reply({embeds: [message_embed(`That selection menu isn't loaded in this version!\nCustom ID: "${interaction.customId}"`, "#FF0000")]})
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
