// src/dialogs/level2/TiposPermisosLegalesMenu.js

const { MessageFactory } = require('botbuilder');
const content = require('../data/content'); // Ajusta la ruta si es necesario

/**
 * Diálogo que gestiona el sub-menú de "Tipos de Permisos Legales".
 * Presenta información detallada sobre las diferentes categorías de permisos legales
 * reconocidos por la empresa.
 */
class TiposPermisosLegalesMenu {
    /**
     * Inicializa el diálogo con las opciones de menú.
     * @param {object} bot - Instancia del bot principal para acceso a estados y navegación.
     */
    constructor(bot) {
        this.bot = bot;
        this.options = [
            'Permiso por Matrimonio',
            'Permiso por Fallecimiento',
            'Permiso por Estudios',
            'Otros Permisos Legales'
        ];
        this.returnOption = 'Volver';
    }

    /**
     * Muestra el menú de opciones al usuario de forma clara y numerada.
     * @param {TurnContext} context - Contexto del turno actual de la conversación.
     */
    async show(context) {
        const menuOptions = this.options.map((option, index) => `${index + 1}. ${option}`);
        menuOptions.push(`${this.options.length + 1}. ${this.returnOption}`);
        
        const menuText = [
            'Tipos de Permisos Legales:',
            ...menuOptions,
            '\nPor favor, escribe el número o el nombre de la opción.'
        ].join('\n');

        await context.sendActivity(menuText);
    }

    /**
     * Procesa la entrada del usuario, manejando selecciones numéricas, de texto y la opción de retroceder.
     * @param {TurnContext} context - Contexto del turno actual de la conversación.
     * @param {string} text - El mensaje enviado por el usuario.
     * @param {object} conversationData - El estado de la conversación.
     * @param {object} bot - La instancia principal del bot.
     * @returns {Promise<boolean>} `true` si la entrada fue manejada, `false` en caso contrario.
     */
    async handleInput(context, text, conversationData, bot) {
        const lowerText = text.toLowerCase().trim();
        const number = parseInt(lowerText, 10);

        if (conversationData.isInInfoDisplayState && lowerText.includes(this.returnOption.toLowerCase())) {
            conversationData.isInInfoDisplayState = false;
            await this.show(context);
            return true;
        }

        let selectedOption = null;

        if (!isNaN(number) && number > 0 && number <= this.options.length + 1) {
            selectedOption = (number === this.options.length + 1) ? this.returnOption : this.options[number - 1];
        } else {
            const matchedOption = this.options.find(opt => opt.toLowerCase() === lowerText);
            if (matchedOption) {
                selectedOption = matchedOption;
            } else if (lowerText.includes(this.returnOption.toLowerCase())) {
                selectedOption = this.returnOption;
            }
        }

        if (selectedOption) {
            if (selectedOption === this.returnOption) {
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

        return false;
    }
}

module.exports = TiposPermisosLegalesMenu;