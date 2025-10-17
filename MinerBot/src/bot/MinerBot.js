// src/bot/MinerBot.js
const { ActivityHandler } = require('botbuilder'); // ActivityHandler es la clase base para los bots en Bot Framework.
//const dotenv = require('dotenv'); // Módulo para cargar variables de entorno.
//dotenv.config(); // Carga las variables de entorno definidas en el archivo .env.

// Importación de Servicios
const KnowledgeService = require('./services/KnowledgeService');
const EmployeeService = require('./services/EmployeeService');
const PowerAutomateService = require('./services/PowerAutomateService');

// Importación de Diálogos (Menú Principal)
const MainMenu = require('../dialogs/main/MainMenu');
const AuthMenu = require('../dialogs/main/AuthMenu');

// Importación de Diálogos (Menús de Nivel 1)
const VacacionesMenu = require('../dialogs/level1/VacacionesMenu');
const BeneficiosMenu = require('../dialogs/level1/BeneficiosMenu');
const SaludSegurosMenu = require('../dialogs/level1/SaludSegurosMenu');
const BienestarConciliacionMenu = require('../dialogs/level1/BienestarConciliacionMenu');
const CulturaValoresMenu = require('../dialogs/level1/CulturaValoresMenu');
const CrecimientoDesarrolloMenu = require('../dialogs/level1/CrecimientoDesarrolloMenu');
const ConsultasGeneralesMenu = require('../dialogs/level1/ConsultasGeneralesMenu');

// Importación de Diálogos (Menús de Nivel 2)
const TiposPermisosLegalesMenu = require('../dialogs/level2/TiposPermisosLegalesMenu');
const TiposSegurosSaludMenu = require('../dialogs/level2/TiposSegurosSaludMenu');
const ProgramasInternosMenu = require('../dialogs/level2/ProgramasInternosMenu');
const ApoyoFamiliarMenu = require('../dialogs/level2/ApoyoFamiliarMenu');
const ProcedimientoDenunciasMenu = require('../dialogs/level2/ProcedimientoDenunciasMenu');
const ProgramasCapacitacionInternaMenu = require('../dialogs/level2/ProgramasCapacitacionInternaMenu');

/**
 * Clase principal del bot conversacional "MinerBot Global Asistente".
 * Extiende `ActivityHandler` para procesar las actividades del bot (mensajes, actualizaciones de conversación).
 * Coordina la gestión del estado de la conversación, la autenticación de usuarios y la navegación entre los distintos diálogos de menú.
 */
