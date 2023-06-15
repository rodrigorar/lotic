

async function runStateMachine(initialState) {
    let currentState = initialState;

    while(currentState) {
        await currentState.runEffect();
        currentState = currentState.next();
    }
}

module.exports.runStateMachine = runStateMachine;