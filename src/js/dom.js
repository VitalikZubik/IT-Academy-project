"use strict";

export class DOM {
    constructor (parent) {
        this.parent = parent;
        this.DOMState = {}
    }

    init = () => {
        this.createWindowWelcome();
        this.createHeader();
        this.createMainMenu();
        this.createBattleground();
        this.createPlacementInstruction();
    }

    getDOMState = () => {
        return this.DOMState;
    }

    createHeader = () => { 
        this.DOMState.header = document.createElement('div');
        this.DOMState.header.setAttribute('class', 'header');

        const h1 = document.createElement('h1');

        const p = document.createElement('p');

        this.DOMState.header.appendChild(h1);
        this.DOMState.header.appendChild(p);

        this.parent.appendChild(this.DOMState.header);
    }

    createWindowWelcome = () => {
        let value = '';

        this.DOMState.windowWelcome = document.createElement('div');
        this.DOMState.windowWelcome.setAttribute('class', 'window_welcome');

        const h2 = document.createElement('h2');
        value = document.createTextNode('Добро пожаловать в игру "Морской бой"!!!');
        h2.appendChild(value);

        const p = document.createElement('p');
        value = document.createTextNode('click');
        p.appendChild(value);

        this.DOMState.windowWelcome.appendChild(h2);
        this.DOMState.windowWelcome.appendChild(p);

        this.parent.appendChild(this.DOMState.windowWelcome);
    }

    createMainMenu = () => {
        let value = '';

        this.DOMState.mainMenu = document.createElement('div');
        this.DOMState.mainMenu.setAttribute('class', 'main_menu');

        this.DOMState.btnEntry = document.createElement('button');
        this.DOMState.btnEntry.setAttribute('class', 'btn btn_entry');
        value = document.createTextNode('Войти');
        this.DOMState.btnEntry.appendChild(value);
        this.DOMState.mainMenu.appendChild(this.DOMState.btnEntry);

        this.DOMState.btnPlay = document.createElement('button');
        this.DOMState.btnPlay.setAttribute('class', 'btn btn_play');
        value = document.createTextNode('Играть');
        this.DOMState.btnPlay.appendChild(value);
        this.DOMState.mainMenu.appendChild(this.DOMState.btnPlay);

        this.DOMState.btnContinue = document.createElement('button');
        this.DOMState.btnContinue.setAttribute('class', 'btn btn_continue');
        value = document.createTextNode('Продолжить');
        this.DOMState.btnContinue.appendChild(value);
        this.DOMState.mainMenu.appendChild(this.DOMState.btnContinue);

        this.DOMState.btnExit = document.createElement('button');
        this.DOMState.btnExit.setAttribute('class', 'btn btn_exit');
        value = document.createTextNode('Выйти');
        this.DOMState.btnExit.appendChild(value);
        this.DOMState.mainMenu.appendChild(this.DOMState.btnExit);

        this.parent.appendChild(this.DOMState.mainMenu);
    }

    createBattleground = () => {
        let value = '';

        this.DOMState.fieldHuman = document.createElement('div');
        this.DOMState.fieldHuman.setAttribute('class', 'wrap_field field_human');

        this.DOMState.fieldShipsHuman = document.createElement('div');
        this.DOMState.fieldShipsHuman.setAttribute('class', 'field field_ships_human');
        this.DOMState.fieldHuman.appendChild(this.DOMState.fieldShipsHuman);
        this.parent.appendChild(this.DOMState.fieldHuman);

        //
        this.DOMState.menu = document.createElement('div');
        this.DOMState.menu.setAttribute('class', 'menu');

        this.DOMState.btnMain = document.createElement('button');
        this.DOMState.btnMain.setAttribute('class', 'btn btn_main');
        value = document.createTextNode('Главное меню');
        this.DOMState.btnMain.appendChild(value);
        this.DOMState.menu.appendChild(this.DOMState.btnMain);

        this.DOMState.btnStartOver = document.createElement('button');
        this.DOMState.btnStartOver.setAttribute('class', 'btn btn_start_over');
        value = document.createTextNode('Начать заного');
        this.DOMState.btnStartOver.appendChild(value);
        this.DOMState.menu.appendChild(this.DOMState.btnStartOver);

        this.parent.appendChild(this.DOMState.menu);

        //        
        this.DOMState.fieldComputer = document.createElement('div');
        this.DOMState.fieldComputer.setAttribute('class', 'wrap_field field_computer');

        this.DOMState.fieldShipsComputer = document.createElement('div');
        this.DOMState.fieldShipsComputer.setAttribute('class', 'field field_ships_computer');
        this.DOMState.fieldComputer.appendChild(this.DOMState.fieldShipsComputer);
        this.parent.appendChild(this.DOMState.fieldComputer);
    }

