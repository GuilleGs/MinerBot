// src/dialogs/level1/VacacionesMenu.js

const { MessageFactory } = require('botbuilder');
const content = require('../data/content');
// Para este menú, según el content.js actual, no se necesita personalización.
// const { getPersonalizedContent } = require('../../bot/contentHelper');

/**
 * Diálogo que gestiona el menú de "Vacaciones, Licencias y Permisos".
 * Sirve como punto de entrada para información sobre ausencias y como
 * enrutador hacia el sub-menú de permisos legales.
 */
class VacacionesMenu {
    /**
     * Inicializa el diálogo con sus opciones y define un mapa para la navegación.
     * @param {object} bot - Instancia del bot principal para acceso a estados y navegación.
     */
    constructor(bot) {
        this.bot = bot;
        this.options = [
            'Solicitar vacaciones',
            'Consultar saldo de vacaciones',
            'Procedimiento de licencia médica',
            'Tipos de Permisos Legales'
        ];
        this.returnOption = 'Volver';

        this.navigationMap = {
            'tipos de permisos legales': 'tiposPermisosLegales'
        };
    }

    /**
     * Muestra el menú de opciones al usuario de forma clara y numerada.
     * @param {TurnContext} context - Contexto del turno actual de la conversación.
     */
    async show(context) {
        const menuOptions = this.options.map((option, index) => `${index + 1}. ${option}`);
        menuOptions.push(`${this.options.length + 1}. ${this.returnOption}`);
        
        const menuText = [
            'Vacaciones, Licencias y Permisos:',
            ...menuOptions,
            '\nPor favor, escribe el número o el nombre de la opción.'
        ].join('\n');

        await context.sendActivity(menuText);
    }

    /**
     * Procesa la entrada del usuario, manejando selecciones, navegación a sub-menús y la opción de retroceder.
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
            const matchedOption = this.options.find(opt => opt.toLowerCase() === lowerText || lowerText.includes(opt.toLowerCase()));
            if (matchedOption) {
                selectedOption = matchedOption;
            } else if (lowerText.includes(this.returnOption.toLowerCase())) {
                selectedOption = this.returnOption;
            }
        }

        if (selectedOption) {
            const selectedOptionLower = selectedOption.toLowerCase();

            if (selectedOptionLower.includes(this.returnOption.toLowerCase())) {
                await bot.goBack(context, conversationData);
                return true;
            }

            if (this.navigationMap[selectedOptionLower]) {
                await bot.navigateToMenu(context, conversationData, this.navigationMap[selectedOptionLower]);
                return true;
            }

            // Para las opciones informativas, muestra el contenido estático.
            let response = content[selectedOptionLower];
            if (response) {
                // Si el contenido es un objeto (p.ej. por sede), seleccionar la variante apropiada.
                if (typeof response === 'object' && response !== null) {
                    const sedeKey = conversationData && conversationData.employeeSedeId ? String(conversationData.employeeSedeId) : 'default';
                    response = response[sedeKey] || response.default || Object.values(response)[0];
                }
                if (response) {
                    await context.sendActivity(response);
                    conversationData.isInInfoDisplayState = true;
                    return true;
                }
            }
        }

        return false;
    }
}

module.exports = VacacionesMenu;