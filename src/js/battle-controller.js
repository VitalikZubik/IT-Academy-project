"use strict";

import { Field } from './field';
import { Ships } from './ships';
import { human, computer, stateGame, stateDOM } from '../../index';
import { turnOnExplosion, turnOnSplash } from './audio';

export class BattleController {
    // массив базовых координат для формирования coordsFixedHit
    static START_POINTS = [
        [ [6,0], [2,0], [0,2], [0,6] ],
        [ [3,0], [7,0], [9,2], [9,6] ]
    ];
    // Блок, в который выводятся информационные сообщения по ходу игры
    static SERVICE_TEXT;

    constructor() {
        this.player = '';
        this.opponent = '';
        this.text = '';
        // массив с координатами выстрелов при рандомном выборе
        this.coordsRandomHit = [];
        // массив с заранее вычисленными координатами выстрелов
        this.coordsFixedHit = [];
        // массив с координатами вокруг клетки с попаданием
        this.coordsAroundHit = [];
        // временный объект корабля, куда будем заносить координаты
        // попаданий, расположение корабля, количество попаданий
        this.resetTempShip();
        this.setServiceText();
    }

    // вывод информационных сообщений
    static showServiceText = text => {
        BattleController.SERVICE_TEXT.innerHTML = text;
    }

    // преобразование абсолютных координат иконок в координаты матрицы
    static getCoordsIcon = el => {
        const x = el.style.top.slice(0, -2) / Field.SHIP_SIDE;
        const y = el.style.left.slice(0, -2) / Field.SHIP_SIDE;
        return [x, y];
    }

    // удаление ненужных координат из массива
    static removeElementArray = (arr, [x, y]) => {
        return arr.filter(item => item[0] != x || item[1] != y);
    }

    setServiceText() {
        BattleController.SERVICE_TEXT = stateDOM.getDOMState().header.querySelector('p');
    }

    init() {
        // Рандомно выбираем игрока и его противника
        const random = Field.getRandom(1);
        this.player = (random == 0) ? human : computer;
        this.opponent = (this.player === human) ? computer : human;

        // генерируем координаты выстрелов компьютера и заносим их в
        // массивы coordsRandomHit и coordsFixedHit
        this.setCoordsShot();

        // обработчики события для игрока
        if (!stateGame.isHandlerController) {
            //выстрел игрока
            stateDOM.getDOMState().fieldShipsComputer.addEventListener('click', this.makeShot.bind(this));
            // устанавливаем маркер на заведомо пустую клетку
            stateDOM.getDOMState().fieldShipsComputer.addEventListener('contextmenu', this.setUselessCell.bind(this));
            stateGame.isHandlerController = true;
        }

        if (this.player === human) {
            stateGame.compShot = false;
            this.text = 'Вы стреляете первым';

        } else {
            stateGame.compShot = true;
            this.text = 'Первым стреляет компьютер';
            // выстрел компьютера
            setTimeout(() => this.makeShot(), 2000);
        }
        BattleController.showServiceText(this.text);
    }

    setCoordsShot() {
        // получаем координаты каждой клетки игрового поля
        // и записываем их в массив
        for (let i = 0; i < 10; i++) {
            for(let j = 0; j < 10; j++) {
                this.coordsRandomHit.push([i, j]);
            }
        }
        // рандомно перемешиваем массив с координатами
        this.coordsRandomHit.sort((a, b) => Math.random() - 0.5);

        let x, y;

        // получаем координаты для обстрела по диагонали вправо-вниз
        for (let arr of BattleController.START_POINTS[0]) {
            x = arr[0]; y = arr[1];
            while (x <= 9 && y <= 9) {
                this.coordsFixedHit.push([x, y]);
                x = (x <= 9) ? x : 9;
                y = (y <= 9) ? y : 9;
                x++; y++;
            }
        }

        // получаем координаты для обстрела по диагонали вправо-вверх
        for (let arr of BattleController.START_POINTS[1]) {
            x = arr[0]; y = arr[1];
            while(x >= 0 && x <= 9 && y <= 9) {
                this.coordsFixedHit.push([x, y]);
                x = (x >= 0 && x <= 9) ? x : (x < 0) ? 0 : 9;
                y = (y <= 9) ? y : 9;
                x--; y++;
            };
        }
        // изменим порядок следования элементов на обратный,
        // чтобы обстрел происходил в очерёдности согласно рисунка
        this.coordsFixedHit = this.coordsFixedHit.reverse();
    }

