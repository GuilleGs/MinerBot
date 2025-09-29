// dialogs/BienestarConciliacionMenu.js
const { MessageFactory } = require('botbuilder');
const content = require('./content');

const bienestarOptions = [
    'Programas de bienestar físico y psicológico',
    'Iniciativas de conciliación vida-trabajo',
    'Programas Internos 🏠',
    'Apoyo Familiar 👨‍👩‍👧‍👦'
];

class BienestarConciliacionMenu {
    constructor(bot) {
        this.bot = bot;
    }

    async show(context) {
        await context.sendActivity(
            MessageFactory.suggestedActions(bienestarOptions.concat(['Volver']), '🏠 Bienestar y Conciliación')
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

        if (lower.includes('programas internos')) {
            await bot.navigateToMenu(context, conversationData, 'programasInternos');
            return true;
        } else if (lower.includes('apoyo familiar')) {
            await bot.navigateToMenu(context, conversationData, 'apoyoFamiliar');
            return true;
        }

        const matchedOption = bienestarOptions.find(opt => opt.toLowerCase() === lower);

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

module.exports = BienestarConciliacionMenu;