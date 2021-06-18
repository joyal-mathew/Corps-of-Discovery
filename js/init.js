"use strict";

const header = document.getElementById("header");
const story = document.getElementById("story");
const input = document.getElementById("input");

const state = {
    crew: {},
    traveled: 0,
    other: {
        food: 100,
        morale: 100,
        ammo: 100,
    },
    hidden: {
        animosity: 0,
        submissiveness: 100,
    }
};
const oneTimeEvents = {
    voting: 1,
    falls: .02,
    mountains: .02,
};
const events = [
    {
        chance: () => 1,
        validate: input => input === "1" && state.other.ammo >= 2 || input === "2" && state.other.ammo >= 1 || input == "3",
        text() {
            let t = "You meet a tribe of Native Americans. They want 2 ammo but your crew advises giving them only 1.<br>";
            if (state.other.ammo >= 2) {
                t += "1.) Give 2 ammo<br>";
            }
            if (state.other.ammo >= 1) {
                t += "2.) Give 1 ammo<br>";
            }
            return t + "3.) Give 0 ammo<br>";
        },
        handle(input) {
            switch (input) {
                case "1":
                    state.hidden.relations = checkedAdd(state.hidden.relations, randint(0, 10));
                    state.other.ammo = checkedAdd(state.other.ammo, -2);
                    return "You give 2 ammo. They seem to appreciate it.<br>";
                case "2":
                    state.hidden.relations = checkedAdd(state.hidden.relations, randint(-5, 5));
                    state.other.ammo = checkedAdd(state.other.ammo, -1);
                    return "You give 1 ammo. They are not happy.<br>";
                case "3":
                    state.hidden.relations = checkedAdd(state.hidden.relations, randint(-10, 0));
                    return "You give 0 ammo. They are angry.<br>";
            }
        }
    },
    {
        chance: () => 1,
        validate: input => input === "1" || input === "2",
        text: () => "You arrive at a fork in your path. Your gut tells you to go South but your crew says North.<br>1.) Go South<br>2.) Go North<br>",
        handle(input) {
            if (Math.random() < 0.5) {
                state.other.morale = checkedAdd(state.other.morale, -10);
                state.traveled -= 50;
                return "You went the wrong way. Your journey has been delayed.<br>";
            }
            else {
                return "You went the right way.<br>";
            }
        }
    },
    {
        chance: () => 1 - (state.other.food + state.other.morale + state.hidden.submissiveness) / 300,
        validate: input => input === "1" || input === "2",
        text() {
            const present = presentCrew();
            return present[randint(0, present.length - 1)] + " was caught stealing. Punish?<br>1.) Punish<br>2.) Don't Punish<br>";
        },
        handle(input) {
            if (input === "1") {
                state.other.morale = checkedAdd(state.other.morale, -10);
                return `The punishment was ${randint(10, 100)} lashes.<br>`;
            }
            else {
                state.hidden.submissiveness = checkedAdd(state.hidden.submissiveness, -10);
                return "There was no punishment.<br>";
            }
        }
    },
    {
        chance: () => 1,
        validate: input => input === "1" || input === "2" || input === "3",
        text: () => "You find some wild game to hunt.<br>1.) Hunt More<br>2.) Hunt less<br>3.) Hunt None<br>",
        handle(input) {
            let amount;
            switch (input) {
                case "1":
                    amount = randint(state.other.ammo / 10, state.other.ammo / 2);
                    state.other.food = checkedAdd(state.other.food, amount);
                    state.other.ammo = checkedAdd(state.other.ammo, -2);
                    return `You were able to get ${amount} food<br>`;
                case "2":
                    amount = randint(state.other.ammo / 20, state.other.ammo / 4);
                    state.other.food = checkedAdd(state.other.food, amount);
                    state.other.ammo = checkedAdd(state.other.ammo, -1);
                    return `You were able to get ${amount} food<br>`;
                case "3":
                    return `You chose not to hunt<br>`;
            }
        }
    },
    {
        chance: () => 0.1,
        validate: input => input === "1" || input === "2",
        text() {
            const present = presentCrew();
            const name = present[randint(0, present.length - 1)];
            state.crew[name] = crewStates.DEAD;
            return name + " dies of a burst appendix. Hold a funeral?<br>1.) Hold funeral<br>2.) Don't<br>";
        },
        handle(input) {
            if (input === "1") {
                state.traveled -= 100;
                return "You held a funeral.<br>";
            }
            else {
                state.other.morale = checkedAdd(state.other.morale, -10);
                return "No funeral was held.<br>";
            }
        }
    },
    {
        chance: () => state.hidden.animosity / 100,
        validate: input => input === "1" || input === "2",
        text: () => "You are confronted by an angry group of Native Americans. Fight?<br>1.) Fight<br>2.) Concede<br>",
        handle(input) {
            if (input === "1") {
                const present = presentCrew();
                const name = present[randint(0, present.length - 1)];
                state.crew[name] = crewStates.DEAD;
                state.other.ammo = checkedAdd(state.other.ammo, -2);
                return `You fight the tribe but end up losing ${name}.<br>`;
            }
            else {
                state.other.food /= 2;
                state.other.ammo /= 2;
                state.other.food |= 0;
                state.other.ammo |= 0;
                state.other.morale = checkedAdd(state.other.morale, -10);
                return "You are forced to give half your supplies.<br>";
            }
        }
    },
    {
        chance: () => 1,
        validate: input => input === "1" || input === "2",
        text: () => "You encounter a huge brown bear. Try to hunt?<br>1.) Hunt<br>2.) Leave<br>",
        handle(input) {
            if (input === "1") {
                if (Math.random() < 0.5) {
                    const present = presentCrew();
                    const name = present[randint(0, present.length - 1)];
                    state.crew[name] = crewStates.DEAD;
                    state.other.ammo = checkedAdd(state.other.ammo, -2);
                    return `The bear wins and ends up killing ${name}.<br>`;
                }
                else {
                    state.other.food = checkedAdd(state.other.food, 100);
                    state.other.ammo = checkedAdd(state.other.ammo, -2);
                    return `You win and get a lot of food.<br>`;
                }
            }
            else {
                return "You decide the risk is too great and quickly depart.<br>";
            }
        }
    },
    {
        chance: () => oneTimeEvents.voting,
        validate: input => input === "1" || input === "2",
        text: () => "Your crew wants to be allowed to vote on fort locations.<br>1.) Allow it<br>2.) Don't<br>",
        handle(input) {
            oneTimeEvents.voting = 0;
            if (input === "1") {
                state.other.morale = checkedAdd(state.other.morale, 100);
                state.hidden.submissiveness = checkedAdd(state.hidden.submissiveness, -10);
                return "Your crew appreciates the decision.<br>";
            }
            else {
                state.other.morale = checkedAdd(state.other.morale, -10);
                state.hidden.submissiveness = checkedAdd(state.hidden.submissiveness, 100);
                return "Your crew is not very happy.<br>";
            }
        }
    },
    {
        chance: () => oneTimeEvents.falls - oneTimeEvents.mountains,
        validate: input => input === "1" || input === "2",
        text: () => "You arrive at a great waterfall. Take rest?<br>1.) Rest<br>2.) Don't<br>",
        handle(input) {
            oneTimeEvents.falls = 0;
            if (input === "1") {
                state.other.morale = checkedAdd(state.other.morale, 100);
                state.other.food = checkedAdd(state.other.food, 100);
                state.traveled = checkedAdd(state.traveled, -200);
                return "You take some time to rest.<br>";
            }
            else {
                return "You continue on your brisk pace.<br>";
            }
        }
    },
    {
        chance: () => oneTimeEvents.mountains,
        validate: input => input === "1" || input === "2",
        text: () => "You arrive at a great mountain range. Take rest?<br>1.) Rest<br>2.) Don't<br>",
        handle(input) {
            oneTimeEvents.mountains = 0;
            if (input === "1") {
                state.other.morale = checkedAdd(state.other.morale, 100);
                state.other.food = checkedAdd(state.other.food, 100);
                state.traveled = checkedAdd(state.traveled, -200);
                return "You take some time to rest.<br>";
            }
            else {
                return "You continue on your brisk pace.<br>";
            }
        }
    },
];

