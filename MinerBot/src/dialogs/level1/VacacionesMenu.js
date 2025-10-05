// dialogs/level1/VacacionesMenu.js
const { MessageFactory } = require('botbuilder');
const content = require('../data/content'); // --- RUTA DE CONTENT.JS ACTUALIZADA ---

class VacacionesMenu {
    constructor(bot) {
        this.bot = bot;
        this.options = [
            'Solicitar vacaciones',
            'Consultar saldo de vacaciones',
            'Procedimiento de licencia médica',
            'Tipos de Permisos Legales 📝'
        ];
        this.returnOption = 'Volver';
    }

    async show(context) {
        let menuText = '📄 Vacaciones y Permisos:\n';
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

        // Manejo de entrada numérica
        if (!isNaN(number) && number > 0 && number <= this.options.length + 1) {
            const selectedOption = (number === this.options.length + 1) ? this.returnOption : this.options[number - 1];

            if (selectedOption.toLowerCase().includes(this.returnOption.toLowerCase())) {
                await bot.goBack(context, conversationData);
                return true;
            }

            if (selectedOption.toLowerCase().includes('tipos de permisos legales')) {
                await bot.navigateToMenu(context, conversationData, 'tiposPermisosLegales');
                return true;
            }

            const response = content[selectedOption.toLowerCase()];
            if (response) {
                await context.sendActivity(response);
                conversationData.isInInfoDisplayState = true;
                return true;
            }
        }
        // Lógica existente para manejar la entrada de texto
        else if (lower.includes(this.returnOption.toLowerCase())) {
            await bot.goBack(context, conversationData);
            return true;
        }
        else if (lower.includes('tipos de permisos legales')) {
            await bot.navigateToMenu(context, conversationData, 'tiposPermisosLegales');
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

module.exports = VacacionesMenu;