/////////////////////////////////////// CLASS STORAGE ///////////////////////////////////////

class Storage {

    static saveToStorage (key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }

    static getfromStorage (key) {
        return localStorage.getItem(key) ? JSON.parse(localStorage.getItem(key)) : [];
    }

}

export default Storage;