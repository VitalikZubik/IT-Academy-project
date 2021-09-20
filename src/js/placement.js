"use strict";

import { Field } from "./field";
import { Ships } from "./ships";
import { getCoordinates } from "./utils";
import { human } from "../../index";
import { stateGame, stateDOM } from "../../index";

export class Placement {
    // объект с координатами стророн игрового поля
    static FRAME_COORDS 
    
    constructor(field) {
        this.field = field;
        
        Placement.FRAME_COORDS = getCoordinates(this.field);
        // объект перетаскивамого корабля
        this.dragObject = {};
        // флаг нажатия на левую кнопку мыши
        this.pressed = false;
    }

    static getShipName = el => el.getAttribute('id');

    static getCloneDecks = el => {
        const type = Placement.getShipName(el).slice(0, -1);
        return Field.SHIP_DATA[type][1];
    }

    setObserver() {
        if (stateGame.isHandlerPlacement) return;

        document.addEventListener('mousedown', this.onMouseDown.bind(this));
        document.addEventListener('mousemove', this.onMouseMove.bind(this));
        document.addEventListener('mouseup', this.onMouseUp.bind(this));
        
        this.field.addEventListener('contextmenu', this.rotationShip.bind(this));
        stateGame.isHandlerPlacement = true;
    }

    onMouseDown(e) {
        // если нажата не левая кнопка мыши или игра уже запущена
        if (e.which != 1 || stateGame.startGame) return;

        // проверяем, что нажатие произошло над кораблём
        const el = e.target.closest('.ship');
        if(!el) return;

        this.pressed = true;

        // переносимый объект и его свойства
        this.dragObject = {
            el,
            parent: el.parentElement,
            next: el.nextElementSibling,
            // координаты, с которых начат перенос
            downX: e.pageX,
            downY: e.pageY,
            // координаты 'left' и 'top' используются при редактировании
            // положения корабля на игровом поле
            left: el.offsetLeft,
            top: el.offsetTop,
            // горизонтальное положение корабля
            kx: 0,
            ky: 1
        };

        // редактируем положение корабля на игровом поле
        // проверяем, что корабль находится на поле игрока
        if (el.parentElement === stateDOM.getDOMState().fieldShipsHuman) {
            const name = Placement.getShipName(el);
            // запоминаем текущее направление расположения палуб
            this.dragObject.kx = human.squadron[name].kx;
            this.dragObject.ky = human.squadron[name].ky;
        }
    }

    onMouseMove(e) {
        if (!this.pressed || !this.dragObject.el) return;

        // получаем координаты сторон клона корабля
        let { left, right, top, bottom } = getCoordinates(this.dragObject.el);

        // если клона ещё не существует, создаём его
        if (!this.clone) {
            // получаем количество палуб у перемещаемого корабля
            this.decks = Placement.getCloneDecks(this.dragObject.el);
            // создаём клон, используя ранее полученные координаты его сторон
            this.clone = this.creatClone({left, right, top, bottom}) || null;
            // если по каким-то причинам клон создать не удалось, выходим из функции
            if (!this.clone) return;

            // вычисляем сдвиг курсора по координатам X и Y
            this.shiftX = this.dragObject.downX - left;
            this.shiftY = this.dragObject.downY - top;
            // z-index нужен для позиционирования клона над всеми элементами DOM
            this.clone.style.zIndex = '1000';
            // перемещаем клон в BODY
            document.body.appendChild(this.clone);

            // удаляем устаревший экземпляр корабля, если он существует
            // используется при редактировании положения корабля
            this.removeShipFromSquadron(this.clone);
        }

        // координаты клона относительно BODY с учётом сдвига курсора
        // относительно верней левой точки
        let currentLeft = Math.round(e.pageX - this.shiftX),
            currentTop = Math.round(e.pageY - this.shiftY);
        this.clone.style.left = `${currentLeft}px`;
        this.clone.style.top = `${currentTop}px`;

        // проверяем, что клон находится в пределах игрового поля, с учётом
        // небольших погрешностей (14px)
        if (left >= Placement.FRAME_COORDS.left - 14 && right <= Placement.FRAME_COORDS.right + 14 && top >= Placement.FRAME_COORDS.top - 14 && bottom <= Placement.FRAME_COORDS.bottom + 14) {
            // клон находится в пределах игрового поля,
            // подсвечиваем его контур зелёным цветом
            this.clone.classList.remove('unsuccess');
            this.clone.classList.add('success');

            const { x, y } = this.getCoordsCloneInMatrix({ left, right, top, bottom });
            const obj = {
                x,
                y,
                kx: this.dragObject.kx,
                ky: this.dragObject.ky
            };

            const result = human.checkLocationShip(obj, this.decks);
            if (!result) {
                // в соседних клетках находятся ранее установленные корабли,
                // подсвечиваем его контур красным цветом
                this.clone.classList.remove('success');
                this.clone.classList.add('unsuccess');
            }
        } else {
            // клон находится за пределами игрового поля,
            // подсвечиваем его контур красным цветом
            this.clone.classList.remove('success');
            this.clone.classList.add('unsuccess');
        }
    }

    onMouseUp(e) {
        this.pressed = false;
        // если клона не существует
        if (!this.clone) return;

        // если координаты клона невалидны, возвращаем его на место,
        // откуда был начат перенос
        if (this.clone.classList.contains('unsuccess')) {
            this.clone.classList.remove('unsuccess');
            this.clone.rollback();
        } else {
            // создаём экземпляр нового корабля, исходя
            // из окончательных координат клона 
            this.createShipAfterMoving();
        }

        // удаляем объекты 'clone' и 'dragObject'
        this.removeClone();
    }

