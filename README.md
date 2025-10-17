# MinerBot 🤖

## Descripción del Proyecto

**MinerBot** es un asistente conversacional avanzado diseñado para optimizar y automatizar la gestión de consultas del área de Recursos Humanos (RRHH) en entornos corporativos. Desarrollado con **Microsoft Bot Framework** sobre **Node.js 20**, MinerBot ofrece una plataforma modular y extensible para responder eficientemente a preguntas sobre vacaciones, licencias, permisos, beneficios económicos y otros temas de RRHH.

El bot se integra con una **Knowledge Base (KB) en Azure Language Studio** para proporcionar respuestas automáticas precisas y confiables, garantizando una interacción ágil y una centralización efectiva de la información crucial para los colaboradores. Su arquitectura flexible permite una fácil expansión de funcionalidades y la integración con otros sistemas empresariales.

---

## 🚀 Tecnologías y Lenguajes

Este proyecto ha sido construido utilizando un conjunto de tecnologías modernas y estándares de la industria, optimizando el rendimiento y la escalabilidad:

-   **Microsoft Bot Framework**
    [![Microsoft Bot Framework](https://img.shields.io/badge/Bot_Framework-00A4EF?style=for-the-badge&logo=microsoft&logoColor=white)](https://dev.botframework.com/)
    _Plataforma principal para el desarrollo y la administración de bots conversacionales._

-   **Node.js 20**
    [![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
    _Entorno de ejecución robusto y asíncrono que impulsa el backend del bot._

-   **JavaScript**
    [![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/es/docs/Web/JavaScript)
    _Lenguaje de programación principal, utilizado para toda la lógica del bot y los servicios._

-   **Azure Language Studio**
    [![Azure](https://img.shields.io/badge/Azure-0078D4?style=for-the-badge&logo=microsoft-azure&logoColor=white)](https://azure.microsoft.com/es-es/services/cognitive-services/language-service/)
    _Servicio de inteligencia artificial que proporciona la base de conocimientos para respuestas automáticas (Custom Question Answering)._

-   **MySQL**
    [![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
    _Sistema de gestión de bases de datos relacionales utilizado para almacenar la información de los empleados._

-   **Power Automate**
    [![Power Automate](https://img.shields.io/badge/Power_Automate-0066CC?style=for-the-badge&logo=microsoft-power-automate&logoColor=white)](https://powerautomate.microsoft.com/)
    _Herramienta de automatización de flujos de trabajo para integrar el bot con sistemas como SharePoint/Excel y correo electrónico, gestionando solicitudes._

---

## 🎯 Objetivo del Proyecto

El objetivo primordial de MinerBot es **automatizar y optimizar la gestión de consultas de Recursos Humanos**, liberando al personal de RRHH de tareas repetitivas y permitiéndoles enfocarse en iniciativas estratégicas. Busca reducir significativamente los tiempos de respuesta, garantizar la disponibilidad de información 24/7 y proporcionar una experiencia de usuario consistente y eficiente a todos los colaboradores de MinerBot Global.

---

## 🔒 Consideraciones de Seguridad y Configuración

Para el correcto funcionamiento del bot, es imprescindible configurar las variables de entorno necesarias. Estas deben gestionarse de manera segura:

-   ***Las credenciales, claves de API y URLs de servicios (como las de Azure y Power Automate) deben almacenarse exclusivamente en un archivo `.env` y **nunca deben ser subidas al repositorio de código** por motivos de seguridad.***

---

## 🛠️ Instalación y Ejecución Local

Para poner en marcha MinerBot en tu entorno de desarrollo local, sigue los pasos a continuación:

1.  **Clonar el Repositorio:**
    ```bash
    git clone https://github.com/GuilleGs/MinerBot
    cd MinerBot
    ```

2.  **Instalar Dependencias:**
    ```bash
    npm install
    ```

3.  **Configurar Variables de Entorno:**
    Crea un archivo `.env` en la raíz del proyecto y configura las siguientes variables, reemplazando los valores de ejemplo con tus credenciales y URLs reales:

    ```ini
    # ==============================
    # CONFIGURACIÓN DEL BOT FRAMEWORK
    # ==============================
    MicrosoftAppId=
    MicrosoftAppPassword=

    # ====================================
    # AZURE LANGUAGE SERVICE (QnA Maker)
    # ====================================
    LanguageEndpointHostName=https://botminer.cognitiveservices.azure.com/
    LanguageEndpointKey=YOUR_AZURE_LANGUAGE_SERVICE_KEY
    ProjectName=
    DeploymentName=

    # ==============================
    # BASE DE DATOS MySQL (LOCAL)
    # ==============================
    DB_HOST=
    DB_USER=
    DB_PASSWORD=
    DB_DATABASE=
    DB_PORT=
    #
    # ==============================
    # POWER AUTOMATE WEBHOOKS
    # ==============================
    POWER_AUTOMATE_QUERY_FLOW_URL="YOUR_POWER_AUTOMATE_QUERY_FLOW_URL"
    POWER_AUTOMATE_COURSE_FLOW_URL="YOUR_POWER_AUTOMATE_COURSE_FLOW_URL"
    POWER_AUTOMATE_COMPLAINT_FLOW_URL="YOUR_POWER_AUTOMATE_COMPLAINT_FLOW_URL"
    ```
    _Asegúrate de que este archivo `.env` esté listado en tu `.gitignore`._

4.  **Iniciar el Bot:**
    ```bash
    npm start
    ```
    El bot se ejecutará y escuchará en `http://localhost:3978`. Puedes probarlo con el [Bot Framework Emulator](https://github.com/microsoft/BotFramework-Emulator).

---
## 👨‍💻 Autor

-   **Guillermo G.S.**
    -   [Perfil de GitHub](https://github.com/GuilleGs)
    -   [Perfil de LinkedIn](www.linkedin.com/in/guillermo-gonzalez-s)
