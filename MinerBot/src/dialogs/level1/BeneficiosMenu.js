// src/dialogs/level1/BeneficiosMenu.js
const { MessageFactory } = require('botbuilder'); // Módulo para crear mensajes del bot.
const content = require('../data/content'); // Importa el contenido estático para las respuestas del bot.

/**
 * Diálogo que gestiona el menú de "Beneficios Económicos".
 * Presenta al usuario diversas opciones relacionadas con los beneficios financieros de la empresa
 * y muestra la información detallada correspondiente al seleccionar una opción.
 */
class BeneficiosMenu {
    /**
     * Inicializa el diálogo con las opciones de menú y la referencia al bot principal.
     * @param {object} bot - Instancia del bot principal para acceso a estados y navegación.
     */
    constructor(bot) {
        this.bot = bot;
        // Define las opciones específicas de este menú de beneficios económicos.
        this.options = [
            'Bonos de desempeño',
            'Asignación de escolaridad',
            'Aguinaldos y gratificaciones',
            'Viáticos y reembolsos',
            'Descuentos corporativos'
        ];
        this.returnOption = 'Volver'; // Opción estándar para regresar al menú anterior.
    }

    /**
     * Muestra el menú de "Beneficios Económicos" al usuario, listando todas las opciones disponibles.
     * @param {TurnContext} context - Contexto del turno actual de la conversación.
     */
    async show(context) {
        // Construye el mensaje con la lista numerada de opciones.
        let menuText = 'Beneficios Económicos:\n'; 
        this.options.forEach((option, index) => {
            menuText += `${index + 1}. ${option}\n`;
        });
        menuText += `${this.options.length + 1}. ${this.returnOption}\n`;
        menuText += '\nPor favor, escribe el número o el nombre de la opción.';

        await context.sendActivity(menuText); // Envía el menú al usuario.
    }

    /**
     * Procesa la entrada del usuario para este menú.
     * Maneja la selección de opciones numéricas o de texto, la acción de "Volver" y la visualización de información.
     * @param {TurnContext} context - Contexto del turno actual de la conversación.
     * @param {string} text - Texto del mensaje enviado por el usuario.
     * @param {object} conversationData - Objeto que contiene el estado de la conversación.
     * @param {object} bot - Instancia del bot principal para funciones de navegación.
     * @returns {Promise<boolean>} Retorna true si la entrada fue manejada por este menú, false en caso contrario.
     */
    async handleInput(context, text, conversationData, bot) {
        const lower = text.toLowerCase(); // Convierte la entrada a minúsculas para comparaciones.
        const number = parseInt(text.trim()); // Intenta parsear la entrada como un número.

        // Maneja la acción "Volver" cuando el bot está mostrando información estática (isInInfoDisplayState).
        // Permite al usuario regresar a la lista de opciones después de leer una respuesta detallada.
        if (conversationData.isInInfoDisplayState && lower.includes(this.returnOption.toLowerCase())) {
            conversationData.isInInfoDisplayState = false; // Sale del estado de visualización de información.
            await this.show(context); // Muestra el menú nuevamente.
            return true;
        }

        // Procesa la entrada si es un número válido que corresponde a una opción del menú o a "Volver".
        if (!isNaN(number) && number > 0 && number <= this.options.length + 1) {
            const selectedOption = (number === this.options.length + 1) ? this.returnOption : this.options[number - 1];

            // Si la opción seleccionada es "Volver", ejecuta la función de retroceso del bot.
            if (selectedOption.toLowerCase().includes(this.returnOption.toLowerCase())) {
                await bot.goBack(context, conversationData);
                return true;
            }

            // Busca la respuesta para la opción seleccionada en el módulo 'content.js'.
            const response = content[selectedOption.toLowerCase()];
            if (response) {
                await context.sendActivity(response); // Muestra la respuesta detallada.
                conversationData.isInInfoDisplayState = true; // Entra en estado de visualización de información.
                return true;
            }
        }
        // Procesa la entrada si es el texto "Volver" (sin ser un número).
        else if (lower.includes(this.returnOption.toLowerCase())) {
            await bot.goBack(context, conversationData);
            return true;
        }

        // Procesa la entrada si es el texto completo o parcial de una opción del menú.
        const matchedOption = this.options.find(opt => opt.toLowerCase() === lower);
        if (matchedOption) {
            const response = content[lower];
            if (response) {
                await context.sendActivity(response); // Muestra la respuesta.
            } else {
                // Mensaje genérico si la opción existe pero no tiene contenido específico en 'content.js'.
                await context.sendActivity(`Ha seleccionado: "${text}" (Información detallada no disponible).`);
            }
            conversationData.isInInfoDisplayState = true; // Entra en estado de visualización.
            return true;
        }

        return false; // Indica que la entrada no fue manejada por este diálogo.
    }
}

module.exports = BeneficiosMenu;