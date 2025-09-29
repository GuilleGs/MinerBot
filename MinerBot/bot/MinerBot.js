// bot/MinerBot.js
const { ActivityHandler } = require('botbuilder');
const dotenv = require('dotenv');
dotenv.config();

const KnowledgeService = require('./services/KnowledgeService');

// Importa todos los menús, tanto los existentes como los nuevos de nivel superior
const MainMenu = require('../dialogs/MainMenu');
const VacacionesMenu = require('../dialogs/VacacionesMenu');
const BeneficiosMenu = require('../dialogs/BeneficiosMenu');
// --- NUEVOS MENUS DE NIVEL 1 ---
const SaludSegurosMenu = require('../dialogs/SaludSegurosMenu');
const BienestarConciliacionMenu = require('../dialogs/BienestarConciliacionMenu');
const CulturaValoresMenu = require('../dialogs/CulturaValoresMenu');
const CrecimientoDesarrolloMenu = require('../dialogs/CrecimientoDesarrolloMenu');
const ConsultasGeneralesMenu = require('../dialogs/ConsultasGeneralesMenu');

// --- NUEVOS SUB-MENUS (NIVEL 2 o 3) ---
const TiposPermisosLegalesMenu = require('../dialogs/submenus/TiposPermisosLegalesMenu'); // Nuevo sub-menú de Vacaciones
const TiposSegurosSaludMenu = require('../dialogs/submenus/TiposSegurosSaludMenu'); // Nuevo sub-menú de Salud y Seguros
const ProgramasInternosMenu = require('../dialogs/submenus/ProgramasInternosMenu'); // Nuevo sub-menú de Bienestar y Conciliación
const ApoyoFamiliarMenu = require('../dialogs/submenus/ApoyoFamiliarMenu'); // Nuevo sub-menú de Bienestar y Conciliación
const ProcedimientoDenunciasMenu = require('../dialogs/submenus/ProcedimientoDenunciasMenu'); // Nuevo sub-menú de Cultura y Valores
const ProgramasCapacitacionInternaMenu = require('../dialogs/submenus/ProgramasCapacitacionInternaMenu'); // Nuevo sub-menú de Crecimiento y Desarrollo


class MinerBot extends ActivityHandler {
    /**
     * @param {ConversationState} conversationState - Se inyecta ConversationState en el constructor
     */
    constructor(conversationState) {
        super();
        this.conversationState = conversationState;
        this.conversationStateAccessor = this.conversationState.createProperty('MinerBotConversationState');

        // Instancias de los menús
        this.menuInstances = {
            main: new MainMenu(this),
            vacaciones: new VacacionesMenu(this),
            beneficios: new BeneficiosMenu(this),
            // --- NUEVAS INSTANCIAS DE MENUS DE NIVEL 1 ---
            saludSeguros: new SaludSegurosMenu(this),
            bienestarConciliacion: new BienestarConciliacionMenu(this),
            culturaValores: new CulturaValoresMenu(this),
            crecimientoDesarrollo: new CrecimientoDesarrolloMenu(this),
            consultasGenerales: new ConsultasGeneralesMenu(this),

            // --- NUEVAS INSTANCIAS DE SUB-MENUS ---
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
                        currentMenuId: 'main',
                        isInInfoDisplayState: false
                    });
                    const currentMenuInstance = this.menuInstances[conversationData.currentMenuId];
                    await context.sendActivity('👋 Bienvenido, escribe "menu" para ver las opciones.');
                    await currentMenuInstance.show(context);
                }
            }
            await next();
        });

        this.onMessage(async (context, next) => {
            const text = context.activity.text.trim();

            const conversationData = await this.conversationStateAccessor.get(context, {
                menuStack: [],
                currentMenuId: 'main',
                isInInfoDisplayState: false
            });

            let currentMenuInstance = this.menuInstances[conversationData.currentMenuId];

            if (text.toLowerCase() === 'menu') {
                conversationData.menuStack = [];
                conversationData.currentMenuId = 'main';
                conversationData.isInInfoDisplayState = false;
                currentMenuInstance = this.menuInstances[conversationData.currentMenuId];
                await currentMenuInstance.show(context);
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

    async navigateToMenu(context, conversationData, newMenuId) {
        if (conversationData.currentMenuId && conversationData.currentMenuId !== newMenuId) {
             conversationData.menuStack.push(conversationData.currentMenuId);
        }
        conversationData.currentMenuId = newMenuId;
        conversationData.isInInfoDisplayState = false;
        const newMenuInstance = this.menuInstances[newMenuId];
        await newMenuInstance.show(context);
    }

    async goBack(context, conversationData) {
        const previousMenuId = conversationData.menuStack.pop();
        if (previousMenuId) {
            conversationData.currentMenuId = previousMenuId;
            const previousMenuInstance = this.menuInstances[previousMenuId];
            await previousMenuInstance.show(context);
        } else {
            conversationData.currentMenuId = 'main';
            await this.menuInstances.main.show(context);
        }
        conversationData.isInInfoDisplayState = false;
    }
}

module.exports = MinerBot;