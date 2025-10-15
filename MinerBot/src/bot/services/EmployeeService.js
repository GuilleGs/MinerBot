// src/bot/services/EmployeeService.js
const mysql = require('mysql2/promise'); // Usamos la versión de promesas para async/await
const dotenv = require('dotenv');
dotenv.config();

class EmployeeService {
    constructor() {
        this.connection = null;
        this.dbConfig = {
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || 'TU_CONTRASEÑA_ROOT', // ¡CAMBIAR A TU CONTRASEÑA REAL!
            database: process.env.DB_DATABASE || 'minerbothr_local_db',
            port: process.env.DB_PORT || 3306
        };
        // Opcional: Si prefieres usar la cadena de conexión completa del .env
        this.connectionString = process.env.DB_CONNECTION_STRING_MYSQL;
    }

    async connect() {
        if (this.connection) {
            return this.connection;
        }
        try {
            // Si la cadena de conexión está definida, la usamos.
            if (this.connectionString) {
                this.connection = await mysql.createConnection(this.connectionString);
            } else { // Si no, usamos las propiedades individuales.
                this.connection = await mysql.createConnection(this.dbConfig);
            }
            console.log('✅ Conexión a MySQL exitosa.');
            return this.connection;
        } catch (error) {
            console.error('❌ Error al conectar a MySQL:', error.message);
            throw error; // Propagar el error para que el bot pueda manejarlo
        }
    }

    async close() {
        if (this.connection) {
            await this.connection.end();
            this.connection = null;
            console.log('🔌 Conexión a MySQL cerrada.');
        }
    }

    /**
     * Busca un empleado por su email corporativo o RUT.
     * @param {string} identifier - El email corporativo o RUT del empleado.
     * @returns {Promise<object|null>} Los datos del empleado si se encuentra, o null.
     */
    async getEmployeeByIdentifier(identifier) {
        await this.connect();
        try {
            const [rows] = await this.connection.execute(
                `SELECT
                    e.ID_Empleado,
                    e.Nombre,
                    e.ApellidoPaterno,
                    e.EmailCorporativo,
                    e.Rut,
                    s.NombreSede AS Sede,
                    a.NombreArea AS Area,
                    c.NombreCargo AS Cargo,
                    e.ID_JefaturaDirecta
                FROM Empleados e
                JOIN Sedes s ON e.ID_Sede = s.ID_Sede
                JOIN Areas a ON e.ID_Area = a.ID_Area
                JOIN Cargos c ON e.ID_Cargo = c.ID_Cargo
                WHERE e.EmailCorporativo = ? OR e.Rut = ? AND e.Estado = 'Activo'`,
                [identifier, identifier]
            );
            return rows.length > 0 ? rows[0] : null;
        } catch (error) {
            console.error('❌ Error al buscar empleado:', error.message);
            throw error;
        }
    }

    /**
     * Busca el email de la jefatura de un empleado dado su ID.
     * @param {number} employeeId
     * @returns {Promise<string|null>} El email de la jefatura o null.
     */
    async getJefaturaEmail(employeeId) {
        await this.connect();
        try {
            const [rows] = await this.connection.execute(
                `SELECT j.EmailCorporativo
                FROM Empleados e
                JOIN Empleados j ON e.ID_JefaturaDirecta = j.ID_Empleado
                WHERE e.ID_Empleado = ?`,
                [employeeId]
            );
            return rows.length > 0 ? rows[0].EmailCorporativo : null;
        } catch (error) {
            console.error('❌ Error al buscar email de jefatura:', error.message);
            throw error;
        }
    }

    // Aquí irían otros métodos para interactuar con la BD, ej. para Power Automate:
    // async insertCourseRequest(employeeId, courseName, ...) { ... }
    // async insertComplaint(employeeId, complaintDetails, ...) { ... }
}

module.exports = EmployeeService;