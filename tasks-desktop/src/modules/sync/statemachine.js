

async function runStateMachine(initialState) {
    let currentState = initialState;

    while(currentState) {
        await currentState.runEffect();
        currentState = await currentState.next();
    }
}

module.exports.runStateMachine = runStateMachine;