    createPlacementInstruction = () => {
        let value = '';

        this.DOMState.placementInstruction = document.createElement('div');
        this.DOMState.placementInstruction.setAttribute('class', 'placement_instruction');
        //
        this.DOMState.typePlacement = document.createElement('div');
        this.DOMState.typePlacement.setAttribute('class', 'type-placement-box');
        value = document.createTextNode('1.');
        this.DOMState.typePlacement.appendChild(value);

        this.DOMState.btnRandom = document.createElement('span');
        this.DOMState.btnRandom.setAttribute('class', 'link');
        this.DOMState.btnRandom.dataset.target = 'random';
        value = document.createTextNode('Случайным образом');
        this.DOMState.btnRandom.appendChild(value);
        this.DOMState.typePlacement.appendChild(this.DOMState.btnRandom);

        const br = document.createElement('br');
        this.DOMState.typePlacement.appendChild(br);

        value = document.createTextNode('2.');
        this.DOMState.typePlacement.appendChild(value);

        this.DOMState.btnManually = document.createElement('span');
        this.DOMState.btnManually.setAttribute('class', 'link');
        this.DOMState.btnManually.dataset.target = 'manually';
        value = document.createTextNode('Методом перетаскивания.');
        this.DOMState.btnManually.appendChild(value);
        this.DOMState.typePlacement.appendChild(this.DOMState.btnManually);
        
        //
        this.DOMState.shipsCollection = document.createElement('div');
        this.DOMState.shipsCollection.setAttribute('class', 'ships_collection');

        const p = document.createElement('p');
        value = document.createTextNode('Перетащите мышкой корабли на игровое поле. Для установки корабля по вертикали, кликните по нему правой кнопкой мышки.');
        p.appendChild(value);
        this.DOMState.shipsCollection.appendChild(p);

        const ul = document.createElement('ul');
        ul.setAttribute('class', 'initial_ships');
        this.DOMState.shipsCollection.appendChild(ul);

        const firstLi = document.createElement('li');

        const fourdeckShip = document.createElement('div');
        fourdeckShip.setAttribute('class', 'ship fourdeck');
        fourdeckShip.setAttribute('id', 'fourdeck1');

        const tripledeckShip1 = document.createElement('div');
        tripledeckShip1.setAttribute('class', 'ship tripledeck tripledeck1');
        tripledeckShip1.setAttribute('id', 'tripledeck1');

        const tripledeckShip2 = document.createElement('div');
        tripledeckShip2.setAttribute('class', 'ship tripledeck tripledeck2');
        tripledeckShip2.setAttribute('id', 'tripledeck2');

        firstLi.appendChild(fourdeckShip);
        firstLi.appendChild(tripledeckShip1);
        firstLi.appendChild(tripledeckShip2);

        ul.appendChild(firstLi)

        const secondLi = document.createElement('li');

        const doubledeck1 = document.createElement('div');
        doubledeck1.setAttribute('class', 'ship doubledeck doubledeck1');
        doubledeck1.setAttribute('id', 'doubledeck1');

        const doubledeck2 = document.createElement('div');
        doubledeck2.setAttribute('class', 'ship doubledeck doubledeck2');
        doubledeck2.setAttribute('id', 'doubledeck2');

        const doubledeck3 = document.createElement('div');
        doubledeck3.setAttribute('class', 'ship doubledeck doubledeck3');
        doubledeck3.setAttribute('id', 'doubledeck3');

        secondLi.appendChild(doubledeck1);
        secondLi.appendChild(doubledeck2);
        secondLi.appendChild(doubledeck3);


        ul.appendChild(secondLi)

        const thirdLi = document.createElement('li');

        const singledeck1 = document.createElement('div');
        singledeck1.setAttribute('class', 'ship singledeck singledeck1');
        singledeck1.setAttribute('id', 'singledeck1');

        const singledeck2 = document.createElement('div');
        singledeck2.setAttribute('class', 'ship singledeck singledeck2');
        singledeck2.setAttribute('id', 'singledeck2');

        const singledeck3 = document.createElement('div');
        singledeck3.setAttribute('class', 'ship singledeck singledeck3');
        singledeck3.setAttribute('id', 'singledeck3');

        const singledeck4 = document.createElement('div');
        singledeck4.setAttribute('class', 'ship singledeck singledeck4');
        singledeck4.setAttribute('id', 'singledeck4');

        thirdLi.appendChild(singledeck1);
        thirdLi.appendChild(singledeck2);
        thirdLi.appendChild(singledeck3);
        thirdLi.appendChild(singledeck4);

        ul.appendChild(thirdLi)

        this.DOMState.placementInstruction.appendChild(this.DOMState.typePlacement);
        this.DOMState.placementInstruction.appendChild(this.DOMState.shipsCollection);
        this.parent.appendChild(this.DOMState.placementInstruction);

        this.DOMState.btnStartFight = document.createElement('button');
        this.DOMState.btnStartFight.setAttribute('class', 'btn btn_start_fight');
        value = document.createTextNode('Начать бой');
        this.DOMState.btnStartFight.appendChild(value);
        this.parent.appendChild(this.DOMState.btnStartFight);
    }
}