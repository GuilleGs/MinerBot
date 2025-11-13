// src/dialogs/main/AuthMenu.js

const { MessageFactory } = require('botbuilder');
const bcrypt = require('bcrypt');

// Constantes para el mecanismo de bloqueo de fuerza bruta.
const MAX_LOGIN_ATTEMPTS = 3;
const BLOCK_DURATION_MINUTES = 1;
const BLOCK_DURATION_MS = BLOCK_DURATION_MINUTES * 60 * 1000;

/**
 * Diálogo que gestiona el flujo de autenticación de dos pasos del usuario.
 * Responsabilidades:
 * 1. Solicitar identificador (RUT o Email).
 * 2. Solicitar contraseña.
 * 3. Validar credenciales de forma segura contra la base de datos.
 * 4. Implementar un mecanismo de bloqueo para prevenir ataques de fuerza bruta.
 * 5. Poblar el estado de la conversación con los datos del usuario al autenticarse.
 */
class AuthMenu {
    constructor(bot) {
        this.bot = bot;
    }

    /**
     * Muestra el mensaje inicial del flujo de autenticación.
     */
    async show(context) {
        await context.sendActivity('Para acceder, por favor, ingresa tu **Email Corporativo** o tu **RUT**.');
    }

    /**
     * Procesa la entrada del usuario y la dirige al paso correcto del flujo de autenticación.
     */
    async handleInput(context, text, conversationData, bot) {
        // Primero, verificamos si la cuenta está temporalmente bloqueada.
        if (this._isAccountBlocked(conversationData)) {
            const remainingTime = Math.ceil((BLOCK_DURATION_MS - (Date.now() - conversationData.lastFailedAttemptTime)) / 1000);
            await context.sendActivity(`Demasiados intentos fallidos. Por favor, espera ${remainingTime} segundos.`);
            return true;
        }

        // Dirige al método correspondiente según el estado actual de la conversación.
        if (conversationData.awaitingPassword) {
            return await this._handlePasswordStep(context, text.trim(), conversationData, bot);
        } else {
            return await this._handleIdentifierStep(context, text.trim(), conversationData, bot);
        }
    }

    /**
     * Maneja el primer paso del login: la validación del identificador.
     * @private
     */
    async _handleIdentifierStep(context, identifier, conversationData, bot) {
        try {
            const employee = await bot.employeeService.getEmployeeByIdentifier(identifier);

            if (employee?.PasswordHash) {
                // Éxito: Usuario encontrado y tiene contraseña. Avanzamos al siguiente paso.
                conversationData.pendingAuthData = employee;
                conversationData.awaitingPassword = true;
                await context.sendActivity('Usuario encontrado. Por favor, ingresa tu contraseña.');
            } else if (employee) {
                // Caso borde: Usuario existe pero no tiene contraseña.
                await context.sendActivity('Tu usuario está registrado pero no tiene una contraseña configurada. Por favor, contacta a soporte.');
            } else {
                // Fallo: Usuario no encontrado.
                this._incrementFailedAttempts(conversationData);
                await context.sendActivity('Lo siento, no pude encontrar un empleado activo con ese Email o RUT.');
            }
        } catch (error) {
            console.error('AuthMenu: Error en la fase de identificación:', error.message);
            await context.sendActivity('Hubo un problema al verificar tu usuario. Intenta más tarde.');
        }
        return true;
    }

    /**
     * Maneja el segundo paso del login: la validación de la contraseña.
     * @private
     */
    async _handlePasswordStep(context, password, conversationData, bot) {
        const storedEmployeeData = conversationData.pendingAuthData;
        const passwordIsValid = await bcrypt.compare(password, storedEmployeeData.PasswordHash);

        if (passwordIsValid) {
            // ¡ÉXITO! Las credenciales son correctas.
            this._populateSessionOnSuccess(conversationData, storedEmployeeData);
            await context.sendActivity(`¡Bienvenido, ${storedEmployeeData.Nombre}! Has iniciado sesión correctamente.`);
            await bot.navigateToMenu(context, conversationData, 'main');
        } else {
            // ¡FALLO! Contraseña incorrecta.
            this._incrementFailedAttempts(conversationData);
            this._resetAuthState(conversationData);
            await context.sendActivity('Contraseña incorrecta. Por favor, inicia el proceso de nuevo ingresando tu RUT o Email.');
        }
        return true;
    }

    /**
     * Rellena el estado de la conversación con los datos del empleado tras un login exitoso.
     * @private
     */
    _populateSessionOnSuccess(conversationData, employeeData) {
        conversationData.isAuthenticated = true;
        conversationData.employeeId = employeeData.ID_Empleado;
        conversationData.employeeName = `${employeeData.Nombre} ${employeeData.ApellidoPaterno}`;
        conversationData.employeeEmail = employeeData.EmailCorporativo;
        conversationData.employeeSede = employeeData.Sede;
        conversationData.employeeSedeId = employeeData.ID_Sede;
        conversationData.employeeRut = employeeData.Rut;
        conversationData.employeeArea = employeeData.Area;
        conversationData.employeeCargo = employeeData.Cargo;
        
        // Limpia todos los estados temporales de autenticación.
        this._resetAuthState(conversationData);
        conversationData.failedLoginAttempts = 0;
        conversationData.lastFailedAttemptTime = 0;
    }
    
    /**
     * Comprueba si la cuenta está bloqueada y resetea el contador si el tiempo de bloqueo ha pasado.
     * @private
     */
    _isAccountBlocked(conversationData) {
        const now = Date.now();
        if (conversationData.failedLoginAttempts >= MAX_LOGIN_ATTEMPTS) {
            if ((now - conversationData.lastFailedAttemptTime) < BLOCK_DURATION_MS) {
                return true; // Aún está bloqueado.
            } else {
                // El tiempo de bloqueo ha expirado, reseteamos.
                conversationData.failedLoginAttempts = 0;
                conversationData.lastFailedAttemptTime = 0;
                return false;
            }
        }
        return false;
    }

    /**
     * Incrementa el contador de intentos fallidos.
     * @private
     */
    _incrementFailedAttempts(conversationData) {
        conversationData.failedLoginAttempts++;
        conversationData.lastFailedAttemptTime = Date.now();
    }

    /**
     * Limpia los flags de estado relacionados con el flujo de autenticación.
     * @private
     */
    _resetAuthState(conversationData) {
        conversationData.awaitingPassword = false;
        conversationData.pendingAuthData = null;
    }
}

module.exports = AuthMenu;