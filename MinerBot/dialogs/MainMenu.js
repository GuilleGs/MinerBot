// dialogs/MainMenu.js
const { MessageFactory } = require('botbuilder');
const VacacionesMenu = require('./VacacionesMenu');
const BeneficiosMenu = require('./BeneficiosMenu');

class MainMenu {
    constructor(bot) {
        this.bot = bot; // referencia al bot
        this.options = [
            'Vacaciones, Licencias y Permisos',
            'Beneficios Económicos'
        ];
    }

    async show(context) {
        await context.sendActivity(
            MessageFactory.suggestedActions(this.options, 'Menú principal:')
        );
    }

    async handleInput(context, text) {
        const lower = text.toLowerCase();

        if (lower.includes('vacaciones')) {
            this.bot.menuStack.push(this.bot.currentMenu);
            this.bot.currentMenu = this.bot.menus.vacaciones;
            await this.bot.currentMenu.show(context);
            return true;
        } else if (lower.includes('beneficios')) {
            this.bot.menuStack.push(this.bot.currentMenu);
            this.bot.currentMenu = this.bot.menus.beneficios;
            await this.bot.currentMenu.show(context);
            return true;
        }

        return false; // no manejado aquí
    }
}

module.exports = MainMenu;
