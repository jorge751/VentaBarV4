//
//  *****************************************************************
//
//                   C I E R R E    D E   M E S A
//
//  *****************************************************************
//
class CierreMesa {

    //
    //  Nombre en plural de la clase
    //
    static nombrePlural = 'Cierres de mesas';


    //
    //  Array con propiedades
    //
    static propiedades = getClaves(new this());


    //
    // Devuelve array de objetos-CierreMesa de TODOS los datos persistidos
    //
    static all() {
        let ret = Store.getConNomClase('CierreMesa');
        ret = ret.map((datoJSON) => JSON.parse(datoJSON));
        return ret;
    };

    //
    //  Devuelve instancia de objeto persistido con id de parámetro.
    //
    static find(id) {
        if (isNull(id)) return alertError('CierreMesa.find(): Parámetro-id inválido.')
        const datoJSON = Store.get('CierreMesa' + id);
        return (!datoJSON ? null : new this(JSON.parse(datoJSON)));
    };
    

    //
    //  Construye instancia con parámetro-objeto.
    //
    constructor(paramObj) {
        this.id = (isNull(paramObj) ? 0 : Number(paramObj.id));
        this.fecha = paramObj?.fecha ?? fechaAMD();
        this.idMesa = paramObj?.idMesa ?? 0;
        this.mesa = paramObj?.mesa ?? '';
        this.mozo = paramObj?.mozo ?? '';
        this.total = paramObj?.total ?? 0.00;
    };


    //
    //  Persiste instancia, devuelve true o false.
    //
    save() {
        if (this.valid()) {;
            if (isNull(this.id)) this.id = Store.nextId('CierreMesa');
            return Store.set(this.constructor.name + this.id, JSON.stringify(this));
        } else {
            return false;
        };
    };


    //
    //  Valida instancia.
    //
    valid() {
        //
        let _errores = '';
        //
        if (isNull(this.fecha)) _errores += 'Debe ingresar fecha. ';
        //
        if (isNull(this.idMesa)) _errores += 'Debe ingresar id de mesa. ';
        //
        this['_errores'] = _errores;
        //
        return isNull(_errores);
        //
    };


    //
    //  Actualiza instancia con objeto y persiste.
    //
    updateAttributes(paramObj) {
        this.id = (paramObj.id ? 0 : Number(paramObj.id));
        this.fecha = (paramObj.fecha ? String(paramObj.fecha) : '');
        this.idMesa = (paramObj.idMesa ? Number(paramObj.idMesa) : 0);
        this.mesa = (paramObj.mesa ? String(paramObj.mesa) : '');
        this.mozo = (paramObj.mozo ? String(paramObj.mozo) : '');
        this.total = (paramObj.total ? Number(paramObj.total) : 0.00);
        return this.save()
    }


    //
    //  Borra instancia del Store
    //
    destroy() {
        return Store.remove(this.constructor.name + this.id);
    };

};


//
//  *****************************************************************
//
//                       C O N T R O L A D O R
//
//  *****************************************************************
//
class CierresController {

    //
    //  Devuelve array de objetos-CierreMesa.
    //  Opcional "idPadreEnDOM", si existe en DOM, apendiza una tabla con datos.
    //  Opcional "arrProps", array de filtro de propiedades.
    //
    static index(idPadreEnDOM) {
        //  Toastify !!!
        Toastify({text: 'Todos los cierres...', duration: 3000}).showToast();
        //  Obtiene array de objetos-CierreMesa.
        const cierres = CierreMesa.all();
        //  Ordena por id.
        cierres.sort(function(cierreA, cierreB) {
            return (cierreA.id > cierreB.id ? 1 : (cierreB.id > cierreA.id ? -1 : 0));
        });
        //  Limpia mesa seleccionada y actualiza.
        if (MesasController.idSeleccionada !== 0) {
            MesasController.idSeleccionada = 0;
            MesasController.indexConIconos('id-main');
        };
        //  Id de body
        const idTbody = 'id-Tbody-tabla';
        //  Renderiza tabla en el DOM.
        if (!isNull(idPadreEnDOM)) {
            Dom.clearById(idPadreEnDOM);
            Dom.renderTabla({
                arrObjetos: cierres,
                idPadreEnDOM: idPadreEnDOM,
                propiedades: CierreMesa.propiedades,
                funClickEitar: `${this.name}.edit`,
                funClickBorrar: `${this.name}.delete`,
                funClickCancelar: `${this.name}.cancelIndex`,
                titulo: `Recaudación por ${CierreMesa.nombrePlural}`,
                idTbody: idTbody}
            );
        };
        //
        //  Renderiza total en una columna de un body de tabla.
        //
        let total = 0.00;
        cierres.forEach((cierre) => total += cierre.total);
        Dom.renderColTabla({idTbody: idTbody, texto: `$ ${total}`, col: 6})
        //
        return cierres;
    };