class MinerBot extends ActivityHandler {
    /**
     * Constructor del MinerBot.
     * @param {ConversationState} conversationState - Componente para la gestión del estado de la conversación.
     */
    constructor(conversationState) {
        super();
        this.conversationState = conversationState;
        // Accesor para las propiedades específicas del estado de la conversación de MinerBot.
        this.conversationStateAccessor = this.conversationState.createProperty('MinerBotConversationState');

        // Inicialización de servicios externos
        this.employeeService = new EmployeeService(); // Servicio para interactuar con la base de datos de empleados.
        this.powerAutomateService = new PowerAutomateService(); // Servicio para orquestar llamadas a flujos de Power Automate.
        this.knowledgeService = new KnowledgeService(); // Servicio para la base de conocimientos (Azure Language Service / QnA Maker).

        // Instancias de todos los diálogos de menú.
        // Se inyecta la instancia del bot (this) para que los diálogos puedan interactuar con los servicios y métodos de navegación del bot.
        this.menuInstances = {
            main: new MainMenu(this),
            auth: new AuthMenu(this),
            vacaciones: new VacacionesMenu(this),
            beneficios: new BeneficiosMenu(this),
            saludSeguros: new SaludSegurosMenu(this),
            bienestarConciliacion: new BienestarConciliacionMenu(this),
            culturaValores: new CulturaValoresMenu(this),
            crecimientoDesarrollo: new CrecimientoDesarrolloMenu(this),
            consultasGenerales: new ConsultasGeneralesMenu(this),
            tiposPermisosLegales: new TiposPermisosLegalesMenu(this),
            tiposSegurosSalud: new TiposSegurosSaludMenu(this),
            programasInternos: new ProgramasInternosMenu(this),
            apoyoFamiliar: new ApoyoFamiliarMenu(this),
            procedimientoDenuncias: new ProcedimientoDenunciasMenu(this),
            programasCapacitacionInterna: new ProgramasCapacitacionInternaMenu(this)
        };

        /**
         * Registra un manejador para el evento 'membersAdded'.
         * Este evento se dispara cuando miembros (incluyendo el bot) se unen a la conversación.
         * Se usa para inicializar el estado de la conversación para nuevos usuarios.
         * @param {TurnContext} context - El contexto del turno.
         * @param {function} next - Función para llamar al siguiente manejador en la cadena de middleware.
         */
        this.onMembersAdded(async (context, next) => {
            const membersAdded = context.activity.membersAdded;
            for (const member of membersAdded) {
                if (member.id !== context.activity.recipient.id) { // Solo si el miembro añadido no es el propio bot.
                    // Inicializa las propiedades del estado de la conversación con valores por defecto.
                    // Esto asegura que cada nueva conversación tenga un estado base.
                    await this.conversationStateAccessor.get(context, this.defaultConversationState());
                }
            }
            await next(); // Pasa el control al siguiente manejador de actividad.
        });

        /**
         * Registra un manejador para el evento 'message'.
         * Este es el punto central para procesar los mensajes de texto del usuario y enrutar la conversación.
         * @param {TurnContext} context - El contexto del turno.
         * @param {function} next - Función para llamar al siguiente manejador en la cadena de middleware.
         */
        this.onMessage(async (context, next) => {
            const text = context.activity.text.trim();
            // Obtiene el estado actual de la conversación o lo inicializa con valores por defecto.
            const conversationData = await this.conversationStateAccessor.get(context, this.defaultConversationState());

            // Prioriza el manejo de la entrada si el bot está esperando una respuesta específica
            // (ej. el texto de una consulta, la selección de un curso, el texto de una denuncia).
            if (conversationData.awaitingUserQuery || conversationData.awaitingCourseSelection || conversationData.awaitingAnonymousComplaint) {
                const currentMenuInstance = this.menuInstances[conversationData.currentMenuId];
                // Si el diálogo actual maneja este estado de espera, procesa la entrada.
                if (currentMenuInstance && await currentMenuInstance.handleInput(context, text, conversationData, this)) {
                    await next(); // La entrada fue manejada, finaliza el procesamiento para este turno.
                    return;
                }
                // Si el diálogo actual no maneja la entrada en este estado de espera,
                // se proporciona un mensaje de reintento y se evita el KnowledgeService.
                await context.sendActivity('No entendí tu respuesta. Por favor, ingresa el texto solicitado o escribe "volver" para cancelar.');
                await next();
                return;
            }

            let currentMenuInstance = this.menuInstances[conversationData.currentMenuId];

            // Si el usuario no está autenticado y no se encuentra en el menú de autenticación, lo redirige.
            if (!conversationData.isAuthenticated && conversationData.currentMenuId !== 'auth') {
                this.resetConversationStateForAuth(conversationData); // Resetea estado para autenticación.
                currentMenuInstance = this.menuInstances.auth;
                await currentMenuInstance.show(context);
                await next();
                return;
            }

            // Maneja el comando global "menu" para regresar al menú principal.
            if (text.toLowerCase() === 'menu') {
                this.resetAwaitingStates(conversationData); // Resetea todos los estados de espera.
                if (conversationData.isAuthenticated) {
                    conversationData.menuStack = []; // Limpia la pila para ir a la raíz del menú.
                    conversationData.currentMenuId = 'main';
                    conversationData.isInInfoDisplayState = false;
                    currentMenuInstance = this.menuInstances[conversationData.currentMenuId];
                    await currentMenuInstance.show(context);
                } else {
                    await context.sendActivity('Por favor, inicia sesión para acceder al menú principal.');
                    await this.menuInstances.auth.show(context);
                }
                await next();
                return;
            }

            // Intenta que el diálogo actual maneje la entrada del usuario.
            let handled = await currentMenuInstance.handleInput(context, text, conversationData, this);

            // Si la entrada no fue manejada por ningún diálogo de menú, intenta con el KnowledgeService.
            if (!handled) {
                const answer = await this.knowledgeService.ask(text);
                if (answer && answer !== 'No encontré una respuesta en la base de conocimientos.') {
                    await context.sendActivity(answer);
                    conversationData.isInInfoDisplayState = false; // Sale del estado de mostrar información si el KB responde.
                } else {
                    await context.sendActivity('No pude encontrar una opción de menú ni una respuesta en mi base de conocimientos para tu consulta. Por favor, intenta reformular tu pregunta o escribe "menu" para ver las opciones principales.');
                }
            }
            await next(); // Pasa el control al siguiente manejador de actividad.
        });
    }

    /**
     * Define el estado por defecto de la conversación.
     * Facilita la inicialización consistente del estado en diferentes puntos del bot.
     * @returns {object} Un objeto que representa el estado inicial de la conversación.
     */
    defaultConversationState() {
        return {
            menuStack: [],
            currentMenuId: 'auth',
            isAuthenticated: false,
            employeeId: null,
            employeeName: null,
            employeeEmail: null,
            employeeRut: null,
            employeeSede: null,
            employeeArea: null,
            employeeCargo: null,
            isInInfoDisplayState: false,
            failedLoginAttempts: 0,
            lastFailedAttemptTime: 0,
            awaitingUserQuery: false,
            awaitingCourseSelection: false,
            awaitingAnonymousComplaint: false
        };
    }

    /**
     * Resetea las propiedades de la conversación relacionadas con el estado de espera.
     * @param {object} conversationData - Los datos del estado de la conversación.
     */
    resetAwaitingStates(conversationData) {
        conversationData.awaitingUserQuery = false;
        conversationData.awaitingCourseSelection = false;
        conversationData.awaitingAnonymousComplaint = false;
    }

