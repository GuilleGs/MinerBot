// src/dialogs/main/AuthMenu.js
const { MessageFactory } = require('botbuilder'); // Módulo para crear mensajes del bot.
const content = require('../data/content'); // Importa el contenido estático del bot.

// Constantes para la configuración del mecanismo de bloqueo por intentos de login fallidos.
const MAX_LOGIN_ATTEMPTS = 2; // Número máximo de intentos permitidos antes de aplicar un bloqueo temporal.
const BLOCK_DURATION_MINUTES = 1; // Duración del bloqueo en minutos.
const BLOCK_DURATION_MS = BLOCK_DURATION_MINUTES * 60 * 1000; // Equivalente en milisegundos para cálculos de tiempo.

/**
 * Diálogo encargado de gestionar el proceso de autenticación del usuario.
 * Permite a los empleados iniciar sesión utilizando su email corporativo o RUT
 * e implementa un mecanismo de bloqueo temporal ante múltiples intentos fallidos.
 */
class AuthMenu {
    /**
     * Inicializa el diálogo, estableciendo una referencia al bot principal.
     * @param {object} bot - Instancia del bot principal para acceso a servicios y navegación.
     */
    constructor(bot) {
        this.bot = bot;
    }

    /**
     * Muestra el mensaje de bienvenida y las instrucciones para iniciar sesión al usuario.
     * @param {TurnContext} context - Contexto del turno actual de la conversación.
     */
    async show(context) {
        // Mensaje de bienvenida al inicio del proceso de autenticación.
        await context.sendActivity('Para acceder a las funcionalidades personalizadas de MinerBot Global, por favor, ingresa tu **Email Corporativo** o tu **RUT** (ej. 12345678-9).'); 
    }

    /**
     * Procesa la entrada del usuario durante el intento de autenticación.
     * Valida el identificador proporcionado, aplica la lógica de bloqueo por intentos fallidos
     * y, si es exitoso, almacena los datos del empleado en el estado de la conversación.
     * @param {TurnContext} context - Contexto del turno actual de la conversación.
     * @param {string} text - Texto del mensaje enviado por el usuario (identificador de empleado).
     * @param {object} conversationData - Objeto que contiene el estado de la conversación.
     * @param {object} bot - Instancia del bot principal para acceso a servicios y navegación.
     * @returns {Promise<boolean>} Retorna true si la entrada fue manejada, false en caso contrario.
     */
    async handleInput(context, text, conversationData, bot) {
        const identifier = text.trim(); // Limpia la entrada del usuario.

        // Solicita una entrada si el usuario no proporcionó un identificador.
        if (!identifier) {
            await context.sendActivity('Por favor, ingresa tu Email Corporativo o RUT para continuar.');
            return true;
        }

        const now = Date.now(); // Marca de tiempo actual para la lógica de bloqueo.

        // Implementa la lógica de bloqueo temporal por intentos fallidos.
        // Si se han excedido los intentos y el bloqueo aún está activo, notifica al usuario.
        if (conversationData.failedLoginAttempts >= MAX_LOGIN_ATTEMPTS && conversationData.lastFailedAttemptTime > 0) {
            const timeSinceLastAttempt = now - conversationData.lastFailedAttemptTime;
            if (timeSinceLastAttempt < BLOCK_DURATION_MS) {
                const remainingTimeSeconds = Math.ceil((BLOCK_DURATION_MS - timeSinceLastAttempt) / 1000);
                await context.sendActivity(`Demasiados intentos de acceso fallidos. Por favor, espera ${remainingTimeSeconds} segundos antes de intentar de nuevo.`);
                return true; // La entrada se manejó, pero el acceso está bloqueado.
            } else {
                // El período de bloqueo ha expirado, se resetea el contador.
                conversationData.failedLoginAttempts = 0;
                conversationData.lastFailedAttemptTime = 0;
            }
        }

        try {
            // Intenta buscar el empleado en la base de datos utilizando el identificador proporcionado.
            const employee = await bot.employeeService.getEmployeeByIdentifier(identifier);

            if (employee) {
                // Autenticación exitosa: se actualiza el estado de la conversación con los datos del empleado.
                conversationData.isAuthenticated = true;
                conversationData.employeeId = employee.ID_Empleado;
                conversationData.employeeName = `${employee.Nombre} ${employee.ApellidoPaterno}`;
                conversationData.employeeEmail = employee.EmailCorporativo;
                conversationData.employeeSede = employee.Sede;
                conversationData.employeeRut = employee.Rut;       // Almacena el RUT del empleado.
                conversationData.employeeArea = employee.Area;     // Almacena el Área del empleado.
                conversationData.employeeCargo = employee.Cargo;   // Almacena el Cargo del empleado.

                // Resetea el contador de intentos fallidos tras un login exitoso.
                conversationData.failedLoginAttempts = 0;
                conversationData.lastFailedAttemptTime = 0;

                await context.sendActivity(`Bienvenido, ${employee.Nombre}! Ha iniciado sesión correctamente.`); 
                await bot.navigateToMenu(context, conversationData, 'main'); // Redirige al menú principal.
                return true;
            } else {
                // Autenticación fallida: se incrementa el contador de intentos.
                conversationData.failedLoginAttempts++;
                conversationData.lastFailedAttemptTime = now; // Registra el momento del último fallo.

                if (conversationData.failedLoginAttempts >= MAX_LOGIN_ATTEMPTS) {
                    await context.sendActivity(`Lo siento, no pude encontrar un empleado activo con ese Email Corporativo o RUT. Ha excedido el número de intentos permitidos (${MAX_LOGIN_ATTEMPTS}). Por favor, intente de nuevo en ${BLOCK_DURATION_MINUTES} minuto(s).`);
                } else {
                    await context.sendActivity('Lo siento, no pude encontrar un empleado activo con ese Email Corporativo o RUT. Por favor, verifique la información e intente de nuevo.');
                }
                return true; // La entrada fue manejada (autenticación fallida).
            }
        } catch (error) {
            // Captura y registra errores durante la consulta al servicio de empleados.
            console.error('AuthMenu: Error durante la autenticación del empleado:', error.message);
            await context.sendActivity('Hubo un problema al intentar autenticarle. Por favor, intente de nuevo más tarde o contacte a soporte.');
            return true; // La entrada fue manejada (fallo del servicio).
        }
    }
}

module.exports = AuthMenu;