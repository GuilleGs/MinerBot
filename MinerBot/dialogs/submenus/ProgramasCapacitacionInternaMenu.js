// dialogs/submenus/ProgramasCapacitacionInternaMenu.js
const { MessageFactory } = require('botbuilder');
const content = require('../content'); // Importante: ruta relativa

const capacitacionOptions = [
    'Capacitación DCL (Desarrollo de Competencias de Liderazgo)',
    'Capacitación LEA (Ley de Etiquetado de Alimentos, ejemplo)',
    'Cursos Técnicos Específicos'
];

class ProgramasCapacitacionInternaMenu {
    constructor(bot) {
        this.bot = bot;
    }

    async show(context) {
        await context.sendActivity(
            MessageFactory.suggestedActions(capacitacionOptions.concat(['Volver']), '📚 Programas de Capacitación Interna')
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

        const matchedOption = capacitacionOptions.find(opt => opt.toLowerCase() === lower);

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

module.exports = ProgramasCapacitacionInternaMenu;