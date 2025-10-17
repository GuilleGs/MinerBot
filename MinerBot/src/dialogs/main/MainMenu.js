// src/dialogs/main/MainMenu.js
const { MessageFactory } = require('botbuilder'); // Módulo para crear mensajes del bot.
const content = require('../data/content'); // Importa el contenido estático del bot.

/**
 * Diálogo que gestiona el menú principal del bot "MinerBot Global Asistente".
 * Este menú es el punto de entrada para todas las funcionalidades principales una vez que el usuario se ha autenticado.
 * Permite al usuario navegar a los menús de Nivel 1.
 */
class MainMenu {
    /**
     * Inicializa el diálogo con las opciones principales del menú.
     * @param {object} bot - Instancia del bot principal para acceso a estados y navegación.
     */
    constructor(bot) {
        this.bot = bot;
        // Define las opciones principales del menú.
        this.options = [
            'Vacaciones, Licencias y Permisos',
            'Beneficios Económicos',
            'Salud y Seguros',
            'Bienestar y Conciliación',
            'Cultura y Valores',
            'Crecimiento y Desarrollo',
            'Consultas Generales y Otros'
        ];
        // La opción "Volver" no es necesaria en el menú principal, ya que es el nivel más alto.
    }

    /**
     * Muestra el menú principal al usuario.
     * Incluye una salvaguarda para asegurar que solo se muestre a usuarios autenticados.
     * @param {TurnContext} context - Contexto del turno actual de la conversación.
     */
    async show(context) {
        const conversationData = await this.bot.conversationStateAccessor.get(context);

        // Salvaguarda: Si el usuario no está autenticado, lo redirige al menú de autenticación.
        // Esto previene que un usuario no autenticado acceda a este menú directamente.
        if (!conversationData || !conversationData.isAuthenticated) {
            await context.sendActivity('Por favor, inicia sesión para ver el menú principal.');
            await this.bot.menuInstances.auth.show(context);
            return;
        }

        // Construye el mensaje con la lista numerada de opciones del menú principal.
        let menuText = 'Menú principal:\n';
        this.options.forEach((option, index) => {
            menuText += `${index + 1}. ${option}\n`;
        });
        menuText += '\nPor favor, escribe el número o el nombre de la opción.';

        await context.sendActivity(menuText); // Envía el menú al usuario.
    }

    /**
     * Procesa la entrada del usuario para el menú principal.
     * Maneja la selección de opciones numéricas o de texto para navegar a los menús de Nivel 1.
     * @param {TurnContext} context - Contexto del turno actual de la conversación.
     * @param {string} text - Texto del mensaje enviado por el usuario.
     * @param {object} conversationData - Objeto que contiene el estado de la conversación.
     * @param {object} bot - Instancia del bot principal para funciones de navegación.
     * @returns {Promise<boolean>} Retorna true si la entrada fue manejada por este menú, false en caso contrario.
     */
    async handleInput(context, text, conversationData, bot) {
        // Salvaguarda: Si el usuario no está autenticado, no procesa la entrada del menú principal.
        if (!conversationData.isAuthenticated) {
            await context.sendActivity('Por favor, inicia sesión para interactuar con el menú.');
            await this.bot.menuInstances.auth.show(context);
            return true;
        }

        const lower = text.toLowerCase(); // Convierte la entrada a minúsculas para comparaciones.
        const number = parseInt(text.trim()); // Intenta parsear la entrada como un número.

        // Mapeo de opciones de menú a IDs de diálogos para una navegación estructurada.
        const menuNavigationMap = {
            'vacaciones, licencias y permisos': 'vacaciones',
            'beneficios económicos': 'beneficios',
            'salud y seguros': 'saludSeguros',
            'bienestar y conciliación': 'bienestarConciliacion',
            'cultura y valores': 'culturaValores',
            'crecimiento y desarrollo': 'crecimientoDesarrollo',
            'consultas generales y otros': 'consultasGenerales'
        };

        let selectedOptionText = null;

        // Procesa la entrada si es un número válido que corresponde a una opción del menú.
        if (!isNaN(number) && number > 0 && number <= this.options.length) {
            selectedOptionText = this.options[number - 1].toLowerCase();
        }
        // Procesa la entrada si es el texto completo o parcial de una opción del menú.
        else if (lower) { // Asegura que 'lower' no esté vacío.
            selectedOptionText = this.options.find(option => option.toLowerCase().includes(lower));
            if (selectedOptionText) {
                selectedOptionText = selectedOptionText.toLowerCase();
            }
        }

        // Si se identificó una opción de menú válida, navega al diálogo correspondiente.
        if (selectedOptionText && menuNavigationMap[selectedOptionText]) {
            await bot.navigateToMenu(context, conversationData, menuNavigationMap[selectedOptionText]);
            return true;
        }
        
        // Fallback: Si la entrada coincide directamente con una clave de respuesta en 'content.js' (para mensajes informativos directos).
        const response = content[lower];
        if (response) {
            await context.sendActivity(response);
            // No se establece isInInfoDisplayState aquí, ya que el menú principal no tiene un "Volver" de info específica.
            return true;
        }

        return false; // Indica que la entrada no fue manejada por este diálogo.
    }
}

module.exports = MainMenu;