//
//  *****************************************************************
//
//          A C C E S O    A    L O C A L    S T O R A G E
//
//  *****************************************************************
//
class Store {

    //
    //  Devuelve dato de la clave de parámetro.
    //
    static get(clave = '') {
        let ret = localStorage.getItem(clave);
        return ret;
    };


    //
    //  Escribe dato con la clave de parámetro., devuelve true o false.
    //
    static set(clave = '', dato = null) {
        //  Valida parámetros.
        if (isNull(clave)) return alertError('Store.set(): Parámetro-clave inválida.', false);
        localStorage.setItem(clave, dato);
        return true;
    };


    //
    //  Borra dato con clave de parámetro.
    //
    static remove(clave = '') {
        if (isNull(clave)) return alertError('Store.remove(): Parámetro-clave inválida.', false);
        localStorage.removeItem(clave);
        return true;
    };


    //
    //  Devuelve array con TODOS los datos en JSON de la clase.
    //
    static getConNomClase(nomClase = '') {
        //  Valida parámetro.
        if (isNull(nomClase)) return alertError('Store.getConNomClase(): Parámetro-nombre-clase inválida.');
        //  Bucle de búsqueda
        let ret = [];
        for (let i = 0; i < localStorage.length; i++) {
            const clave = localStorage.key(i);
            if (clave.startsWith(nomClase)) {
                ret.push((localStorage.getItem(clave)));
            };
        };
        return ret;
    };


    //
    //  Actualiza y devuelve el próximo Id para un nombre de clase.
    //
    static nextId(nomClase = '') {
        if (isNull(nomClase)) return alertError('Store.nextId(): Parámetro-nombre-clase inválido.')
        const clave = 'lastId' + nomClase;
        let lastId = Number(Store.get(clave));
        lastId = (isNull(lastId) ? 1 : lastId + 1);
        Store.set(clave, lastId);
        return lastId;
    };


    //
    //  Devuelve true si encuentra colision de dato con clase, propiedad y id de parámetro
    //
    static findColision(nomClase = '', propiedad = '', valor = null, paramId = 0) {
        //  Bucle de búsqueda
        let clave, dato;
        for (let i = 0; i < localStorage.length; i++) {
            clave = localStorage.key(i);
            if (clave.startsWith(nomClase)) {
                dato = JSON.parse(localStorage.getItem(clave));
                if (dato.id !== paramId &&
                    String(dato[propiedad]).toUpperCase() === valor.toUpperCase()) return true;
            };
        };
        return false;

    };

};
