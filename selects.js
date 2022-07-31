const fs = require('node:fs');
const { MessageSelectMenu } = require('discord.js');

const select_files = fs.readdirSync('./selects').filter(file => file.endsWith('.js'));

for (const file of select_files) {
    const name = file.slice(0, -3);
    Object.defineProperty(exports, name, { 
        get: function() {
            var mod = require("./selects/" + file);
            var select = new MessageSelectMenu().setCustomId(name);
            select.setMinValues(mod.min ?? 1);
            select.setMaxValues(mod.max ?? 1);
            var option_list = [];
            for (const [value, details] of Object.entries(mod.items)) {
                option_list.push({
                    label: details.label,
                    description: details.description,
                    value: value
                });
            }
            select.addOptions(option_list);
            return select;
        }, 
        set: undefined 
    });   
}