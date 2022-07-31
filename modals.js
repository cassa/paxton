const fs = require('node:fs');

const modal_files = fs.readdirSync('./modals').filter(file => file.endsWith('.js'));

for (const file of modal_files) {
    var mod = require("./modals/" + file);
	exports[mod.modal.customId] = mod.modal;
}