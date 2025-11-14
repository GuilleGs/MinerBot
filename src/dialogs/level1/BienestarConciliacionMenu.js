// src/dialogs/level1/BienestarConciliacionMenu.js

const { MessageFactory } = require('botbuilder');
const content = require('../data/content');

/**
 * Diálogo que gestiona el menú de "Bienestar y Conciliación".
 * Actúa como un punto de entrada que puede:
 * 1. Mostrar información directa (ej: sobre conciliación vida-trabajo).
 * 2. Navegar a sub-menús de nivel 2 (ej: a 'Programas Internos').
 */
class BienestarConciliacionMenu {
    /**
     * Inicializa el diálogo con sus opciones y define un mapa para la navegación.
     * @param {object} bot - Instancia del bot principal para acceso a estados y navegación.
     */
    constructor(bot) {
        this.bot = bot;
        this.options = [
            'Programas de bienestar físico y psicológico',
            'Iniciativas de conciliación vida-trabajo',
            'Programas Internos',
            'Apoyo Familiar'
        ];
        this.returnOption = 'Volver';

        // Un mapa de navegación ayuda a mantener la lógica limpia y escalable.
        // Asocia el texto de una opción con el ID del diálogo al que debe navegar.
        this.navigationMap = {
            'programas internos': 'programasInternos',
            'apoyo familiar': 'apoyoFamiliar'
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
            'Bienestar y Conciliación:',
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

        // Caso 1: El usuario quiere volver al menú después de ver información.
        if (conversationData.isInInfoDisplayState && lowerText.includes(this.returnOption.toLowerCase())) {
            conversationData.isInInfoDisplayState = false;
            await this.show(context);
            return true;
        }

        let selectedOption = null;

        // Caso 2: El usuario ingresa un número.
        if (!isNaN(number) && number > 0 && number <= this.options.length + 1) {
            selectedOption = (number === this.options.length + 1) ? this.returnOption : this.options[number - 1];
        } 
        // Caso 3: El usuario ingresa texto.
        else {
            // Busca una coincidencia exacta o la opción de volver.
            // Para la navegación, también permitimos una coincidencia parcial con `.includes()`.
            const matchedOption = this.options.find(opt => opt.toLowerCase() === lowerText || lowerText.includes(opt.toLowerCase()));
            if (matchedOption) {
                selectedOption = matchedOption;
            } else if (lowerText.includes(this.returnOption.toLowerCase())) {
                selectedOption = this.returnOption;
            }
        }

        // Si se identificó una opción válida...
        if (selectedOption) {
            const selectedOptionLower = selectedOption.toLowerCase();

            // Acción 1: Si es "Volver", retrocede.
            if (selectedOptionLower.includes(this.returnOption.toLowerCase())) {
                await bot.goBack(context, conversationData);
                return true;
            }
            
            // Acción 2: Si la opción está en el mapa de navegación, navega al sub-menú.
            if (this.navigationMap[selectedOptionLower]) {
                await bot.navigateToMenu(context, conversationData, this.navigationMap[selectedOptionLower]);
                return true;
            }

            // Acción 3: Si es una opción informativa, obtiene y muestra la respuesta estática de content.js.
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

module.exports = BienestarConciliacionMenu;