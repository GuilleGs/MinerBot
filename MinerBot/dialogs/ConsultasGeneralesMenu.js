// dialogs/ConsultasGeneralesMenu.js
const { MessageFactory } = require('botbuilder');
const content = require('./content');

const consultasOptions = [
    'Información general de la empresa',
    'No encontré lo que buscaba 🆘'
];

class ConsultasGeneralesMenu {
    constructor(bot) {
        this.bot = bot;
    }

    async show(context) {
        await context.sendActivity(
            MessageFactory.suggestedActions(consultasOptions.concat(['Volver']), '🆘 Consultas Generales y Otros')
        );
    }

    async handleInput(context, text, conversationData, bot) {
        const lower = text.toLowerCase();

        if (conversationData.isInInfoDisplayState && lower.includes('volver')) {
            conversationData.isInInfoDisplayState = false;
            await this.show(context);
            return true;
        }

        if (lower.includes('volver')) {
            await bot.goBack(context, conversationData);
            return true;
        }

        const matchedOption = consultasOptions.find(opt => opt.toLowerCase() === lower);

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

module.exports = ConsultasGeneralesMenu;