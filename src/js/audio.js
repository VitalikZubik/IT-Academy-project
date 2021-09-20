"use strict";

export const iconSound = document.querySelector('.icon_sound');
const volumeMain = document.querySelector('.volume');
const stateOfSounds = {};

stateOfSounds.volumeMain = volumeMain.value;

stateOfSounds.main = new Audio('./src/audio/main.mp3');
stateOfSounds.main.loop = true;

stateOfSounds.splash = new Audio('./src/audio/splash.mp3');
stateOfSounds.explosion = new Audio('./src/audio/explosion.mp3');

const setVolumeMain = (e) => {
    stateOfSounds.volumeMain = e.target.value;
    stateOfSounds.main.volume = stateOfSounds.volumeMain;
    if(stateOfSounds.volumeMain === '0') {
        iconSound.style.backgroundImage = 'url(./src/img/off.png)';
        iconSound.classList.add('off'); 
    } else {
        iconSound.style.backgroundImage = 'url(./src/img/on.png)';
        iconSound.classList.remove('off'); 
    }
}

export const turnOnSound = () => {
    stateOfSounds.main.currentTime = 0; 
    stateOfSounds.main.play();
    stateOfSounds.play = true;
}

export const turnOffOrOnSound = (e) => {
    if (e.target.tagName === 'DIV') {
        if(stateOfSounds.play) {
            stateOfSounds.main.pause();
            iconSound.style.backgroundImage = 'url(./src/img/off.png)';
            iconSound.classList.add('off'); 
            stateOfSounds.play = false;
            volumeMain.value = '0'
        } else {
            stateOfSounds.main.play();
            iconSound.style.backgroundImage = 'url(./src/img/on.png)';
            iconSound.classList.remove('off'); 
            stateOfSounds.play = true;
            volumeMain.value = stateOfSounds.volumeMain
        }
    }
}

export const turnOnSplash = () => {
    stateOfSounds.splash.pause();
    stateOfSounds.splash.currentTime = 0;
    stateOfSounds.splash.play();
}

export const turnOnExplosion = () => {
    stateOfSounds.explosion.pause();
    stateOfSounds.explosion.currentTime = 0;
    stateOfSounds.explosion.play();
    setTimeout(() => {
        stateOfSounds.explosion.pause();
    }, 1500);
}

volumeMain.addEventListener('input', setVolumeMain)