
class StateEffect {

    constructor() {
        if (this.constructor == StateEffect) {
            throw new Error("Cannot instantiate abstract class StateAction");
        }
    }

    async execute(args) {
        throw new Error("execute is an abstract function that needs to be implemented");
    }
}

class State {

    constructor(effect = undefined) {
        if (this.constructor == State) {
            throw new Error("Cannot instantiate abstract class State");
        }

        this.effect = effect;
    }

    async runEffect() {
        return this.effect ? await this.effect.execute() : undefined;
    }

    async next() {
        throw new Error("next is an abstract function that needs to be implemented");
    }
}

module.exports.State = State;
module.exports.StateEffect = StateEffect;