"use strict";

function getEvent() {
    const items = events;
    const weights = items.map(e => e.chance());

    let i;

    for (i = 0; i < weights.length; i++)
        weights[i] += weights[i - 1] || 0;

    var random = Math.random() * weights[weights.length - 1];

    for (i = 0; i < weights.length; i++)
        if (weights[i] > random)
            break;

    return items[i];
}

(async () => {

update();

await write("Captain, you have been chosen by President Thomas Jefferson to survey the land out west.<br>You need to recruit a team.<br>");
await write("What is the Lieutenant's name?<br>").then(read).then(name => { state.crew["Lt. " + name] = crewStates.ALIVE; update(); });
await write("What is the Sergeant's name?<br>").then(read).then(name => { state.crew["Sgt. " + name] = crewStates.ALIVE; update(); });
await write("What is the Private's name?<br>").then(read).then(name => { state.crew["Pvt. " + name] = crewStates.ALIVE; update(); });
await write("What is the Interpreter’s name?<br>").then(read).then(name => { state.crew["Intpr. " + name] = crewStates.ALIVE; update(); });
await write("What is the dog's name?<br>").then(read).then(name => { state.crew["Dog " + name] = crewStates.ALIVE; update(); });
await write("Enter to continue").then(read).then(clear);

for (; state.traveled < 4000; state.traveled += state.other.morale) {
    const event = getEvent();
    console.log(state.hidden.animosity / 100);

    await write(event.text()).then(() => read(event.validate)).then(input => write(event.handle(input)));
    state.other.food = checkedAdd(state.other.food, -10);
    if (state.other.food < 25)
        state.other.morale = checkedAdd(state.other.morale, -10);
    else if (state.other.food > 75)
        state.other.morale = checkedAdd(state.other.morale, 10);
    update();
    await write("<br>Enter to continue").then(read).then(clear);

    if (!state.other.food) {
        write("Your crew ran out of food, becoming unable to feed yourselves. The crew splits up. Some die and others are able to find help from Native Americans.<br><br>Refresh the page to play again.");
        return;
    }
    if (!state.other.morale) {
        write("Your crew is not motivated enough to move on. The party disbands as people start to desert.<br><br>Refresh the page to play again.");
        return;
    }
    if (!state.other.ammo) {
        write("Your crew ran out of ammo, becoming unable to defend yourselves. Attacks from Native Americans and wildlife force you to end your journey.<br><br>Refresh the page to play again.");
        return;
    }
    if (!presentCrew().length) {
        write("Your entire crew is gone. You are left to wander the wilderness for the rest of your sad life, unable to complete your journey.<br><br>Refresh the page to play again.");
        return;
    }
    if (!state.hidden.submissiveness) {
        write("Your crew turn mutinous and decides to go off on their own. You are left to wander the wilderness alone.<br><br>Refresh the page to play again.");
        return;
    }
}

write("You have completed your 4000 mile journey. After the trip home you and your crew are regarded as heroes.<br><br>Refresh the page to play again.");

})();
