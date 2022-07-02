//
//  *****************************************************************
//
//          A C C E S O    A    A P I    R E S T 
//
//  *****************************************************************
//
class ApiRest {

    //
    //  Devuelve array de objetos de tabla de parámetro.
    //
    static async getTabla(tabla = '') {

        //  Valida parámetros.
        if (isNull(tabla))
            return alertError('ApiRest.get(): Parámetro-tabla inválido.');

        //  Descarga.
        let ret = await fetch(`${URL_BASE}/${tabla}.json`)

        //  Convierte a objeto.
        ret = await ret.json()

        return ret;
    };


    //
    //  Devuelve objeto persistido con tabla y id de parámetro.
    //
    static async getById(tabla = '', id = '') {

        //  Valida parámetros.
        if (isNull(tabla))
            return alertError('ApiRest.getById(): Parámetro-tabla inválido.');
        if (isNull(id))
            return alertError('ApiRest.getById(): Parámetro-id inválido.');

        //  Descarga.
        let ret = await fetch(`${URL_BASE}/${tabla}/${id}.json`)

        //  Convierte a objeto.
        ret = await ret.json()

        return ret;
    };


    //
    //  Escribe JSON con nombre de tabla y objeto-instancia
    //
    static set(tabla = '', instancia = null) {

        //  Valida parámetros.
        if (isNull(tabla))
            return alertError('ApiRest.set(): Parámetro-tabla inválido.', false);
        if (isNull(instancia))
            return alertError('ApiRest.set(): Parámetro-instancia inválido.', false);

        //  Escribe.
        fetch(`${URL_BASE}/${tabla}${isNull(instancia.id) ? '' : '/'+instancia.id}.json`, {
            method: (isNull(instancia.id) ? 'POST' : 'PUT'),
            body: JSON.stringify(instancia),
            headers: {'Content-type': 'application/json; charset=UTF-8'}
        })
        .then((response) => response.json());

        return true;

    };


    //
    //  Borra JSON con tabla y id. Devuelve true o false.
    //
    static async delete(tabla = '', id = '') {

        //  Valida parámetreos
        if (isNull(tabla))
            return alertError('ApiRest.delete(): Parámetro-tabla inválido.', false);
        if (isNull(id))
            return alertError('ApiRest.delete(): Parámetro-id inválido.', false);

        //  Borra.
        let ret = await fetch(`${URL_BASE}/${tabla}/${id}.json`, {
            method: 'DELETE',
            headers: {'Content-type': 'application/json; charset=UTF-8'}
        })

        //
        return true;

    };

};
