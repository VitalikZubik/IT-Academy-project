"use strict";

import { human, computer } from "../../index";
import { Field } from "./field";

export class Ships {
    constructor(self, { x, y, kx, ky, decks, shipname }) {
        // с каким экземпляром работаем
        this.player = (self === human) ? human : computer;
        // this.player = self;
        // на каком поле создаётся данный корабль
        this.field = self.field;
        // уникальное имя корабля
        this.shipname = shipname;
        //количество палуб
        this.decks = decks;
        // координата X первой палубы
        this.x = x;
         // координата Y первой палубы
        this.y = y;
        // направлении расположения палуб
        this.kx = kx;
        this.ky = ky;
        // счётчик попаданий
        this.hits = 0;
        // массив с координатами палуб корабля, является элементом squadron
        this.arrDecks = [];
    }

    static showShip(self, shipname, x, y, kx) {
        // создаём новый элемент с указанным тегом
        const div = document.createElement('div');
        // из имени корабля убираем цифры и получаем имя класса
        const classname = shipname.slice(0, -1);
        // получаем имя класса в зависимости от направления расположения корабля
        let dir;
        if(classname !== 'singledeck'){
            dir = (kx == 1) ? ' vertical' : '';
        } else (
            dir = ''
        )
        

        // устанавливаем уникальный идентификатор для корабля
        div.setAttribute('id', shipname);
        // собираем в одну строку все классы 
        div.className = `ship ${classname}${dir}`;
        // через атрибут 'style' задаём позиционирование кораблю относительно
        // его родительского элемента
        // смещение вычисляется путём умножения координаты первой палубы на
        // размер клетки игрового поля, этот размер совпадает с размером палубы
        div.style.cssText = `left:${y * Field.SHIP_SIDE}px; top:${x * Field.SHIP_SIDE}px;`;
        self.field.appendChild(div);
        if (dir === ' vertical') {
            div.style.transform = 'rotate(90deg)';
            div.style.transformOrigin = `${Field.SHIP_SIDE / 2}px ${Field.SHIP_SIDE / 2}px`;
        }
    }

    createShip() {
        let { player, field, shipname, decks, x, y, kx, ky, hits, arrDecks, k = 0 } = this;

        while (k < decks) {
            // записываем координаты корабля в двумерный массив игрового поля
            // теперь наглядно должно быть видно, зачем мы создавали два
            // коэффициента направления палуб
            // если коэффициент равен 1, то соответствующая координата будет
            // увеличиваться при каждой итерации
            // если равен нулю, то координата будет оставаться неизменной
            // таким способом мы очень сократили и унифицировали код
            let i = x + k * kx, j = y + k * ky;

            // значение 1, записанное в ячейку двумерного массива, говорит о том, что
            // по данным координатам находится палуба некого корабля
            player.matrix[i][j] = 1;
            // записываем координаты палубы
            arrDecks.push([i, j]);
            k++;
        }

        // заносим информацию о созданном корабле в объект эскадры
        player.squadron[shipname] = {arrDecks, hits, x, y, kx, ky};
        // если корабль создан для игрока, выводим его на экран
        if (player === human) {
            Ships.showShip(human, shipname, x, y, kx);
            // когда количество кораблей в эскадре достигнет 10, т.е. все корабли
            // сгенерированны, то можно показать кнопку запуска игры
            if (Object.keys(player.squadron).length == 10) {
                // buttonPlay.hidden = false;
                document.querySelector('.btn_start_fight').classList.remove('hide');
            }
        }
    }
}