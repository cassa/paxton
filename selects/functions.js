exports.items = {
    'first_option': {
        label: 'Select me!',
        description: 'This is a description',
        response: async function(interaction) {
            await interaction.reply("This selection runs different code depending on the option! This is the first one.");
        }
    },
    'second_option': {
        label: 'You can select me too if you want',
        description: 'This is also a description',
        response: async function(interaction) {
            await interaction.reply("This select menu has a function for each option! You selected the second one.");
        }
    }
};