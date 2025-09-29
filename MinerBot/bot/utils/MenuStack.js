// bot/utils/MenuStack.js
class MenuStack {
    constructor() {
        this.stack = [];
    }

    push(menu) {
        this.stack.push(menu);
    }

    pop() {
        return this.stack.pop();
    }

    current() {
        return this.stack[this.stack.length - 1];
    }

    clear() {
        this.stack = [];
    }
}

module.exports = MenuStack;
