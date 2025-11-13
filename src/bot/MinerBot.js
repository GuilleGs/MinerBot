const { ActivityHandler } = require('botbuilder'); // ActivityHandler es la clase base para los bots en Bot Framework.

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
        this.conversationStateAccessor = this.conversationState.createProperty('MinerBotConversationState');

        // Inicialización de servicios externos
        this.employeeService = new EmployeeService();
        this.powerAutomateService = new PowerAutomateService();
        this.knowledgeService = new KnowledgeService();

        // Instancias de todos los diálogos de menú
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

        this.onMembersAdded(async (context, next) => {
            const membersAdded = context.activity.membersAdded;
            for (const member of membersAdded) {
                if (member.id !== context.activity.recipient.id) {
                    await this.conversationStateAccessor.get(context, this.defaultConversationState());
                }
            }
            await next();
        });

        this.onMessage(async (context, next) => {
            const text = context.activity.text.trim();
            const conversationData = await this.conversationStateAccessor.get(context, this.defaultConversationState());

            if (conversationData.awaitingUserQuery || conversationData.awaitingCourseSelection || conversationData.awaitingAnonymousComplaint) {
                const currentMenuInstance = this.menuInstances[conversationData.currentMenuId];
                if (currentMenuInstance && await currentMenuInstance.handleInput(context, text, conversationData, this)) {
                    await next();
                    return;
                }
                await context.sendActivity('No entendí tu respuesta. Por favor, ingresa el texto solicitado o escribe "volver" para cancelar.');
                await next();
                return;
            }

            let currentMenuInstance = this.menuInstances[conversationData.currentMenuId];

            if (!conversationData.isAuthenticated && conversationData.currentMenuId !== 'auth') {
                this.resetConversationStateForAuth(conversationData);
                currentMenuInstance = this.menuInstances.auth;
                await currentMenuInstance.show(context);
                await next();
                return;
            }

            if (text.toLowerCase() === 'menu') {
                this.resetAwaitingStates(conversationData);
                if (conversationData.isAuthenticated) {
                    conversationData.menuStack = [];
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

            let handled = await currentMenuInstance.handleInput(context, text, conversationData, this);

            if (!handled) {
                const answer = await this.knowledgeService.ask(text);

                // --- INICIO DE LA CORRECCIÓN ---
                // Preparamos los datos para el log con la nueva estructura correcta.
                // Hemos cambiado 'employeeName' y 'queryText' por los campos que Power Automate espera.
                const logData = {
                    sede: conversationData.employeeSede,
                    area: conversationData.employeeArea,
                    consulta: text,
                    respuesta: answer
                };
                
                // Llamamos al servicio de Power Automate para registrar la interacción.
                this.powerAutomateService.logQnaQuery(logData);
                // --- FIN DE LA CORRECCIÓN ---

                if (answer && answer !== 'No encontré una respuesta en la base de conocimientos.') {
                    await context.sendActivity(answer);
                    conversationData.isInInfoDisplayState = false;
                } else {
                    await context.sendActivity('No pude encontrar una opción de menú ni una respuesta en mi base de conocimientos para tu consulta. Por favor, intenta reformular tu pregunta o escribe "menu" para ver las opciones principales.');
                }
            }
            await next();
        });
    }

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
            employeeSedeId: null,
            isInInfoDisplayState: false,
            failedLoginAttempts: 0,
            lastFailedAttemptTime: 0,
            awaitingUserQuery: false,
            awaitingCourseSelection: false,
            awaitingAnonymousComplaint: false,
            awaitingPassword: false,
            pendingAuthData: null
        };
    }

    resetAwaitingStates(conversationData) {
        conversationData.awaitingUserQuery = false;
        conversationData.awaitingCourseSelection = false;
        conversationData.awaitingAnonymousComplaint = false;
    }

    resetConversationStateForAuth(conversationData) {
        Object.assign(conversationData, this.defaultConversationState());
    }

    async run(context) {
        const conversationData = await this.conversationStateAccessor.get(context, this.defaultConversationState());

        if (context.activity.type === 'conversationUpdate' && context.activity.membersAdded && context.activity.membersAdded.length > 0) {
            for (const member of context.activity.membersAdded) {
                if (member.id !== context.activity.recipient.id) {
                    this.resetAwaitingStates(conversationData);
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
        await super.run(context);
    }

    async navigateToMenu(context, conversationData, newMenuId) {
        if (!conversationData.isAuthenticated && newMenuId !== 'auth') {
            await context.sendActivity('Por favor, inicia sesión para acceder a esta funcionalidad.');
            await this.menuInstances.auth.show(context);
            return;
        }

        this.resetAwaitingStates(conversationData);

        if (conversationData.currentMenuId && conversationData.currentMenuId !== newMenuId) {
             conversationData.menuStack.push(conversationData.currentMenuId);
        }
        conversationData.currentMenuId = newMenuId;
        conversationData.isInInfoDisplayState = false;
        const newMenuInstance = this.menuInstances[newMenuId];
        await newMenuInstance.show(context);
    }

    async goBack(context, conversationData) {
        if (!conversationData.isAuthenticated && conversationData.menuStack.length === 0) {
            await context.sendActivity('Por favor, inicia sesión para continuar.');
            await this.menuInstances.auth.show(context);
            return;
        }

        this.resetAwaitingStates(conversationData);

        const previousMenuId = conversationData.menuStack.pop();
        if (previousMenuId) {
            conversationData.currentMenuId = previousMenuId;
            const previousMenuInstance = this.menuInstances[previousMenuId];
            await previousMenuInstance.show(context);
        } else {
            if (conversationData.isAuthenticated) {
                conversationData.currentMenuId = 'main';
                await this.menuInstances.main.show(context);
            } else {
                await this.menuInstances.auth.show(context);
            }
        }
        conversationData.isInInfoDisplayState = false;
    }
}

module.exports = MinerBot;