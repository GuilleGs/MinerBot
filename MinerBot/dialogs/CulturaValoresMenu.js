// dialogs/CulturaValoresMenu.js
const { MessageFactory } = require('botbuilder');
const content = require('./content');

const culturaOptions = [
    'Código de ética y conducta',
    'Valores corporativos y compromisos de diversidad',
    'Canales de reporte confidencial',
    'Procedimiento para Denuncias 🚨'
];

class CulturaValoresMenu {
    constructor(bot) {
        this.bot = bot;
    }

    async show(context) {
        await context.sendActivity(
            MessageFactory.suggestedActions(culturaOptions.concat(['Volver']), '🚨 Cultura y Valores')
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

        if (lower.includes('procedimiento para denuncias')) {
            await bot.navigateToMenu(context, conversationData, 'procedimientoDenuncias');
            return true;
        }

        const matchedOption = culturaOptions.find(opt => opt.toLowerCase() === lower);

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

module.exports = CulturaValoresMenu;