"use strict";

import { getCoordinates } from "./utils";
import { Ships } from "./ships";

export class Field {
    // размер стороны игрового поля в px
    static FIELD_SIDE = 0;
    // размер палубы корабля в px
    static SHIP_SIDE = 0;
    // объект с данными кораблей
    // ключём будет являться тип корабля, а значением - массив,
    // первый элемент которого указывает кол-во кораблей данного типа,
    // второй элемент указывает кол-во палуб у корабля данного типа
    static SHIP_DATA = {
        fourdeck: [1, 4],
        tripledeck: [2, 3],
        doubledeck: [3, 2],
        singledeck: [4, 1]
    };

    constructor(field) {
        // объект игрового поля, полученный в качестве аргумента
        this.field = field;
        // создаём пустой объект, куда будем заносить данные по каждому созданному кораблю
        // эскадры, подробно эти данные рассмотрим при создании объектов кораблей
        this.squadron = {};
        // двумерный массив, в который заносятся координаты кораблей, а в ходе морского
        // боя, координаты попаданий, промахов и заведомо пустых клеток
        this.matrix = [];
        // получаем координаты всех четырёх сторон рамки игрового поля относительно начала
        // document, с учётом возможной прокрутки по вертикали 
        let { left, right, top, bottom } = getCoordinates(this.field);
        this.fieldLeft = left;
        this.fieldRight = right;
        this.fieldTop = top;
        this.fieldBottom = bottom;
    }

    static createMatrix() {
        return [...Array(10)].map(() => Array(10).fill(0));
    }
    // n - максимальное значение, которое хотим получить
    static getRandom = n => Math.floor(Math.random() * (n + 1));

    setStaticConstant () {
        Field.FIELD_SIDE = this.field.offsetWidth;
        Field.SHIP_SIDE = Field.FIELD_SIDE / 10;
    }

    cleanField() {
        while (this.field.firstChild) {
            this.field.removeChild(this.field.firstChild);
        }
        this.squadron = {};
        this.matrix = Field.createMatrix();
    }

    randomLocationShips() {
        for (let type in Field.SHIP_DATA) {
            // кол-во кораблей данного типа
            let count = Field.SHIP_DATA[type][0];
            // кол-во палуб у корабля данного типа
            let decks = Field.SHIP_DATA[type][1];
            // прокручиваем кол-во кораблей
            for (let i = 0; i < count; i++) {
                // получаем координаты первой палубы и направление расположения палуб (корабля)
                let options = this.getCoordsDecks(decks);
                // кол-во палуб
                options.decks = decks;
                // имя корабля, понадобится в дальнейшем для его идентификации
                options.shipname = type + String(i + 1);
                // создаём экземпляр корабля со свойствами, указанными в
                // объекте options с помощью класса Ship
                const ship = new Ships(this, options);
                ship.createShip();
            }
        }
    }

    getCoordsDecks(decks) {
        // получаем коэффициенты определяющие направление расположения корабля
        // kx == 0 и ky == 1 — корабль расположен горизонтально,
        // kx == 1 и ky == 0 - вертикально.
        let kx = Field.getRandom(1), ky = (kx == 0) ? 1 : 0,
            x, y;

        // в зависимости от направления расположения, генерируем
        // начальные координаты
        if (kx == 0) {
            x = Field.getRandom(9); y = Field.getRandom(10 - decks);
        } else {
            x = Field.getRandom(10 - decks); y = Field.getRandom(9);
        }

        const obj = {x, y, kx, ky}
        // проверяем валидность координат всех палуб корабля
        const result = this.checkLocationShip(obj, decks);
        // если координаты невалидны, снова запускаем функцию
        if (!result) return this.getCoordsDecks(decks);
        return obj;
    }

    checkLocationShip(obj, decks) {
        let { x, y, kx, ky, fromX, toX, fromY, toY } = obj;

        // формируем индексы, ограничивающие двумерный массив по оси X (строки)
        // если координата 'x' равна нулю, то это значит, что палуба расположена в самой
        // верхней строке, т. е. примыкает к верхней границе и началом цикла будет строка
        // с индексом 0, в противном случае, нужно начать проверку со строки с индексом
        // на единицу меньшим, чем у исходной, т.е. находящейся выше исходной строки
        fromX = (x == 0) ? x : x - 1;
        // если условие истинно - это значит, что корабль расположен вертикально и его
        // последняя палуба примыкает к нижней границе игрового поля
        // поэтому координата 'x' последней палубы будет индексом конца цикла
        if (x + kx * decks == 10 && kx == 1) toX = x + kx * decks;
        // корабль расположен вертикально и между ним и нижней границей игрового поля
        // есть, как минимум, ещё одна строка, координата этой строки и будет
        // индексом конца цикла
        else if (x + kx * decks < 10 && kx == 1) toX = x + kx * decks + 1;
        // корабль расположен горизонтально вдоль нижней границы игрового поля
        else if (x == 9 && kx == 0) toX = x + 1;
        // корабль расположен горизонтально где-то по середине игрового поля
        else if (x < 9 && kx == 0) toX = x + 2;

        // формируем индексы начала и конца выборки по столбцам
        // принцип такой же, как и для строк
        fromY = (y == 0) ? y : y - 1;
        if (y + ky * decks == 10 && ky == 1) toY = y + ky * decks;
        else if (y + ky * decks < 10 && ky == 1) toY = y + ky * decks + 1;
        else if (y == 9 && ky == 0) toY = y + 1;
        else if (y < 9 && ky == 0) toY = y + 2;

        if (toX === undefined || toY === undefined) return false;

        // отфильтровываем ячейки, получившегося двумерного массива,
        // содержащие 1, если такие ячейки существуют - возвращаем false
        if (this.matrix.slice(fromX, toX)
            .filter(arr => arr.slice(fromY, toY).includes(1))
            .length > 0) return false;
        return true;
    }
}