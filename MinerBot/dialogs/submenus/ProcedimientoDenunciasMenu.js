// dialogs/submenus/ProcedimientoDenunciasMenu.js
const { MessageFactory } = require('botbuilder');
const content = require('../content'); // Importante: ruta relativa

const denunciasOptions = [
    'Denuncia por Acoso',
    'Denuncia por Discriminación',
    'Reporte de Conflicto de Interés'
];

class ProcedimientoDenunciasMenu {
    constructor(bot) {
        this.bot = bot;
    }

    async show(context) {
        await context.sendActivity(
            MessageFactory.suggestedActions(denunciasOptions.concat(['Volver']), '🚨 Procedimiento para Denuncias')
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

        const matchedOption = denunciasOptions.find(opt => opt.toLowerCase() === lower);

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

module.exports = ProcedimientoDenunciasMenu;