    rotationShip(e) {
        // запрещаем появление контекстного меню
        e.preventDefault();
        if (e.which != 3 || stateGame.startGame) return;

        const el = e.target.closest('.ship');
        const name = Placement.getShipName(el);

        // нет смысла вращать однопалубный корабль
        if (human.squadron[name].decks == 1) return;

        // объект с текущими коэффициентами и координатами корабля
        const obj = {
            kx: (human.squadron[name].kx == 0) ? 1 : 0,
            ky: (human.squadron[name].ky == 0) ? 1 : 0,
            x: human.squadron[name].x,
            y: human.squadron[name].y
        };
        // очищаем данные о редактируемом корабле
        const decks = human.squadron[name].arrDecks.length;
        this.removeShipFromSquadron(el);
        human.field.removeChild(el);

        // проверяем валидность координат после поворота
        // если координаты не валидны, возвращаем старые коэффициенты
        // направления положения корабля
        const result = human.checkLocationShip(obj, decks);
        if(!result) {
            obj.kx = (obj.kx == 0) ? 1 : 0;
            obj.ky = (obj.ky == 0) ? 1 : 0;
        }

        // добавляем в объект свойства нового корабля
        obj.shipname = name;
        obj.decks = decks;

        // создаём экземпляр нового корабля
        const ship = new Ships(human, obj);
        ship.createShip();

        // кратковременно подсвечиваем рамку корабля красным цветом
        if (!result) {
            const el = document.getElementById(`${name}`);
            el.classList.add('unsuccess');
            setTimeout(() => { el.classList.remove('unsuccess') }, 750);
        }
    }

    creatClone() {
        const clone = this.dragObject.el;
        const oldPosition = this.dragObject;

        clone.rollback = () => {
            // редактиование положения корабля
            // получаем родительский элемент и
            // возвращаем корабль на исходное место на игровом поле
            if (oldPosition.parent == stateDOM.getDOMState().fieldShipsHuman) {
                clone.style.left = `${oldPosition.left}px`;
                clone.style.top = `${oldPosition.top}px`;
                clone.style.zIndex = '';
                oldPosition.parent.insertBefore(clone, oldPosition.next);
                this.createShipAfterMoving();
            } else {
                // возвращаем корабль в контейнер 'shipsCollection'
                clone.removeAttribute('style');
                oldPosition.parent.insertBefore(clone, oldPosition.next);
            }
        };
        return clone;
    }

    removeClone() {
        delete this.clone;
        this.dragObject = {};
    }

    createShipAfterMoving() {
        // получаем координаты, пересчитанные относительно игрового поля
        const coords = getCoordinates(this.clone);
        let { left, top, x, y } = this.getCoordsCloneInMatrix(coords);
        this.clone.style.left = `${left}px`;
        this.clone.style.top = `${top}px`;
        // переносим клон внутрь игрового поля
        stateDOM.getDOMState().fieldShipsHuman.appendChild(this.clone);
        this.clone.classList.remove('success');

        // создаём объект со свойствами нового корабля
        const options = {
            shipname: Placement.getShipName(this.clone),
            x,
            y,
            kx: this.dragObject.kx,
            ky: this.dragObject.ky,
            decks: this.decks
        };

        // создаём экземпляр нового корабля
        const ship = new Ships(human, options);
        ship.createShip();
        // теперь в игровом поле находится сам корабль, поэтому его клон удаляем из DOM
        stateDOM.getDOMState().fieldShipsHuman.removeChild(this.clone);
    }

    getCoordsCloneInMatrix({left, right, top, bottom} = coords) {
        // вычисляем разницу координат соотвествующих сторон
        // клона и игрового поля
        let computedLeft = left - Placement.FRAME_COORDS.left,
            computedRight = right - Placement.FRAME_COORDS.left,
            computedTop = top - Placement.FRAME_COORDS.top,
            computedBottom = bottom - Placement.FRAME_COORDS.top;

        // создаём объект, куда поместим итоговые значения
        const obj = {};

        // в результате выполнения условия, убираем неточности позиционирования клона
        let ft = (computedTop < 0) ? 0 : (computedBottom > Field.FIELD_SIDE) ? Field.FIELD_SIDE - Field.SHIP_SIDE : computedTop;
        let fl = (computedLeft < 0) ? 0 : (computedRight > Field.FIELD_SIDE) ? Field.FIELD_SIDE - Field.SHIP_SIDE * this.decks : computedLeft;

        obj.top = Math.round(ft / Field.SHIP_SIDE) * Field.SHIP_SIDE;
        obj.left = Math.round(fl / Field.SHIP_SIDE) * Field.SHIP_SIDE;
        // переводим значение в координатах матрицы
        obj.x = obj.top / Field.SHIP_SIDE;
        obj.y = obj.left / Field.SHIP_SIDE;

        return obj;
    }

    removeShipFromSquadron(el) {
        // имя редактируемого корабля
        const name = Placement.getShipName(el);
        // если корабля с таким именем не существует,
        // прекращаем работу функции
        if (!human.squadron[name]) return;

        // получаем массив с координатами палуб корабля и
        // записываем в него нули, что означает - пустое место
        const arr = human.squadron[name].arrDecks;
        for (let coords of arr) {
            const [x, y] = coords;
            human.matrix[x][y] = 0;
        }
        // удаляем всю информацию о корабле из массива эскадры
        delete human.squadron[name];
    }
}