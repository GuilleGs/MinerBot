// src/dialogs/level2/ProcedimientoDenunciasMenu.js

const { MessageFactory } = require('botbuilder');
const content = require('../data/content'); // Ajusta la ruta si es necesario

/**
 * Diálogo que gestiona el sub-menú de "Procedimiento para Denuncias".
 * Este diálogo tiene una doble función:
 * 1. Proporcionar información sobre los tipos de denuncias y canales de reporte.
 * 2. Gestionar un flujo interactivo para que el usuario envíe una denuncia anónima.
 */
class ProcedimientoDenunciasMenu {
    /**
     * Inicializa el diálogo con sus opciones de menú.
     * @param {object} bot - Instancia del bot principal para acceso a servicios y estados de conversación.
     */
    constructor(bot) {
        this.bot = bot;
        this.options = [
            'Denuncia por Acoso',
            'Denuncia por Discriminación',
            'Reporte de Conflicto de Interés',
            'Realizar Denuncia Anónima'
        ];
        this.returnOption = 'Volver';
    }

    /**
     * Muestra la vista correcta al usuario, ya sea el menú de opciones o el prompt para la denuncia.
     * @param {TurnContext} context - Contexto del turno actual de la conversación.
     */
    async show(context) {
        const conversationData = await this.bot.conversationStateAccessor.get(context);

        if (conversationData.awaitingAnonymousComplaint) {
            await context.sendActivity(content['realizar denuncia anónima']);
        } else {
            const menuOptions = this.options.map((option, index) => `${index + 1}. ${option}`);
            menuOptions.push(`${this.options.length + 1}. ${this.returnOption}`);
            
            const menuText = [
                'Procedimiento para Denuncias:',
                ...menuOptions,
                '\nPor favor, escribe el número o el nombre de la opción.'
            ].join('\n');

            await context.sendActivity(menuText);
        }
    }

    /**
     * Procesa la entrada del usuario, delegando a un método especializado si se está en el flujo de denuncia.
     * @param {TurnContext} context - Contexto del turno actual de la conversación.
     * @param {string} text - El mensaje enviado por el usuario.
     * @param {object} conversationData - El estado de la conversación.
     * @param {object} bot - La instancia principal del bot.
     * @returns {Promise<boolean>} `true` si la entrada fue manejada, `false` en caso contrario.
     */
    async handleInput(context, text, conversationData, bot) {
        // Flujo prioritario: si estamos en el modo de "espera de denuncia".
        if (conversationData.awaitingAnonymousComplaint) {
            return await this._handleAnonymousComplaint(context, text, conversationData, bot);
        }

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
            
            if (selectedOptionLower.includes('realizar denuncia anónima')) {
                conversationData.awaitingAnonymousComplaint = true;
                await this.show(context);
                return true;
            }

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
     * Maneja el flujo de envío de una denuncia anónima a Power Automate.
     * Este método es llamado cuando `conversationData.awaitingAnonymousComplaint` es true.
     * @private
     */
    async _handleAnonymousComplaint(context, text, conversationData, bot) {
        const complaintText = text.trim();
        const lowerText = text.toLowerCase().trim();

        if (lowerText === 'volver' || lowerText === 'cancelar') {
            conversationData.awaitingAnonymousComplaint = false;
            await context.sendActivity('Envío de denuncia cancelado. Volviendo al menú de Procedimiento para Denuncias.');
            await this.show(context);
            return true;
        }
        
        if (!complaintText) {
            await context.sendActivity('No se recibió texto. Por favor, escribe tu denuncia o "volver" para cancelar.');
            return true;
        }
        
        let success = false;
        try {
            success = await bot.powerAutomateService.sendAnonymousComplaint(complaintText);
        } catch (error) {
            console.error('ProcedimientoDenunciasMenu: Error inesperado al enviar denuncia:', error);
            // 'success' permanecerá `false`, lo que activará el mensaje de error al usuario.
        }

        if (success) {
            await context.sendActivity('Su denuncia anónima ha sido enviada con éxito. Agradecemos su contribución para mantener un ambiente de integridad.');
        } else {
            await context.sendActivity('Hubo un problema al enviar su denuncia. Por favor, intente de nuevo más tarde o utilice otro canal de reporte.');
        }

        // Resetea el estado y vuelve a mostrar el menú principal de este diálogo.
        conversationData.awaitingAnonymousComplaint = false;
        conversationData.isInInfoDisplayState = false;
        await this.show(context);
        return true;
    }
}

module.exports = ProcedimientoDenunciasMenu;