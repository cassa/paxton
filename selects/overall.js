exports.items = {
    'first_option': {
        label: 'First option!',
    },
    'second_option': {
        label: 'Second option!',
        description: 'A description!'
    },
    'third_option': {
        label: 'Third option!',
        description: 'Another description!'
    }
};

exports.response = async function(interaction, selections) {
    await interaction.reply("Selections: " + selections.join(", "));
}

exports.max = 2;
exports.min = 1;