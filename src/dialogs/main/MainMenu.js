// src/dialogs/main/MainMenu.js

const { MessageFactory } = require('botbuilder');
const content = require('../data/content');

/**
 * Diálogo que gestiona el menú principal del bot.
 * Actúa como el centro neurálgico (hub) que enruta al usuario hacia los diferentes
 * diálogos de Nivel 1. Es el primer menú que ve un usuario tras autenticarse.
 */
class MainMenu {
    /**
     * Inicializa el diálogo con las opciones principales y el mapa de navegación.
     * @param {object} bot - Instancia del bot principal para acceso a estados y navegación.
     */
    constructor(bot) {
        this.bot = bot;
        this.options = [
            'Vacaciones, Licencias y Permisos',
            'Beneficios Económicos',
            'Salud y Seguros',
            'Bienestar y Conciliación',
            'Cultura y Valores',
            'Crecimiento y Desarrollo',
            'Consultas Generales y Otros'
        ];
        
        // El mapa de navegación desacopla el texto de la opción de la lógica de enrutamiento.
        this.navigationMap = {
            'vacaciones, licencias y permisos': 'vacaciones',
            'beneficios económicos': 'beneficios',
            'salud y seguros': 'saludSeguros',
            'bienestar y conciliación': 'bienestarConciliacion',
            'cultura y valores': 'culturaValores',
            'crecimiento y desarrollo': 'crecimientoDesarrollo',
            'consultas generales y otros': 'consultasGenerales'
        };
    }

    /**
     * Muestra el menú principal, asegurándose de que el usuario esté autenticado.
     * @param {TurnContext} context - Contexto del turno actual de la conversación.
     */
    async show(context) {
        const conversationData = await this.bot.conversationStateAccessor.get(context);

        // Salvaguarda: redirige al login si el usuario no está autenticado.
        if (!conversationData?.isAuthenticated) {
            await context.sendActivity('Por favor, inicia sesión para ver el menú principal.');
            await this.bot.menuInstances.auth.show(context);
            return;
        }
        
        const menuOptions = this.options.map((option, index) => `${index + 1}. ${option}`);
        const menuText = [
            'Menú principal:',
            ...menuOptions,
            '\nPor favor, escribe el número o el nombre de la opción.'
        ].join('\n');

        await context.sendActivity(menuText);
    }

    /**
     * Procesa la entrada del usuario para navegar al menú de Nivel 1 correspondiente.
     * @param {TurnContext} context - Contexto del turno actual de la conversación.
     * @param {string} text - El mensaje enviado por el usuario.
     * @param {object} conversationData - El estado de la conversación.
     * @param {object} bot - La instancia principal del bot.
     * @returns {Promise<boolean>} `true` si la entrada fue manejada, `false` en caso contrario.
     */
    async handleInput(context, text, conversationData, bot) {
        // Salvaguarda: no procesa la entrada si el usuario no está autenticado.
        if (!conversationData?.isAuthenticated) {
            await context.sendActivity('Por favor, inicia sesión para interactuar con el menú.');
            await this.bot.menuInstances.auth.show(context);
            return true; // Se considera manejado porque se le ha dado una respuesta al usuario.
        }

        const lowerText = text.toLowerCase().trim();
        const number = parseInt(lowerText, 10);
        let selectedOption = null;

        // Lógica unificada para identificar la opción seleccionada.
        if (!isNaN(number) && number > 0 && number <= this.options.length) {
            selectedOption = this.options[number - 1];
        } else {
            // Busca una opción que incluya el texto del usuario para más flexibilidad.
            selectedOption = this.options.find(option => option.toLowerCase().includes(lowerText));
        }

        // Si se encontró una opción, se busca su destino en el mapa de navegación y se navega.
        if (selectedOption) {
            const destinationDialogId = this.navigationMap[selectedOption.toLowerCase()];
            if (destinationDialogId) {
                await bot.navigateToMenu(context, conversationData, destinationDialogId);
                return true;
            }
        }
        
        // Fallback: Si no se encuentra una opción de menú, el `if(!handled)` en MinerBot.js
        // se encargará de pasarlo a KnowledgeService.
        return false;
    }
}

module.exports = MainMenu;