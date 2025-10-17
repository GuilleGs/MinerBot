// src/bot/services/EmployeeService.js
const mysql = require('mysql2/promise'); // Módulo para interacción con MySQL.
//const dotenv = require('dotenv'); // Carga variables de entorno.
//dotenv.config({ quiet: true }); // Inicializa la carga de variables de entorno.

/**
 * Gestiona la conexión y las operaciones de consulta con la base de datos MySQL de empleados.
 * Abstrae la lógica de acceso a datos para que el bot recupere información de empleados.
 */
class EmployeeService {
    /**
     * Configura los parámetros de conexión a la base de datos a partir de variables de entorno.
     */
    constructor() {
        /** @type {mysql.Connection|null} Conexión activa a la base de datos MySQL. */
        this.connection = null;

        // Configuración de la base de datos, con valores por defecto para desarrollo local.
        this.dbConfig = {
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || 'TU_CONTRASEÑA_ROOT', // !Cambiar en .env por la contraseña real.
            database: process.env.DB_DATABASE || 'minerbothr_local_db',
            port: parseInt(process.env.DB_PORT || '3306') // Asegura que el puerto sea un número.
        };

        // Permite usar una cadena de conexión completa si está definida.
        this.connectionString = process.env.DB_CONNECTION_STRING_MYSQL;
    }

    /**
     * Establece una conexión con la base de datos. Reutiliza una conexión existente si está activa.
     * @returns {Promise<mysql.Connection>} La conexión a la base de datos.
     * @throws {Error} Si la conexión falla.
     */
    async connect() {
        if (this.connection) {
            return this.connection; // Reutiliza conexión.
        }
        try {
            this.connection = this.connectionString
                ? await mysql.createConnection(this.connectionString)
                : await mysql.createConnection(this.dbConfig);

            console.log('MySQL EmployeeService: Conexión establecida con éxito.'); // Log de conexión exitosa.
            return this.connection;
        } catch (error) {
            console.error('MySQL EmployeeService: Error al conectar a la base de datos:', error.message); // Log de error de conexión.
            throw error;
        }
    }

    /**
     * Cierra la conexión activa a la base de datos.
     * @returns {Promise<void>}
     */
    async close() {
        if (this.connection) {
            await this.connection.end(); // Cierra la conexión.
            this.connection = null; // Resetea la conexión.
            console.log('MySQL EmployeeService: Conexión cerrada.'); // Log de cierre de conexión.
        }
    }

    /**
     * Busca los datos de un empleado por su email corporativo o RUT.
     * Incluye información de sede, área y cargo para el perfil completo.
     * @param {string} identifier - Email corporativo o RUT del empleado.
     * @returns {Promise<object|null>} Objeto con datos del empleado o null si no se encuentra.
     * @throws {Error} Si la consulta a la base de datos falla.
     */
    async getEmployeeByIdentifier(identifier) {
        await this.connect(); // Asegura conexión a la base de datos.
        try {
            const [rows] = await this.connection.execute(
                `SELECT
                    e.ID_Empleado, e.Nombre, e.ApellidoPaterno, e.EmailCorporativo, e.Rut,
                    s.NombreSede AS Sede, a.NombreArea AS Area, c.NombreCargo AS Cargo,
                    e.ID_JefaturaDirecta
                FROM Empleados e
                JOIN Sedes s ON e.ID_Sede = s.ID_Sede
                JOIN Areas a ON e.ID_Area = a.ID_Area
                JOIN Cargos c ON e.ID_Cargo = c.ID_Cargo
                WHERE (e.EmailCorporativo = ? OR e.Rut = ?) AND e.Estado = 'Activo'`, // Busca empleado activo por email o RUT.
                [identifier, identifier] // Parámetros SQL para seguridad.
            );
            return rows.length > 0 ? rows[0] : null; // Retorna el primer resultado o null.
        } catch (error) {
            console.error('MySQL EmployeeService: Error al buscar empleado:', error.message); // Log de error de consulta.
            throw error;
        }
    }

    /**
     * Busca el email de la jefatura directa de un empleado por su ID.
     * @param {number} employeeId - ID del empleado.
     * @returns {Promise<string|null>} Email de la jefatura o null si no se encuentra.
     * @throws {Error} Si la consulta a la base de datos falla.
     */
    async getJefaturaEmail(employeeId) {
        await this.connect(); // Asegura conexión a la base de datos.
        try {
            const [rows] = await this.connection.execute(
                `SELECT j.EmailCorporativo
                FROM Empleados e
                JOIN Empleados j ON e.ID_JefaturaDirecta = j.ID_Empleado
                WHERE e.ID_Empleado = ?`,
                [employeeId] // Parámetro SQL para seguridad.
            );
            return rows.length > 0 ? rows[0].EmailCorporativo : null; // Retorna el email o null.
        } catch (error) {
            console.error('MySQL EmployeeService: Error al buscar email de jefatura:', error.message); // Log de error de consulta.
            throw error;
        }
    }
}

module.exports = EmployeeService;