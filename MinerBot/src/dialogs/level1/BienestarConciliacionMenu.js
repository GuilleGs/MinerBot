// src/dialogs/level1/BienestarConciliacionMenu.js
const { MessageFactory } = require('botbuilder'); // Módulo para crear mensajes del bot.
const content = require('../data/content'); // Importa el contenido estático para las respuestas del bot.

/**
 * Diálogo que gestiona el menú de "Bienestar y Conciliación".
 * Presenta opciones relacionadas con programas de bienestar, conciliación vida-trabajo,
 * programas internos y apoyo familiar. Permite navegar a sub-menús específicos.
 */
class BienestarConciliacionMenu {
    /**
     * Inicializa el diálogo con las opciones de menú y la referencia al bot principal.
     * @param {object} bot - Instancia del bot principal para acceso a estados y navegación.
     */
    constructor(bot) {
        this.bot = bot;
        // Define las opciones específicas de este menú de bienestar y conciliación.
        // Las opciones con emoticones se modifican a un formato profesional.
        this.options = [
            'Programas de bienestar físico y psicológico',
            'Iniciativas de conciliación vida-trabajo',
            'Programas Internos', 
            'Apoyo Familiar'      
        ];
        this.returnOption = 'Volver'; // Opción estándar para regresar al menú anterior.
    }

    /**
     * Muestra el menú de "Bienestar y Conciliación" al usuario, listando todas las opciones disponibles.
     * @param {TurnContext} context - Contexto del turno actual de la conversación.
     */
    async show(context) {
        // Construye el mensaje con la lista numerada de opciones.
        let menuText = 'Bienestar y Conciliación:\n'; 
        this.options.forEach((option, index) => {
            menuText += `${index + 1}. ${option}\n`;
        });
        menuText += `${this.options.length + 1}. ${this.returnOption}\n`;
        menuText += '\nPor favor, escribe el número o el nombre de la opción.';

        await context.sendActivity(menuText); // Envía el menú al usuario.
    }

    /**
     * Procesa la entrada del usuario para este menú.
     * Maneja la selección de opciones numéricas o de texto, incluyendo la navegación a sub-menús
     * ("Programas Internos", "Apoyo Familiar") y la acción de "Volver".
     * @param {TurnContext} context - Contexto del turno actual de la conversación.
     * @param {string} text - Texto del mensaje enviado por el usuario.
     * @param {object} conversationData - Objeto que contiene el estado de la conversación.
     * @param {object} bot - Instancia del bot principal para funciones de navegación.
     * @returns {Promise<boolean>} Retorna true si la entrada fue manejada por este menú, false en caso contrario.
     */
    async handleInput(context, text, conversationData, bot) {
        const lower = text.toLowerCase(); // Convierte la entrada a minúsculas para comparaciones.
        const number = parseInt(text.trim()); // Intenta parsear la entrada como un número.

        // Maneja la acción "Volver" cuando el bot está mostrando información estática.
        if (conversationData.isInInfoDisplayState && lower.includes(this.returnOption.toLowerCase())) {
            conversationData.isInInfoDisplayState = false; // Sale del estado de visualización.
            await this.show(context); // Muestra el menú nuevamente.
            return true;
        }

        // Procesa la entrada si es un número válido que corresponde a una opción del menú o a "Volver".
        if (!isNaN(number) && number > 0 && number <= this.options.length + 1) {
            const selectedOption = (number === this.options.length + 1) ? this.returnOption : this.options[number - 1];

            // Si la opción seleccionada es "Volver".
            if (selectedOption.toLowerCase().includes(this.returnOption.toLowerCase())) {
                await bot.goBack(context, conversationData);
                return true;
            }

            // Lógica para navegar a sub-menús específicos.
            if (selectedOption.toLowerCase().includes('programas internos')) {
                await bot.navigateToMenu(context, conversationData, 'programasInternos');
                return true;
            } else if (selectedOption.toLowerCase().includes('apoyo familiar')) {
                await bot.navigateToMenu(context, conversationData, 'apoyoFamiliar');
                return true;
            }

            // Busca y muestra la respuesta de 'content.js' si la opción es informativa.
            const response = content[selectedOption.toLowerCase()];
            if (response) {
                await context.sendActivity(response);
                conversationData.isInInfoDisplayState = true; // Entra en estado de visualización de información.
                return true;
            }
        }
        // Procesa la entrada si es el texto "Volver".
        else if (lower.includes(this.returnOption.toLowerCase())) {
            await bot.goBack(context, conversationData);
            return true;
        }

        // Lógica para navegar a sub-menús específicos mediante entrada de texto.
        if (lower.includes('programas internos')) {
            await bot.navigateToMenu(context, conversationData, 'programasInternos');
            return true;
        } else if (lower.includes('apoyo familiar')) {
            await bot.navigateToMenu(context, conversationData, 'apoyoFamiliar');
            return true;
        }

        // Procesa la entrada si es el texto completo o parcial de una opción del menú informativo.
        const matchedOption = this.options.find(opt => opt.toLowerCase() === lower);
        if (matchedOption) {
            const response = content[lower];
            if (response) {
                await context.sendActivity(response);
            } else {
                // Mensaje genérico si la opción existe pero no tiene contenido específico.
                await context.sendActivity(`Ha seleccionado: "${text}" (Información detallada no disponible).`);
            }
            conversationData.isInInfoDisplayState = true;
            return true;
        }

        return false; // Indica que la entrada no fue manejada por este diálogo.
    }
}

module.exports = BienestarConciliacionMenu;