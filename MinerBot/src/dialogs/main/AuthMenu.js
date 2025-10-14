// src/dialogs/main/AuthMenu.js
const { MessageFactory } = require('botbuilder');
const content = require('../data/content'); // Ajustar la ruta si es necesario

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

        // --- INICIO CAMBIOS: LÓGICA DE BLOQUEO POR INTENTOS FALLIDOS ---
        const now = Date.now();

        // Si hay un bloqueo activo, verificar si ya expiró
        if (conversationData.failedLoginAttempts >= MAX_LOGIN_ATTEMPTS && conversationData.lastFailedAttemptTime > 0) {
            const timeSinceLastAttempt = now - conversationData.lastFailedAttemptTime;
            if (timeSinceLastAttempt < BLOCK_DURATION_MS) {
                const remainingTimeSeconds = Math.ceil((BLOCK_DURATION_MS - timeSinceLastAttempt) / 1000);
                await context.sendActivity(`Demasiados intentos de acceso fallidos. Por favor, espera ${remainingTimeSeconds} segundos antes de intentar de nuevo.`);
                return true; // Se manejó la entrada, sigue bloqueado
            } else {
                // El bloqueo ha expirado, resetear contador
                conversationData.failedLoginAttempts = 0;
                conversationData.lastFailedAttemptTime = 0;
            }
        }
        // --- FIN CAMBIOS ---

        try {
            const employee = await bot.employeeService.getEmployeeByIdentifier(identifier);

            if (employee) {
                // --- INICIO CAMBIOS: RESETEAR CONTADOR AL AUTENTICARSE EXITOSAMENTE ---
                conversationData.isAuthenticated = true;
                conversationData.employeeId = employee.ID_Empleado;
                conversationData.employeeName = `${employee.Nombre} ${employee.ApellidoPaterno}`;
                conversationData.employeeEmail = employee.EmailCorporativo;
                conversationData.employeeSede = employee.Sede;
                conversationData.employeeArea = employee.Area;
                conversationData.employeeCargo = employee.Cargo;

                // Resetear el contador de intentos fallidos al éxito
                conversationData.failedLoginAttempts = 0;
                conversationData.lastFailedAttemptTime = 0;
                // --- FIN CAMBIOS ---

                await context.sendActivity(`¡Bienvenido, ${employee.Nombre}! Has iniciado sesión correctamente. 😊`);
                await bot.navigateToMenu(context, conversationData, 'main');
                return true;
            } else {
                // --- INICIO CAMBIOS: INCREMENTAR CONTADOR DE INTENTOS FALLIDOS ---
                conversationData.failedLoginAttempts++;
                conversationData.lastFailedAttemptTime = now; // Registrar el tiempo del último fallo

                if (conversationData.failedLoginAttempts >= MAX_LOGIN_ATTEMPTS) {
                    await context.sendActivity(`Lo siento, no pude encontrar un empleado activo con ese Email Corporativo o RUT. Has excedido el número de intentos permitidos (${MAX_LOGIN_ATTEMPTS}). Por favor, intenta de nuevo en ${BLOCK_DURATION_MINUTES} minuto(s).`);
                } else {
                    await context.sendActivity('Lo siento, no pude encontrar un empleado activo con ese Email Corporativo o RUT. Por favor, verifica la información e intenta de nuevo.');
                }
                return true; // Autenticación fallida
                // --- FIN CAMBIOS ---
            }
        } catch (error) {
            console.error('Error durante la autenticación:', error);
            await context.sendActivity('Hubo un problema al intentar autenticarte. Por favor, intenta de nuevo más tarde o contacta a soporte.');
            // En caso de error de servicio, no contamos como intento fallido del usuario,
            // pero podríamos querer hacer algo diferente si la DB está caída por ejemplo.
            return true;
        }
    }
}

module.exports = AuthMenu;