// src/bot/MinerBot.js
const { ActivityHandler } = require('botbuilder');
const dotenv = require('dotenv');
dotenv.config();

const KnowledgeService = require('./services/KnowledgeService');
const EmployeeService = require('./services/EmployeeService');

// Menú Principal
const MainMenu = require('../dialogs/main/MainMenu');
const AuthMenu = require('../dialogs/main/AuthMenu');

// Menús de Nivel 1
const VacacionesMenu = require('../dialogs/level1/VacacionesMenu');
const BeneficiosMenu = require('../dialogs/level1/BeneficiosMenu');
const SaludSegurosMenu = require('../dialogs/level1/SaludSegurosMenu');
const BienestarConciliacionMenu = require('../dialogs/level1/BienestarConciliacionMenu');
const CulturaValoresMenu = require('../dialogs/level1/CulturaValoresMenu');
const CrecimientoDesarrolloMenu = require('../dialogs/level1/CrecimientoDesarrolloMenu');
const ConsultasGeneralesMenu = require('../dialogs/level1/ConsultasGeneralesMenu');

// Menús de Nivel 2
const TiposPermisosLegalesMenu = require('../dialogs/level2/TiposPermisosLegalesMenu');
const TiposSegurosSaludMenu = require('../dialogs/level2/TiposSegurosSaludMenu');
const ProgramasInternosMenu = require('../dialogs/level2/ProgramasInternosMenu');
const ApoyoFamiliarMenu = require('../dialogs/level2/ApoyoFamiliarMenu');
const ProcedimientoDenunciasMenu = require('../dialogs/level2/ProcedimientoDenunciasMenu');
const ProgramasCapacitacionInternaMenu = require('../dialogs/level2/ProgramasCapacitacionInternaMenu');


class MinerBot extends ActivityHandler {
    constructor(conversationState) {
        super();
        this.conversationState = conversationState;
        this.conversationStateAccessor = this.conversationState.createProperty('MinerBotConversationState');

        this.employeeService = new EmployeeService();

        // Instancias de los menús
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

        this.knowledgeService = new KnowledgeService();

        this.onMembersAdded(async (context, next) => {
            const membersAdded = context.activity.membersAdded;
            for (let member of membersAdded) {
                if (member.id !== context.activity.recipient.id) {
                    const conversationData = await this.conversationStateAccessor.get(context, {
                        menuStack: [],
                        currentMenuId: 'auth',
                        isAuthenticated: false,
                        employeeId: null,
                        employeeName: null,
                        employeeEmail: null,
                        employeeSede: null,
                        employeeArea: null,
                        employeeCargo: null,
                        isInInfoDisplayState: false,
                        // --- INICIO CAMBIOS: NUEVAS PROPIEDADES PARA EL BLOQUEO DE LOGIN ---
                        failedLoginAttempts: 0,
                        lastFailedAttemptTime: 0
                        // --- FIN CAMBIOS ---
                    });
                }
            }
            await next();
        });

        this.onMessage(async (context, next) => {
            const text = context.activity.text.trim();

            const conversationData = await this.conversationStateAccessor.get(context, {
                menuStack: [],
                currentMenuId: 'auth',
                isAuthenticated: false,
                employeeId: null,
                employeeName: null,
                employeeEmail: null,
                employeeSede: null,
                employeeArea: null,
                employeeCargo: null,
                isInInfoDisplayState: false,
                // --- INICIO CAMBIOS: NUEVAS PROPIEDADES PARA EL BLOQUEO DE LOGIN ---
                failedLoginAttempts: 0,
                lastFailedAttemptTime: 0
                // --- FIN CAMBIOS ---
            });

            let currentMenuInstance = this.menuInstances[conversationData.currentMenuId];

            if (!conversationData.isAuthenticated && conversationData.currentMenuId !== 'auth') {
                conversationData.menuStack = [];
                conversationData.currentMenuId = 'auth';
                currentMenuInstance = this.menuInstances.auth;
                await currentMenuInstance.show(context);
                await next();
                return;
            }

            if (text.toLowerCase() === 'menu') {
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
                if (answer && answer !== 'No encontré una respuesta en la KB.') {
                    await context.sendActivity(answer);
                    conversationData.isInInfoDisplayState = false;
                } else {
                    await context.sendActivity('No pude encontrar una opción de menú ni una respuesta en mi base de conocimientos para tu consulta. Por favor, intenta reformular tu pregunta o escribe "menu" para ver las opciones principales.');
                }
            }
            await next();
        });
    }

    async run(context) {
        const conversationData = await this.conversationStateAccessor.get(context, {
            menuStack: [],
            currentMenuId: 'auth',
            isAuthenticated: false,
            employeeId: null,
            employeeName: null,
            employeeEmail: null,
            employeeSede: null,
            employeeArea: null,
            employeeCargo: null,
            isInInfoDisplayState: false,
            // --- INICIO CAMBIOS: NUEVAS PROPIEDADES PARA EL BLOQUEO DE LOGIN (También en run para inicialización temprana) ---
            failedLoginAttempts: 0,
            lastFailedAttemptTime: 0
            // --- FIN CAMBIOS ---
        });

        if (context.activity.type === 'conversationUpdate' && context.activity.membersAdded && context.activity.membersAdded.length > 0) {
            for (let member of context.activity.membersAdded) {
                if (member.id !== context.activity.recipient.id) {
                    if (!conversationData.isAuthenticated) {
                        await context.sendActivity('👋 Bienvenido a MinerBot Global Asistente.');
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