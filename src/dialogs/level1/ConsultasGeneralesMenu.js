// src/dialogs/level1/ConsultasGeneralesMenu.js

const { MessageFactory } = require('botbuilder');
const content = require('../data/content');

/**
 * Diálogo para "Consultas Generales y Otros".
 * Este diálogo tiene una doble función:
 * 1. Proporcionar información general de la empresa.
 * 2. Gestionar un flujo de "escalamiento", donde el usuario puede enviar una consulta
 *    de texto libre que será procesada por Power Automate.
 */
class ConsultasGeneralesMenu {
    /**
     * Inicializa el diálogo con sus opciones de menú.
     * @param {object} bot - Instancia del bot principal para acceso a servicios y estados de conversación.
     */
    constructor(bot) {
        this.bot = bot;
        this.options = [
            'Información general de la empresa',
            'No encontré lo que buscaba'
        ];
        this.returnOption = 'Volver';
    }

    /**
     * Muestra el menú de opciones o el prompt para la consulta del usuario.
     * La vista cambia dependiendo de si el bot está en el estado `awaitingUserQuery`.
     * @param {TurnContext} context - Contexto del turno actual de la conversación.
     */
    async show(context) {
        const conversationData = await this.bot.conversationStateAccessor.get(context);

        if (conversationData.awaitingUserQuery) {
            // Si estamos esperando la consulta, mostramos solo el mensaje de instrucción.
            await context.sendActivity(content['no encontré lo que buscaba']);
        } else {
            // De lo contrario, mostramos el menú de opciones estándar.
            const menuOptions = this.options.map((option, index) => `${index + 1}. ${option}`);
            menuOptions.push(`${this.options.length + 1}. ${this.returnOption}`);
            
            const menuText = [
                'Consultas Generales y Otros:',
                ...menuOptions,
                '\nPor favor, escribe el número o el nombre de la opción.'
            ].join('\n');

            await context.sendActivity(menuText);
        }
    }

    /**
     * Procesa la entrada del usuario.
     * Delega a un método especializado si el bot está esperando una consulta,
     * o maneja la selección de menú en caso contrario.
     * @param {TurnContext} context - Contexto del turno actual de la conversación.
     * @param {string} text - El mensaje enviado por el usuario.
     * @param {object} conversationData - El estado de la conversación.
     * @param {object} bot - La instancia principal del bot.
     * @returns {Promise<boolean>} `true` si la entrada fue manejada, `false` en caso contrario.
     */
    async handleInput(context, text, conversationData, bot) {
        // Flujo prioritario: si estamos en el modo de "espera de consulta".
        if (conversationData.awaitingUserQuery) {
            return await this._handleUserQuery(context, text, conversationData, bot);
        }

        const lowerText = text.toLowerCase().trim();
        const number = parseInt(lowerText, 10);

        // Volver al menú de opciones después de ver información.
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
            } else if (lowerText.includes('no encontré lo que buscaba')) {
                // Captura de texto libre para iniciar el flujo.
                selectedOption = 'No encontré lo que buscaba';
            }
        }

        if (selectedOption) {
            const selectedOptionLower = selectedOption.toLowerCase();

            if (selectedOptionLower.includes(this.returnOption.toLowerCase())) {
                await bot.goBack(context, conversationData);
                return true;
            }
            
            if (selectedOptionLower.includes('no encontré lo que buscaba')) {
                // Activa el estado de espera y muestra el prompt.
                conversationData.awaitingUserQuery = true;
                await this.show(context);
                return true;
            }

            // Para cualquier otra opción, muestra la respuesta estática.
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

    /**
     * Maneja el flujo de envío de una consulta de texto libre a Power Automate.
     * Este método es llamado cuando `conversationData.awaitingUserQuery` es true.
     * @private
     */
    async _handleUserQuery(context, text, conversationData, bot) {
        // Si el usuario cancela.
        if (text.toLowerCase().trim() === 'volver' || text.toLowerCase().trim() === 'cancelar') {
            conversationData.awaitingUserQuery = false;
            await context.sendActivity('Envío de consulta cancelado. Volviendo al menú de Consultas Generales.');
            await this.show(context);
            return true;
        }

        // Construye el payload con la información del usuario.
        const dataToSend = {
            nombreEmpleado: conversationData.employeeName,
            rutEmpleado: conversationData.employeeRut,
            employeeArea: conversationData.employeeArea,
            employeeCargo: conversationData.employeeCargo,
            consultaTexto: text.trim()
        };

        // Llama al servicio de Power Automate.
        const success = await bot.powerAutomateService.sendUnresolvedQuery(dataToSend);

        // Informa al usuario del resultado.
        if (success) {
            await context.sendActivity('Su consulta ha sido enviada al equipo de soporte. Le contactaremos a la brevedad posible.');
        } else {
            await context.sendActivity('Hubo un problema al enviar su consulta. Por favor, intente de nuevo más tarde o contacte directamente a RRHH.');
        }

        // Resetea el estado y vuelve a mostrar el menú principal de este diálogo.
        conversationData.awaitingUserQuery = false;
        conversationData.isInInfoDisplayState = false;
        await this.show(context);
        return true;
    }
}

module.exports = ConsultasGeneralesMenu;