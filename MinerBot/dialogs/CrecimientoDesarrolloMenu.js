// dialogs/CrecimientoDesarrolloMenu.js
const { MessageFactory } = require('botbuilder');
const content = require('./content');

const crecimientoOptions = [
    'Cursos externos financiados por la empresa',
    'Programa de trainees o becas de estudio',
    'Evaluación de desempeño y retroalimentación',
    'Planes de carrera y movilidad interna',
    'Programas de Capacitación Interna 📚'
];

class CrecimientoDesarrolloMenu {
    constructor(bot) {
        this.bot = bot;
    }

    async show(context) {
        await context.sendActivity(
            MessageFactory.suggestedActions(crecimientoOptions.concat(['Volver']), '📚 Crecimiento y Desarrollo')
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

        if (lower.includes('programas de capacitación interna')) {
            await bot.navigateToMenu(context, conversationData, 'programasCapacitacionInterna');
            return true;
        }

        const matchedOption = crecimientoOptions.find(opt => opt.toLowerCase() === lower);

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

module.exports = CrecimientoDesarrolloMenu;