    setCoordsAroundHit(x, y, coords) {
        let {firstHit, kx, ky} = this.tempShip;

        // массив пустой, значит это первое попадание в данный корабль
        if (firstHit.length == 0) {
            this.tempShip.firstHit = [x, y];
        // второе попадание, т.к. оба коэффициента равны 0
        } else if (kx == 0 && ky == 0) {
            // зная координаты первого и второго попадания,
            // можно вычислить направление расположение корабля
            this.tempShip.kx = (Math.abs(firstHit[0] - x) == 1) ? 1 : 0;
            this.tempShip.ky = (Math.abs(firstHit[1] - y) == 1) ? 1 : 0;
        }

        // проверяем корректность полученных координат обстрела
        for (let coord of coords) {
            x = coord[0]; y = coord[1];
            // координаты за пределами игрового поля
            if (x < 0 || x > 9 || y < 0 || y > 9) continue;
            // по данным координатам установлен промах или маркер пустой клетки
            if (human.matrix[x][y] != 0 && human.matrix[x][y] != 1) continue;
            // валидные координаты добавляем в массив
            this.coordsAroundHit.push([x, y]);
        }
    }

    isShipSunk() {
        // max кол-во палуб у оставшихся кораблей
        let obj = Object.values(human.squadron)
            .reduce((a, b) => a.arrDecks.length > b.arrDecks.length ? a : b);
        // определяем, есть ли ещё корабли, с кол-вом палуб больше, чем попаданий
        if (this.tempShip.hits >= obj.arrDecks.length || this.coordsAroundHit.length == 0) {
            // корабль потоплен, отмечаем useless cell вокруг него
            this.markUselessCellAroundShip();
            // очищаем массив coordsAroundHit и объект resetTempShip для
            // обстрела следующего корабля
            this.coordsAroundHit = [];
            this.resetTempShip();
        }
    }

    setUselessCell(e) {
        e.preventDefault();
        // проверяем нажатие правой кнопки мыши и флага, блокирующего
        // действия игрока
        if (e.which != 3 || stateGame.compShot) return;

        // преобразуем координаты клика относительно окна браузера, в кординаты матрицы
        const coords = this.transformCoordsInMatrix(e, computer);
        // проверяем наличие иконок по полученным координатам
        // если иконка присутствует, то, в зависимости от типа, удаляем её или
        // кратковременно подсвечиваем красным цветом
        const check = this.checkUselessCell(coords);
        // если по данным координатам иконки отсутствуют, устанавливаем маркер
        // пустой клетки
        if (check) {
            this.showIcons(this.opponent, coords, 'buoy');
        }
    }

    checkUselessCell(coords) {
        // данная строчка кода используется при установке маркера игроком
        // если значение матрицы по полученным координатам отлично от нуля,
        // считаем, что в этом месте уже установлена некая иконка  
        if (computer.matrix[coords[0]][coords[1]] > 1) return false;

        // получаем коллекцию маркеров на игровом поле противника
        const icons = this.opponent.field.querySelectorAll('.buoy');
        if (icons.length == 0) return true;

        for (let icon of icons) {
            // получаем координаты иконки и сравниваем их с аргументом функции
            const [x, y] = BattleController.getCoordsIcon(icon);
            if (coords[0] == x && coords[1] == y) {
                // если координаты иконки и координаты полученные в аргументе совпали,
                // проверяем, какая функция вызвала функцию checkUselessCell
                const f = (new Error()).stack.split('\n')[2].trim().split(' ')[1];
                if (f == 'BattleController.setUselessCell') {
                    // удаляем маркер пустой клетки
                    icon.remove();
                } 
                return false;
            }
        }
        return true;
    }

    // устанавливаем маркеры вокруг корабля при попадании
    markUselessCell(coords) {
        let n = 1, x, y;

        for (let coord of coords) {
            x = coord[0]; y = coord[1];
            // координаты за пределами игрового поля
            if (x < 0 || x > 9 || y < 0 || y > 9) continue;
            // по этим координатам в матрице уже прописан промах или маркер пустой клетки
            if (human.matrix[x][y] == 2 || human.matrix[x][y] == 3) continue;
            // прописываем значение, соответствующее маркеру пустой клетки
            human.matrix[x][y] = 2;
            // вывоим маркеры пустых клеток по полученным координатам
            // для того, чтобы маркеры выводились поочерёдно, при каждой итерации
            // увеличиваем задержку перед выводом маркера
            setTimeout(() => this.showIcons(human, coord, 'buoy'), 350 * n);
            // удаляем полученные координаты из всех массивов
            this.removeCoordsFromArrays(coord);
            n++;
        }
    }

