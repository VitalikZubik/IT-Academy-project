import { stateDOM } from "../..";

export const authorization = {
    onClickBtnEntry: () => {
        stateDOM.getDOMState().btnEntryLogin.classList.add('active_btn');
        stateDOM.getDOMState().btnRegistration.classList.remove('active_btn');
        document.querySelector('.wrap_input_name').classList.add('hide');

        stateDOM.getDOMState().btnSubmit.innerHTML = 'Войти';

        for (let elem of stateDOM.getDOMState().form) {
            if (elem.tagName === 'INPUT') {
                elem.value = '';
            }
        }
    },

    onClickBtnRegistration: () => {
        stateDOM.getDOMState().btnEntryLogin.classList.remove('active_btn');
        stateDOM.getDOMState().btnRegistration.classList.add('active_btn');
        document.querySelector('.wrap_input_name').classList.remove('hide');

        stateDOM.getDOMState().btnSubmit.innerHTML = 'Зарегистрировать';

        for (let elem of stateDOM.getDOMState().form) {
            if (elem.tagName === 'INPUT') {
                elem.value = '';
            }
        }
    },

    login: async (data) => {
        const response = await fetch('https://mysterious-reef-68631.herokuapp.com/SeaBattle/users/login', {
            method: "POST" ,
            headers: {
                'Content-Type': 'Application/json'
            },
            body: JSON.stringify(data)
        })
        const result = await response.json();
        return result;
    },

    registration: async (data) => {
        const response = await fetch('https://mysterious-reef-68631.herokuapp.com/SeaBattle/users', {
            method: "POST" ,
            headers: {
                'Content-Type': 'Application/json'
            },
            body: JSON.stringify(data)
        })
        const result = await response.json();
        return result;
    }
};

