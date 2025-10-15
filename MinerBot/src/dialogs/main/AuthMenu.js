// src/dialogs/main/AuthMenu.js
const { MessageFactory } = require('botbuilder');
const content = require('../data/content');

// --- INICIO CAMBIOS: CONSTANTES DE CONFIGURACIÓN DEL BLOQUEO ---
const MAX_LOGIN_ATTEMPTS = 2; // Número máximo de intentos fallidos antes del bloqueo
const BLOCK_DURATION_MINUTES = 1; // Duración del bloqueo en minutos
const BLOCK_DURATION_MS = BLOCK_DURATION_MINUTES * 60 * 1000; // Duración del bloqueo en milisegundos
// --- FIN CAMBIOS ---

class AuthMenu {
    constructor(bot) {
        this.bot = bot;
    }

    async show(context) {
        await context.sendActivity('🔒 Para acceder a las funcionalidades personalizadas de MinerBot Global, por favor, ingresa tu **Email Corporativo** o tu **RUT** (ej. 12345678-9).');
    }

    async handleInput(context, text, conversationData, bot) {
        const identifier = text.trim();

        if (!identifier) {
            await context.sendActivity('Por favor, ingresa tu Email Corporativo o RUT para continuar.');
            return true;
        }

        const now = Date.now();

        if (conversationData.failedLoginAttempts >= MAX_LOGIN_ATTEMPTS && conversationData.lastFailedAttemptTime > 0) {
            const timeSinceLastAttempt = now - conversationData.lastFailedAttemptTime;
            if (timeSinceLastAttempt < BLOCK_DURATION_MS) {
                const remainingTimeSeconds = Math.ceil((BLOCK_DURATION_MS - timeSinceLastAttempt) / 1000);
                await context.sendActivity(`Demasiados intentos de acceso fallidos. Por favor, espera ${remainingTimeSeconds} segundos antes de intentar de nuevo.`);
                return true;
            } else {
                conversationData.failedLoginAttempts = 0;
                conversationData.lastFailedAttemptTime = 0;
            }
        }

        try {
            const employee = await bot.employeeService.getEmployeeByIdentifier(identifier);

            if (employee) {
                conversationData.isAuthenticated = true;
                conversationData.employeeId = employee.ID_Empleado;
                conversationData.employeeName = `${employee.Nombre} ${employee.ApellidoPaterno}`;
                conversationData.employeeEmail = employee.EmailCorporativo;
                conversationData.employeeSede = employee.Sede;
                // --- INICIO CAMBIOS: Guardar RUT, Área y Cargo ---
                conversationData.employeeRut = employee.Rut; // ¡AÑADIDO!
                conversationData.employeeArea = employee.Area; // Confirmado que se guarda
                conversationData.employeeCargo = employee.Cargo; // Confirmado que se guarda
                // --- FIN CAMBIOS ---

                conversationData.failedLoginAttempts = 0;
                conversationData.lastFailedAttemptTime = 0;

                await context.sendActivity(`¡Bienvenido, ${employee.Nombre}! Has iniciado sesión correctamente. 😊`);
                await bot.navigateToMenu(context, conversationData, 'main');
                return true;
            } else {
                conversationData.failedLoginAttempts++;
                conversationData.lastFailedAttemptTime = now;

                if (conversationData.failedLoginAttempts >= MAX_LOGIN_ATTEMPTS) {
                    await context.sendActivity(`Lo siento, no pude encontrar un empleado activo con ese Email Corporativo o RUT. Has excedido el número de intentos permitidos (${MAX_LOGIN_ATTEMPTS}). Por favor, intenta de nuevo en ${BLOCK_DURATION_MINUTES} minuto(s).`);
                } else {
                    await context.sendActivity('Lo siento, no pude encontrar un empleado activo con ese Email Corporativo o RUT. Por favor, verifica la información e intenta de nuevo.');
                }
                return true;
            }
        } catch (error) {
            console.error('Error durante la autenticación:', error);
            await context.sendActivity('Hubo un problema al intentar autenticarte. Por favor, intenta de nuevo más tarde o contacta a soporte.');
            return true;
        }
    }
}

module.exports = AuthMenu;