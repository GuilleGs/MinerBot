// src/dialogs/level1/CulturaValoresMenu.js
const { MessageFactory } = require('botbuilder');
const content = require('../data/content');

class CulturaValoresMenu {
    constructor(bot) {
        this.bot = bot;
        this.options = [
            'Código de ética y conducta',
            'Valores corporativos y compromisos de diversidad',
            'Canales de reporte confidencial',
            'Procedimiento para Denuncias 🚨'
        ];
        this.returnOption = 'Volver';
    }

    async show(context) {
        // La lógica de awaitingAnonymousComplaint se maneja en ProcedimientoDenunciasMenu.js,
        // por lo que este show() simplemente muestra el menú normal.
        let menuText = '🚨 Cultura y Valores:\n';
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

        // --- INICIO CAMBIOS: Lógica de awaitingAnonymousComplaint ELIMINADA de aquí ---
        // Toda la lógica para manejar `awaitingAnonymousComplaint` y el envío
        // a Power Automate se ha movido a `ProcedimientoDenunciasMenu.js`.
        // Este menú solo se encarga de la navegación.
        // --- FIN CAMBIOS ---


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

            if (selectedOption.toLowerCase().includes('procedimiento para denuncias')) {
                await bot.navigateToMenu(context, conversationData, 'procedimientoDenuncias');
                return true;
            }

            const response = content[selectedOption.toLowerCase()];
            if (response) {
                await context.sendActivity(response);
            } else {
                await context.sendActivity(`Has seleccionado: "${text}" (No hay información detallada aún).`);
            }
            conversationData.isInInfoDisplayState = true;
            return true;
        }
        else if (lower.includes(this.returnOption.toLowerCase())) {
            await bot.goBack(context, conversationData);
            return true;
        }

        if (lower.includes('procedimiento para denuncias')) {
            await bot.navigateToMenu(context, conversationData, 'procedimientoDenuncias');
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

module.exports = CulturaValoresMenu;