const crewStates = {
    ALIVE: "<span style='color: green'>ALIVE</span>",
    DEAD: "<span style='color: gray'>DEAD</span>",
}

let handler = null;
let validate = null;

input.addEventListener("keyup", e => {
    if (e.code === "Enter") {
        e.preventDefault();
        const value = sanitize(input.value);
        input.value = "";
        if (handler) {
            if (validate && !validate(value)) {
                const message = document.createElement("span");
                message.innerText = "Invalid Input";
                message.classList.add("invalidInput");
                document.body.appendChild(message);
                setTimeout(() => document.body.removeChild(message), 1000);
            }
            else {
                const temp = handler;
                handler = null;
                validate = null;
                temp(value);
            }
        }
    }
});

const read = async checkValid => new Promise(res => {
    input.focus();

    validate = checkValid;
    handler = value => res(value);
});

const write = async text => new Promise(res => {
    const chars = text.split("");
    const delay = 0;

    text = story.innerHTML;

    function writeChar() {
        const c = chars.shift();

        if (c) {
            text += c;
            story.innerHTML = text;
            setTimeout(writeChar, delay);
        }
        else {
            res();
        }
    }

    writeChar();
});

const clear = () => story.innerHTML = "";

const update = () => header.innerHTML = `Traveled ${state.traveled} miles` + "<br>" + Object.entries(state.other).map(p => p.join(": ")).join(" | ") + "<br>" + Object.entries(state.crew).map(p => p.join(": ")).join(" | ");

function sanitize(string) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        "/": '&#x2F;',
    };
    const reg = /[&<>"'/]/ig;
    return string.replace(reg, (match)=>(map[match]));
}

function randint(min, max, float) {
    const val = Math.floor(Math.random() * (max - min + 1)) + min;
    if (!float) {
        return Math.round(val);
    }
    else {
        return val;
    }
}

function presentCrew() {
    const presentStates = [ crewStates.ALIVE ];
    return Object.keys(state.crew).filter(k => presentStates.includes(state.crew[k]));
}

function checkedAdd(value, amount) {
    value += amount;
    if (value > 100)
        return 100;
    else if (value < 0)
        return 0;
    else
        return value;
}
