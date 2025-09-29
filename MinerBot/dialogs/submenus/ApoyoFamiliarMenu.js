// dialogs/submenus/ApoyoFamiliarMenu.js
const { MessageFactory } = require('botbuilder');
const content = require('../content'); // Importante: ruta relativa

const apoyoFamiliarOptions = [
    'Apoyo de Guardería',
    'Becas de Estudio para Hijos',
    'Días Administrativos por Cuidado Familiar'
];

class ApoyoFamiliarMenu {
    constructor(bot) {
        this.bot = bot;
    }

    async show(context) {
        await context.sendActivity(
            MessageFactory.suggestedActions(apoyoFamiliarOptions.concat(['Volver']), '👨‍👩‍👧‍👦 Apoyo Familiar')
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

        const matchedOption = apoyoFamiliarOptions.find(opt => opt.toLowerCase() === lower);

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

module.exports = ApoyoFamiliarMenu;