    transformCoordsInMatrix(e, self) {
        const x = Math.trunc((e.pageY - self.fieldTop) / Field.SHIP_SIDE);
        const y = Math.trunc((e.pageX - self.fieldLeft) / Field.SHIP_SIDE);
        return [x, y];
    }

    removeCoordsFromArrays(coords) {
        if (this.coordsAroundHit.length > 0) {
            this.coordsAroundHit = BattleController.removeElementArray(this.coordsAroundHit, coords);
        }
        if (this.coordsFixedHit.length > 0) {
            this.coordsFixedHit = BattleController.removeElementArray(this.coordsFixedHit, coords);
        }
        this.coordsRandomHit = BattleController.removeElementArray(this.coordsRandomHit, coords);
    }

    // устанавливаем маркеры после уничтожения корабля
    markUselessCellAroundShip(){
        // присваиваем переменным соответствующие значения из объекта tempShip
        const {hits, kx, ky, x0, y0} = this.tempShip;
        let coords;

        // рассчитываем координаты пустых клеток
        // однопалубный корабль
        if (this.tempShip.hits == 1) {
            coords = [
                // верхняя
                [x0 - 1, y0],
                // нижняя
                [x0 + 1, y0],
                // левая
                [x0, y0 - 1],
                // правая
                [x0, y0 + 1]
            ];
        // многопалубный корабль
        } else {
            coords = [
                // левая / верхняя
                [x0 - kx, y0 - ky],
                // правая / нижняя
                [x0 + kx * hits, y0 + ky * hits]
            ];
        }
        this.markUselessCell(coords);
    }

    showIcons(opponent, [x, y], iconClass) {
        // экземпляр игрового поля на котором будет размещена иконка
        const field = opponent.field;
        // небольшая задержка при формировании иконок промаха и попадания
        if (iconClass === 'dot' || iconClass === 'red-cross') {
            setTimeout(() => fn(), 400);
        } else {
            fn();
        }
        function fn() {
            // создание элемента и добавление ему класса и стилей
            const span = document.createElement('span');
            span.className = `icon-field ${iconClass}`;
            span.style.cssText = `
                left:${y * Field.SHIP_SIDE}px; 
                top:${x * Field.SHIP_SIDE}px; 
                width:${Field.SHIP_SIDE}px; 
                height:${Field.SHIP_SIDE}px; 
            `;

            // размещаем иконку на игровом поле
            field.appendChild(span);
        }
    }

    showExplosion (x, y) {
        this.showIcons(this.opponent, [x, y], 'splash');
        const explosion = this.opponent.field.querySelector('.splash');
        explosion.classList.add('active');
        setTimeout(() => explosion.remove(), 430);
    }

    showAnimation (x, y, animation) {
        this.showIcons(this.opponent, [x, y], `${animation}`);
        const explosion = this.opponent.field.querySelector(`.${animation}`);
        explosion.classList.add('active');
        setTimeout(() => explosion.remove(), 430);
    }

    getCoordsForShot() {
        const coords = (this.coordsAroundHit.length > 0) ? this.coordsAroundHit.pop() : (this.coordsFixedHit.length > 0) ? this.coordsFixedHit.pop() : this.coordsRandomHit.pop();			
        // удаляем полученные координаты из всех массивов
        this.removeCoordsFromArrays(coords);
        return coords;
    }

    resetTempShip() {
        this.tempShip = {
            hits: 0,
            firstHit: [],
            kx: 0,
            ky: 0
        };
    }

    makeShot(e) {
        let x, y;
        // если событие существует, значит выстрел сделан игроком
        if (e !== undefined) {
            // если клик не левой кнопкой мыши или установлен флаг compShot,
            // что значит, должен стрелять компьютер
            if (e.which != 1 || stateGame.compShot) return;
            // координаты выстрела в системе координат матрицы
            ([x, y] = this.transformCoordsInMatrix(e, this.opponent));

            // проверяем наличие иконки 'shaded-cell' по полученым координатам
            const check = this.checkUselessCell([x, y]);
            if (!check) return;
        } else {
            // получаем координаты для выстрела компьютера
            ([x, y] = this.getCoordsForShot());
        }

        // показываем и удаляем иконку выстрела
        // this.showExplosion(x, y);

        const v	= this.opponent.matrix[x][y];
        switch(v) {
            case 0: // промах
                turnOnSplash();
                this.showAnimation(x,y,'splash');
                this.miss(x, y);
                break;
            case 1: // попадание
                turnOnExplosion();
                this.showAnimation(x,y,'explosion');
                this.hit(x, y);
                break;
            case 3: // повторный обстрел
            case 4:
                BattleController.showServiceText('По этим координатам вы уже стреляли!');
                break;
        }
    }