    //
    //  Llama a 'index" con información de evento.
    //
    static indexConEvento(evento) {
        evento.preventDefault();
        const idPadreEnDOM = evento.target.formTarget
        return this.index(idPadreEnDOM);
    };


    //
    //  Limpia formulario y mesa seleccionada.
    //
    static cancelIndex(evento) {
        evento.preventDefault();
        renderAyuda();
    };


    //
    //  Renderiza formulario con instancia vacía.
    //
    static new(evento, idPadreEnDOM) {
        evento.preventDefault();
        const cierre = new CierreMesa();
        idPadreEnDOM = idPadreEnDOM ?? evento.target.formTarget;
        Dom.clearById(idPadreEnDOM);
        return this.renderForm(cierre, idPadreEnDOM);
    };


    //
    //  Construye nueva instancia con formulario en DOM y persiste.
    //
    static create(evento) {
        evento.preventDefault();
        const nomForm = evento.target.formTarget;
        const cierreEnDOM = Dom.getObjectByForm(nomForm);
        const cierre = new CierreMesa(cierreEnDOM)
        if (cierre.save()) {
            this.index('id-formulario');
        } else if (cierre._errores) {
            Dom.renderErrores({
                nomForm: nomForm,
                texto: cierre._errores}
            );
        };
    };


    //
    //  Busca con id y renderiza formulario para edición.
    //
    static edit(evento) {
        evento.preventDefault();
        const cierre = CierreMesa.find(evento.target.value);
        const idPadreEnDOM = evento.target.formTarget;
        Dom.clearById(idPadreEnDOM);
        //  Toastify !!!
        Toastify({text: `Cierre ${cierre.mesa}...`, duration: 3000}).showToast();
        //
        return this.renderForm(cierre, idPadreEnDOM);
    };


    //
    //  Construye instancia con formulario en DOM.
    //  Busca en Store, actualiza propiedades y persiste.
    //
    static update(evento) {
        evento.preventDefault();
        const nomForm = evento.target.formTarget;
        const cierreEnDOM = Dom.getObjectByForm(nomForm);
        const cierre = CierreMesa.find(cierreEnDOM.id);
        if (cierre.updateAttributes(cierreEnDOM)) {
            //  Toastify !!!
            Toastify({text: 'Cierre actualizado !!!', duration: 3000}).showToast();
            //
            this.index('id-formulario');
        } else if (cierre._errores) {
            //  Toastify !!!
            Toastify({text: 'Hay errores...', duration: 3000}).showToast();
            //
            Dom.renderErrores({
                nomForm: nomForm,
                texto: cierre._errores}
            );
        };
    };


    //
    //  Busca un objeto persistido con id y lo borra de Store.
    //
    static delete(evento) {
        //
        evento.preventDefault();
        //
        const cierre = CierreMesa.find(evento.target.value);
        //
        Swal.fire({
            title: '¿ Está seguro ?',
            text: `Desea borrar cierre de mesa "${cierre.mesa}" ?`,
            icon: "warning",
            showDenyButton: true,
            confirmButtonText: 'Si',
            denyButtonText: 'No'
        }).then((resultado) => {
            if (resultado.isConfirmed && cierre.destroy()) {
                //  Toastify !!!
                Toastify({text: 'Cierre borrado.', duration: 3000}).showToast();
                //
                this.index('id-formulario');
            }});
        //
    };


    //
    //  Renderiza formulario con correciones de edición.
    //
    static renderForm(cierre, idPadreEnDOM) {
        //  Renderiza formulario readonly completo.
        const ret = Dom.renderForm(cierre, idPadreEnDOM, this.name, 'readonly');
        //
        return ret;
        //
    };

};
