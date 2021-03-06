"use strict";
import { stateGame, stateDOM, human } from "../../index";

export class Routing {
    constructor ({btnEntry,btnPlay,btnInstruction,btnExit,btnMain,btnStartOver,btnRandom,btnManually,btnStartFight,btnContinue}) {
        this.btnEntry = btnEntry;
        this.btnPlay = btnPlay;
        this.btnInstruction = btnInstruction;
        this.btnExit = btnExit;
        this.btnMain = btnMain;
        this.btnStartOver = btnStartOver;
        this.btnRandom = btnRandom;
        this.btnManually = btnManually;
        this.btnStartFight = btnStartFight;
        this.btnContinue = btnContinue;
        this.SPAState = {};
    }

    setObserver () {
        window.addEventListener('hashchange', this.switchToStateFromURLHash);
        this.btnPlay.addEventListener('click', this.switchToGamePage);
        this.btnMain.addEventListener('click', this.switchToMainPage);
        this.btnRandom.addEventListener('click', this.switchToGamePageRandom);
        this.btnManually.addEventListener('click', this.switchToGamePageManually);
        this.btnStartFight.addEventListener('click', this.switchToGamePageFight);
        this.btnContinue.addEventListener('click', this.switchToGamePageFight);
        this.btnStartOver.addEventListener('click', this.switchToGamePage);
        this.btnEntry.addEventListener('click', this.switchToLoginPage);
        this.btnExit.addEventListener('click', () => {
            stateGame.isLogin = false;
            // очищаем поле игрока
            human.cleanField();
            stateDOM.getDOMState().header.querySelector('p').innerHTML = '';
            document.querySelector('.name_user').innerHTML = '';
            // устанавливаем флаги в исходное состояние
            stateGame.startGame = false;
            stateGame.compShot = false;

           if (stateGame.control) {
                // обнуляем массивы с координатами выстрела
            stateGame.control.coordsRandomHit = [];
            stateGame.control.coordsFixedHit = [];
            stateGame.control.coordsAroundHit = [];
            // сбрасываем значения объекта tempShip
            stateGame.control.resetTempShip();
           }

            this.switchToStateFromURLHash();
        });
    }