    miss(x, y) {
        let text = '';
        // устанавливаем иконку промаха и записываем промах в матрицу
        this.showIcons(this.opponent, [x, y], 'dot');
        this.opponent.matrix[x][y] = 3;

        // определяем статус игроков
        if (this.player === human) {
            text = 'Вы промахнулись. Стреляет компьютер.';
            this.player = computer;
            this.opponent = human;
            stateGame.compShot = true;
            setTimeout(() => this.makeShot(), 2000);
        } else {
            text = 'Компьютер промахнулся. Ваш выстрел.';

            // обстреляны все возможные клетки для данного корабля
            if (this.coordsAroundHit.length == 0 && this.tempShip.hits > 0) {
                // корабль потоплен, отмечаем useless cell вокруг него
                this.markUselessCellAroundShip();
                this.resetTempShip();
            }
            this.player = human;
            this.opponent = computer;
            stateGame.compShot = false;
        }
        setTimeout(() => BattleController.showServiceText(text), 400);
    }

    hit(x, y) {
        let text = '';
        // устанавливаем иконку попадания и записываем попадание в матрицу
        this.showIcons(this.opponent, [x, y], 'red-cross');
        this.opponent.matrix[x][y] = 4;
        // выводим текст, зависящий от стреляющего
        text = (this.player === human) ? 'Поздравляем! Вы попали. Ваш выстрел.' : 'Компьютер попал в ваш корабль. Выстрел компьютера';
        setTimeout(() => BattleController.showServiceText(text), 400);

        // перебираем корабли эскадры противника
        outerloop:
        for (let name in this.opponent.squadron) {
            const dataShip = this.opponent.squadron[name];
            for (let value of dataShip.arrDecks) {
                // перебираем координаты палуб и сравниваем с координатами попадания
                // если координаты не совпадают, переходим к следующей итерации
                if (value[0] != x || value[1] != y) continue;
                dataShip.hits++;
                if (dataShip.hits < dataShip.arrDecks.length) break outerloop;
                // код для выстрела компьютера: сохраняем координаты первой палубы
                if (this.opponent === human) {
                    this.tempShip.x0 = dataShip.x;
                    this.tempShip.y0 = dataShip.y;
                }
                // если количество попаданий в корабль равно количеству палуб,
                // удаляем данный корабль из массива эскадры
                delete this.opponent.squadron[name];
                break outerloop;
            }
        }

        // все корабли эскадры уничтожены
        if (Object.keys(this.opponent.squadron).length == 0) {
            if (this.opponent === human) {
                text = 'К сожалению, вы проиграли.';
                // показываем оставшиеся корабли компьютера
                for (let name in computer.squadron) {
                    const dataShip = computer.squadron[name];
                    Ships.showShip(computer, name, dataShip.x, dataShip.y, dataShip.kx );
                }
            } else {
                text = 'Поздравляем! Вы выиграли!';
            }
            BattleController.showServiceText(text);
            // показываем кнопку продолжения игры
            // buttonNewGame.hidden = false;
            stateDOM.getDOMState().btnStartOver.classList.remove('hide');
        // бой продолжается
        } else if (this.opponent === human) {
            let coords;
            this.tempShip.hits++;

            // отмечаем клетки по диагонали, где точно не может стоять корабль
            coords = [
                [x - 1, y - 1],
                [x - 1, y + 1],
                [x + 1, y - 1],
                [x + 1, y + 1]
            ];
            this.markUselessCell(coords);

            // формируем координаты обстрела вокруг попадания
            coords = [
                [x - 1, y],
                [x + 1, y],
                [x, y - 1],
                [x, y + 1]
            ];
            this.setCoordsAroundHit(x, y, coords);

            // проверяем, потоплен ли корабль, в который было попадание
            this.isShipSunk();

            // после небольшой задержки, компьютер делает новый выстрел
            setTimeout(() => this.makeShot(), 2000);
        }
    }
}