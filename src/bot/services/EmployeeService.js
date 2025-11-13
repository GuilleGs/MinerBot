// src/bot/services/EmployeeService.js

const mysql = require('mysql2/promise');

/**
 * Capa de acceso a datos para la información de los empleados.
 * Abstrae toda la lógica de interacción con la base de datos MySQL, utilizando un
 * pool de conexiones para mayor eficiencia y resiliencia.
 * 
 * Se recomienda que las variables de entorno sean cargadas en el punto de entrada
 * de la aplicación (ej: index.js) para mantener la configuración centralizada.
 */
class EmployeeService {
    /**
     * Inicializa el servicio y crea un pool de conexiones a la base de datos
     * utilizando las variables de entorno.
     */
    constructor() {
        const dbConfig = {
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD, // Se omite el valor por defecto por seguridad. Configurar en .env.
            database: process.env.DB_DATABASE || 'minerbothr_local_db',
            port: parseInt(process.env.DB_PORT || '3306'),
            waitForConnections: true,
            connectionLimit: 10, // Límite de conexiones en el pool. Ajustar según la carga esperada.
            queueLimit: 0,
            ssl: {
                // Para Azure MySQL Flexible Server con acceso público, 'rejectUnauthorized: false'
                // es a menudo necesario si no se configura un certificado CA.
                rejectUnauthorized: false
            }
        };

        // El pool de conexiones es más robusto y eficiente que una única conexión,
        // ya que gestiona múltiples conexiones y las reutiliza, evitando la sobrecarga
        // de crear una nueva conexión para cada consulta.
        this.pool = mysql.createPool(process.env.DB_CONNECTION_STRING_MYSQL || dbConfig);
        console.log('MySQL EmployeeService: Pool de conexiones inicializado.');
    }

    /**
     * Busca los datos de un empleado por su email corporativo o RUT.
     * Utiliza el pool de conexiones para ejecutar una consulta segura.
     * @param {string} identifier - El email corporativo o RUT del empleado.
     * @returns {Promise<object|null>} Un objeto con los datos del empleado o null si no se encuentra.
     * @throws {Error} Lanza un error si la consulta a la base de datos falla.
     */
    async getEmployeeByIdentifier(identifier) {
        // Se utiliza .execute() que implementa sentencias preparadas (prepared statements),
        // previniendo ataques de inyección SQL.
        try {
            const [rows] = await this.pool.execute(
                `SELECT
                    e.ID_Empleado, e.Nombre, e.ApellidoPaterno, e.EmailCorporativo, e.PasswordHash, e.Rut,
                    s.NombreSede AS Sede, a.NombreArea AS Area, c.NombreCargo AS Cargo,
                    e.ID_JefaturaDirecta, e.ID_Sede
                FROM Empleados e
                JOIN Sedes s ON e.ID_Sede = s.ID_Sede
                JOIN Areas a ON e.ID_Area = a.ID_Area
                JOIN Cargos c ON e.ID_Cargo = c.ID_Cargo
                WHERE (e.EmailCorporativo = ? OR e.Rut = ?) AND e.Estado = 'Activo'`,
                [identifier, identifier]
            );
            return rows.length > 0 ? rows[0] : null;
        } catch (error) {
            console.error('MySQL EmployeeService: Error al buscar empleado:', error.message);
            throw error; // Re-lanza el error para que sea manejado por la capa superior.
        }
    }

    /**
     * Busca el email de la jefatura directa de un empleado a partir de su ID.
     * @param {number} employeeId - El ID único del empleado.
     * @returns {Promise<string|null>} El email de la jefatura o null si no se encuentra.
     * @throws {Error} Lanza un error si la consulta a la base de datos falla.
     */
    async getJefaturaEmail(employeeId) {
        try {
            const [rows] = await this.pool.execute(
                `SELECT j.EmailCorporativo
                FROM Empleados e
                JOIN Empleados j ON e.ID_JefaturaDirecta = j.ID_Empleado
                WHERE e.ID_Empleado = ?`,
                [employeeId]
            );
            return rows.length > 0 ? rows[0].EmailCorporativo : null;
        } catch (error) {
            console.error('MySQL EmployeeService: Error al buscar email de jefatura:', error.message);
            throw error;
        }
    }

    /**
     * Cierra todas las conexiones en el pool.
     * Útil para un apagado ordenado de la aplicación (graceful shutdown) o en entornos de prueba.
     * @returns {Promise<void>}
     */
    async disconnect() {
        if (this.pool) {
            await this.pool.end();
            console.log('MySQL EmployeeService: Pool de conexiones cerrado.');
        }
    }
}

module.exports = EmployeeService;