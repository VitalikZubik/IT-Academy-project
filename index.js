'use strict'
import { Field } from './src/js/field';
import { DOM } from './src/js/dom';
import { isWelcome, Routing } from './src/js/routing';
import { Placement } from './src/js/placement';
import { BattleController } from './src/js/battle-controller';
import { iconSound, turnOffOrOnSound, turnOnSound } from './src/js/audio';

export const stateDOM = new DOM(document.querySelector('.container'));
stateDOM.init();

export const stateGame = {
    isHandlerPlacement: false,
    isHandlerController: false,
    startGame: false,
    compShot: false,
    control: null,
    isWelcome: false,
    shotTime: 25,
    timer: null,
    title: stateDOM.getDOMState().header.querySelector('h1')
}

export const human = new Field(stateDOM.getDOMState().fieldShipsHuman);
export let computer = {};
human.setStaticConstant();

const shipsCollection = stateDOM.getDOMState().shipsCollection;

stateDOM.getDOMState().typePlacement.addEventListener('click', function(e) {
    // используем делегирование основанное на всплытии событий
    if (e.target.tagName != 'SPAN') return;

    // если мы уже создали эскадру ранее, то видна кнопка начала игры
    // скроем её на время повторной расстановки кораблей
    document.querySelector('.btn_start_fight').classList.add('hide');
    // очищаем игровое поле игрока перед повторной расстановкой кораблей
    human.cleanField();

    // способ расстановки кораблей на игровом поле
    const type = e.target.dataset.target;
    // создаём литеральный объект typeGeneration
    // каждому свойству литерального объекта соответствует функция
    // в которой вызывается рандомная или ручная расстановка кораблей
    const typeGeneration = {
        random() {
            // вызов ф-ии рандомно расставляющей корабли для экземпляра игрока
            human.randomLocationShips();
        },
        manually() {
            
        }
    };
    // вызов функции литерального объекта в зависимости
    // от способа расстановки кораблей
    typeGeneration[type]();

    // создаём экземпляр класса, отвечающего за перетаскивание
    // и редактирование положения кораблей
    const placement = new Placement(stateDOM.getDOMState().fieldShipsHuman);
    // устанавливаем обработчики событий
    placement.setObserver();
});

stateDOM.getDOMState().btnStartFight.addEventListener('click', () => {
    // скрываем не нужные для игры элементы
    stateDOM.getDOMState().btnStartFight.hidden = true;

    // показываем игровое поле компьютера
    stateDOM.getDOMState().fieldShipsComputer.parentElement.hidden = false;

    // создаём экземпляр игрового поля компьютера
    computer = new Field(stateDOM.getDOMState().fieldShipsComputer);

    // очищаем поле от ранее установленных кораблей
    computer.cleanField();
    computer.randomLocationShips();

    // устанавливаем флаг запуска игры
    stateGame.startGame = true;

    // создаём экземпляр контроллера, управляющего игрой
    if (!stateGame.control) stateGame.control = new BattleController();
    // запускаем игру
    stateGame.control.init();
});

stateDOM.getDOMState().btnStartOver.addEventListener('click', function(e) {
    // скрываем кнопку перезапуска игры
    stateDOM.getDOMState().btnStartOver.classList.add('hide');
    // скрываем игровое поле компьютера
    stateDOM.getDOMState().fieldShipsComputer.parentElement.hidden = true;

    // очищаем поле игрока
    human.cleanField();
    BattleController.SERVICE_TEXT.innerHTML = '';

    // устанавливаем флаги в исходное состояние
    stateGame.startGame = false;
    stateGame.compShot = false;

    // обнуляем массивы с координатами выстрела
    stateGame.control.coordsRandomHit = [];
    stateGame.control.coordsFixedHit = [];
    stateGame.control.coordsAroundHit = [];
    // сбрасываем значения объекта tempShip
    stateGame.control.resetTempShip();
});

iconSound.addEventListener('click', turnOffOrOnSound);

const onWindowWelcome = () => {
    document.querySelector('.window_welcome').classList.add('hide');
    document.querySelector('.main_menu').classList.remove('hide');
    document.querySelector('.menu').classList.add('hide');
    document.querySelectorAll('.wrap_field').forEach(elem=>elem.classList.add('hide'))
    document.querySelector('.placement_instruction').classList.add('hide');
    document.querySelector('.btn_start_fight').classList.add('hide');
    document.querySelector('.btn_exit').classList.add('hide');
    document.querySelector('.btn_entry').classList.add('hide');
    document.querySelector('.btn_continue').classList.add('hide');
    document.querySelector('.icon_sound').classList.remove('hide');
    stateGame.title.innerHTML = 'Морской бой';

    stateDOM.getDOMState().windowWelcome.removeEventListener('click', onWindowWelcome);

    turnOnSound ();
    stateGame.isWelcome = true;
}

stateDOM.getDOMState().windowWelcome.addEventListener('click', onWindowWelcome);

const routing = new Routing(stateDOM.getDOMState());
routing.switchToStateFromURLHash();
routing.setObserver();