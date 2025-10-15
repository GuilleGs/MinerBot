// src/dialogs/level2/TiposSegurosSaludMenu.js
const { MessageFactory } = require('botbuilder');
const content = require('../data/content'); // --- CAMBIO AQUÍ: Ruta a content.js (sube dos niveles) ---

class TiposSegurosSaludMenu {
    constructor(bot) {
        this.bot = bot;
        this.options = [
            'Seguro Médico',
            'Seguro Dental',
            'Seguro Catastrófico'
        ];
        this.returnOption = 'Volver';
    }

    async show(context) {
        let menuText = '⚕️ Tipos de Seguros de Salud:\n';
        this.options.forEach((option, index) => {
            menuText += `${index + 1}. ${option}\n`;
        });
        menuText += `${this.options.length + 1}. ${this.returnOption}\n`;
        menuText += '\nPor favor, escribe el número o el nombre de la opción.';

        await context.sendActivity(menuText);
    }

    async handleInput(context, text, conversationData, bot) {
        const lower = text.toLowerCase();
        const number = parseInt(text.trim());

        if (conversationData.isInInfoDisplayState && lower.includes(this.returnOption.toLowerCase())) {
            conversationData.isInInfoDisplayState = false;
            await this.show(context);
            return true;
        }

        if (!isNaN(number) && number > 0 && number <= this.options.length + 1) {
            const selectedOption = (number === this.options.length + 1) ? this.returnOption : this.options[number - 1];

            if (selectedOption.toLowerCase().includes(this.returnOption.toLowerCase())) {
                await bot.goBack(context, conversationData);
                return true;
            }

            const response = content[selectedOption.toLowerCase()];
            if (response) {
                await context.sendActivity(response);
                conversationData.isInInfoDisplayState = true;
                return true;
            }
        }
        else if (lower.includes(this.returnOption.toLowerCase())) {
            await bot.goBack(context, conversationData);
            return true;
        }

        const matchedOption = this.options.find(opt => opt.toLowerCase() === lower);
        if (matchedOption) {
            const response = content[lower];
            if (response) {
                await context.sendActivity(response);
            } else {
                await context.sendActivity(`Has seleccionado: "${text}" (No hay información detallada aún).`);
            }
            conversationData.isInInfoDisplayState = true;
            return true;
        }

        return false;
    }
}

module.exports = TiposSegurosSaludMenu;