    /**
     * Resetea el estado de la conversación para la autenticación.
     * Se usa cuando un usuario no autenticado intenta acceder a funcionalidades restringidas.
     * @param {object} conversationData - Los datos del estado de la conversación.
     */
    resetConversationStateForAuth(conversationData) {
        conversationData.menuStack = [];
        conversationData.currentMenuId = 'auth';
        conversationData.isAuthenticated = false;
        conversationData.employeeId = null;
        conversationData.employeeName = null;
        conversationData.employeeEmail = null;
        conversationData.employeeRut = null;
        conversationData.employeeSede = null;
        conversationData.employeeArea = null;
        conversationData.employeeCargo = null;
        conversationData.isInInfoDisplayState = false;
        conversationData.failedLoginAttempts = 0;
        conversationData.lastFailedAttemptTime = 0;
        this.resetAwaitingStates(conversationData);
    }

    /**
     * Punto de entrada principal para el procesamiento de actividades del bot.
     * Utilizado para inicializar la conversación con mensajes de bienvenida.
     * @param {TurnContext} context - El contexto del turno de la conversación.
     */
    async run(context) {
        // Obtiene el estado actual o lo inicializa con los valores por defecto.
        const conversationData = await this.conversationStateAccessor.get(context, this.defaultConversationState());

        // Maneja la actividad 'conversationUpdate', típica al inicio de una conversación o al añadir el bot.
        if (context.activity.type === 'conversationUpdate' && context.activity.membersAdded && context.activity.membersAdded.length > 0) {
            for (const member of context.activity.membersAdded) {
                if (member.id !== context.activity.recipient.id) { // Si el miembro añadido no es el bot.
                    this.resetAwaitingStates(conversationData); // Resetea los estados de espera.
                    if (!conversationData.isAuthenticated) {
                        await context.sendActivity('Bienvenido a MinerBot Global Asistente.');
                        await this.menuInstances.auth.show(context);
                    } else {
                        await context.sendActivity(`¡Bienvenido de nuevo, ${conversationData.employeeName}! ¿En qué le puedo asistir?`);
                        await this.menuInstances.main.show(context);
                    }
                }
            }
        }
        await super.run(context); // Delega al método 'run' del ActivityHandler base para el procesamiento normal de actividades.
    }

    /**
     * Navega la conversación a un menú específico.
     * Guarda el menú actual en la pila antes de la navegación para permitir la funcionalidad 'Volver'.
     * @param {TurnContext} context - El contexto del turno.
     * @param {object} conversationData - Los datos del estado de la conversación.
     * @param {string} newMenuId - El ID del menú al que se desea navegar.
     * @returns {Promise<void>}
     */
    async navigateToMenu(context, conversationData, newMenuId) {
        // Bloquea la navegación a menús restringidos si el usuario no está autenticado.
        if (!conversationData.isAuthenticated && newMenuId !== 'auth') {
            await context.sendActivity('Por favor, inicia sesión para acceder a esta funcionalidad.');
            await this.menuInstances.auth.show(context);
            return;
        }

        this.resetAwaitingStates(conversationData); // Resetea todos los estados de espera.

        // Guarda el menú actual en la pila para la función 'Volver'.
        if (conversationData.currentMenuId && conversationData.currentMenuId !== newMenuId) {
             conversationData.menuStack.push(conversationData.currentMenuId);
        }
        conversationData.currentMenuId = newMenuId;
        conversationData.isInInfoDisplayState = false; // Sale del estado de visualización de información.
        const newMenuInstance = this.menuInstances[newMenuId];
        await newMenuInstance.show(context); // Muestra el nuevo menú.
    }

    /**
     * Permite al bot retroceder al menú anterior en la pila de navegación.
     * Si la pila está vacía, el bot regresa al menú principal (si autenticado) o al de autenticación.
     * @param {TurnContext} context - El contexto del turno.
     * @param {object} conversationData - Los datos del estado de la conversación.
     * @returns {Promise<void>}
     */
    async goBack(context, conversationData) {
        // Maneja el caso de un usuario no autenticado intentando retroceder sin historial.
        if (!conversationData.isAuthenticated && conversationData.menuStack.length === 0) {
            await context.sendActivity('Por favor, inicia sesión para continuar.');
            await this.menuInstances.auth.show(context);
            return;
        }

        this.resetAwaitingStates(conversationData); // Resetea todos los estados de espera.

        const previousMenuId = conversationData.menuStack.pop(); // Saca el ID del menú anterior de la pila.
        if (previousMenuId) {
            conversationData.currentMenuId = previousMenuId;
            const previousMenuInstance = this.menuInstances[previousMenuId];
            await previousMenuInstance.show(context); // Muestra el menú anterior.
        } else {
            // Si no hay más menús en la pila, vuelve al menú principal o al de autenticación.
            if (conversationData.isAuthenticated) {
                conversationData.currentMenuId = 'main';
                await this.menuInstances.main.show(context);
            } else {
                await this.menuInstances.auth.show(context);
            }
        }
        conversationData.isInInfoDisplayState = false; // Sale del estado de visualización de información.
    }
}

module.exports = MinerBot;