    switchToStateFromURLHash = () => {
        const URLHash = window.location.hash;
        
        // убираем из закладки УРЛа решётку
        const stateStr = URLHash.substr(1);
        
        if ( stateStr!="" ) { // если закладка непустая, читаем из неё состояние и отображаем
            this.SPAState = { pagename: stateStr };
        } else {
            this.SPAState = {pagename:'Main'}; // иначе показываем главную страницу
            this.switchToState(this.SPAState.pagename)
        }
        // обновляем вариабельную часть страницы под текущее состояние
        switch ( this.SPAState.pagename ) {
            case 'Main':
                if (stateGame.isWelcome) {
                    stateDOM.getDOMState().mainMenu.classList.remove('hide');
                    stateDOM.getDOMState().menu.classList.add('hide');
                    stateDOM.getDOMState().placementInstruction.classList.add('hide');
                    stateDOM.getDOMState().wrapAuthorization.classList.add('hide');

                    this.btnStartFight.classList.add('hide');
                    this.btnExit.classList.add('hide');
                    this.btnEntry.classList.add('hide');

                    document.querySelectorAll('.wrap_field').forEach(elem=>elem.classList.add('hide'));

                    if(stateGame.startGame) {
                        this.btnContinue.classList.remove('hide');
                        this.btnPlay.classList.add('hide');
                    } else {
                        this.btnContinue.classList.add('hide');
                        this.btnPlay.classList.remove('hide');
                    }

                    if (stateGame.isLogin) {
                        this.btnExit.classList.remove('hide');
                        this.btnEntry.classList.add('hide');
                    } else {
                        this.btnExit.classList.add('hide');
                        this.btnEntry.classList.remove('hide');
                        this.btnPlay.classList.add('hide');
                        this.btnContinue.classList.add('hide');
                    }

                    stateGame.title.innerHTML = 'Морской бой';
                } else {
                    stateDOM.getDOMState().mainMenu.classList.add('hide');
                    stateDOM.getDOMState().menu.classList.add('hide');
                    stateDOM.getDOMState().placementInstruction.classList.add('hide');
                    stateDOM.getDOMState().wrapAuthorization.classList.add('hide');

                    this.btnStartFight.classList.add('hide');

                    document.querySelector('.icon_sound').classList.add('hide');
                    document.querySelectorAll('.wrap_field').forEach(elem=>elem.classList.add('hide'));
                    document.querySelector('.name_user').classList.add('hide');
                }
                break;

            case 'Game':
                stateDOM.getDOMState().mainMenu.classList.add('hide');
                stateDOM.getDOMState().menu.classList.add('hide');
                stateDOM.getDOMState().shipsCollection.classList.add('hide');
                stateDOM.getDOMState().placementInstruction.classList.remove('hide');
                stateDOM.getDOMState().fieldComputer.hidden = true;
                stateDOM.getDOMState().wrapAuthorization.classList.add('hide');
                document.querySelector('.window_welcome').classList.add('hide');

                this.btnStartOver.classList.add('hide');
                this.btnStartFight.classList.add('hide');

                document.querySelectorAll('.wrap_field').forEach(elem=>elem.classList.remove('hide'));
                stateGame.title.innerHTML = 'Расстановка кораблей';
                break;

            case 'Game_manually':
                stateDOM.getDOMState().shipsCollection.classList.remove('hide');
                stateDOM.getDOMState().mainMenu.classList.add('hide');
                stateDOM.getDOMState().menu.classList.add('hide');
                stateDOM.getDOMState().fieldComputer.hidden = true;
                stateDOM.getDOMState().wrapAuthorization.classList.add('hide');
                document.querySelector('.window_welcome').classList.add('hide');

                this.btnStartOver.classList.add('hide');
                this.btnStartFight.classList.add('hide');

                document.querySelectorAll('.wrap_field').forEach(elem=>elem.classList.remove('hide'));
                stateGame.title.innerHTML = 'Расстановка кораблей';
                break;

            case 'Game_random':
                stateDOM.getDOMState().mainMenu.classList.add('hide');
                stateDOM.getDOMState().menu.classList.add('hide');
                stateDOM.getDOMState().shipsCollection.classList.add('hide');
                stateDOM.getDOMState().placementInstruction.classList.remove('hide');
                stateDOM.getDOMState().fieldComputer.hidden = true;
                stateDOM.getDOMState().wrapAuthorization.classList.add('hide');
                document.querySelector('.window_welcome').classList.add('hide');

                this.btnStartOver.classList.add('hide');
                this.btnStartFight.classList.remove('hide');

                document.querySelectorAll('.wrap_field').forEach(elem=>elem.classList.remove('hide'));
                stateGame.title.innerHTML = 'Расстановка кораблей';
                break;

            case 'Game_fight':
                stateDOM.getDOMState().mainMenu.classList.add('hide');
                stateDOM.getDOMState().menu.classList.remove('hide');
                stateDOM.getDOMState().placementInstruction.classList.add('hide');
                stateDOM.getDOMState().fieldComputer.hidden = false;
                stateDOM.getDOMState().wrapAuthorization.classList.add('hide');
                document.querySelector('.window_welcome').classList.add('hide');

                this.btnStartFight.classList.add('hide');
                this.btnStartOver.classList.add('hide');

                document.querySelectorAll('.wrap_field').forEach(elem=>elem.classList.remove('hide'));
                stateGame.title.innerHTML = 'Морской бой между эскадрами';                
                break;
            case 'Login':
                stateDOM.getDOMState().mainMenu.classList.add('hide');
                stateDOM.getDOMState().menu.classList.add('hide');
                stateDOM.getDOMState().placementInstruction.classList.add('hide');
                stateDOM.getDOMState().fieldComputer.hidden = true;
                stateDOM.getDOMState().wrapAuthorization.classList.remove('hide');
                stateDOM.getDOMState().btnEntryLogin.classList.add('active_btn');
                document.querySelector('.window_welcome').classList.add('hide');

                this.btnStartFight.classList.add('hide');
                this.btnStartOver.classList.add('hide');

                document.querySelector('.wrap_input_name').classList.add('hide');
                document.querySelectorAll('.wrap_field').forEach(elem=>elem.classList.add('hide'));

                stateGame.title.innerHTML = 'Введите email для входа.';
                stateDOM.getDOMState().btnSubmit.innerHTML = 'Войти';               
                break;
        }        
    }

    switchToState = (newState) => {
        // устанавливаем закладку УРЛа
        let stateStr = '';
        if (typeof newState === 'string') {
            stateStr = newState;
        } else {
            stateStr = newState.pagename;
        }        
        
        location.hash = stateStr;
    }

    switchToMainPage = () => {
        this.switchToState( { pagename:'Main' } );
    }
      
    switchToGamePage = () => {
        this.switchToState( { pagename:'Game' } );
    }

    switchToGamePageManually = () => {
        this.switchToState( { pagename:'Game_manually' } );
    }

    switchToGamePageRandom = () => {
        this.switchToState( { pagename:'Game_random' } );
    }

    switchToGamePageFight = () => {
        this.switchToState( { pagename:'Game_fight' } );
    }

    switchToLoginPage = () => {
        this.switchToState( { pagename:'Login' } );
    }
}

