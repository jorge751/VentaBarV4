//
//  *****************************************************************
//
//                   M E S A   E N   S E R V I C I O
//
//  *****************************************************************
//
class Mesa {

    //
    //  Nombre en plural de la clase
    //
    static nombrePlural = 'Mesas';


    //
    //  Array con propiedades
    //
    static propiedades = getClaves(new this());


    //
    // Devuelve array de objetos-mesa de TODOS los datos persistidos
    //
    static all() {
        let ret = Store.getConNomClase('Mesa');
        ret = ret.map((datoJSON) => JSON.parse(datoJSON));
        return ret;
    };

    //
    //  Devuelve instancia de objeto persistido con id de parámetro.
    //
    static find(id) {
        if (!id) return _alertErrores('Mesa.find(): Parámetro-id inválido.')
        const datoJSON = Store.get('Mesa' + id);
        return (!datoJSON ? null : new this(JSON.parse(datoJSON)));
    };
    

    //
    //  Construye instancia con parámetro-objeto.
    //
    constructor(paramObj) {
        this.id = (isNull(paramObj) ? 0 : Number(paramObj.id));
        this.descripcion = paramObj?.descripcion ?? '';
        this.mozo = paramObj?.mozo ?? '';
        this.estado = paramObj?.estado ?? 'disponible';
    };


    //
    //  Persiste instancia, devuelve true o false.
    //
    save() {
        if (this.valid()) {;
            if (isNull(this.id)) this.id = Store.nextId('Mesa');
            const clave = this.constructor.name + this.id;
            return Store.set(clave, JSON.stringify(this));
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
        if (isNull(this.descripcion)) _errores += 'Debe ingresar descripción. ';
        //
        if (Store.findColision('Mesa', 'descripcion', this.descripcion, this.id)) {
            _errores += `Ya existe "${this.descripcion}". `};
        //
        if (isNull(this.mozo)) _errores += 'Debe ingresar mozo. ';
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
        this.id = (paramObj.id ? Number(paramObj.id) : 0);
        this.descripcion = (paramObj.descripcion ? String(paramObj.descripcion) : '');
        this.mozo = (paramObj.mozo ? String(paramObj.mozo) : '');
        this.estado = (paramObj.estado ?  String(paramObj.estado) : '');
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
//              C O N T R O L A D O R   D E   M E S A S
//
//  *****************************************************************
//
class MesasController {

    //
    //  id de mesa seleccionada
    //
    static idSeleccionada = 0;


    //
    //  Reserva origen de nueva mesa
    //
    static reserva = null;


    //
    //  Devuelve array de objetos-mesa.
    //  Opcional "idPadreEnDOM", si existe en DOM, apendiza una tabla con datos.
    //  Opcional "arrProps", array de filtro de propiedades.
    //
    static index(idPadreEnDOM) {
        //  Obtiene array de objetos-mesa.
        const mesas = Mesa.all();
        //  Limpia reserva origen de nueva mesa.
        this.reserva = null;
        //  Ordena por id.
        mesas.sort(function(mesaA, mesaB) {
            return (mesaA.id > mesaB.id ? 1 : (mesaB.id > mesaA.id ? -1 : 0));
        });
        //  Renderiza tabla en el DOM.
        if (!isNull(idPadreEnDOM)) {
            //  Toastify !!!
            Toastify({text: 'Todas las mesas...', duration: 3000}).showToast();
            //
            Dom.clearById(idPadreEnDOM);
            Dom.renderTabla({
                arrObjetos: mesas,
                idPadreEnDOM: idPadreEnDOM,
                propiedades: Mesa.propiedades,
                funClickEitar: `${this.name}.edit`,
                funClickBorrar: `${this.name}.delete`,
                funClickAgregar: `${this.name}.new`,
                funClickCancelar: `${this.name}.cancelIndex`,
                titulo: Mesa.nombrePlural}
            );
        };
        return mesas;
    };


    //
    //  Llama a 'index" con información de evento.
    //
    static indexConEvento(evento) {
        evento.preventDefault();
        return this.index(evento.target.formTarget);
    };


    //
    //  Limpia formulario y mesa seleccionada.
    //
    static cancelIndex(evento) {
        evento.preventDefault();
        renderAyuda();
    };


    //
    //  Devuelve array de objetos-mesa.
    //  Requerido "idPadreEnDOM".
    //  Renderiza iconos de mesas en DOM.
    //
    static indexConIconos(idPadreEnDOM) {
        //  Valida parámetro.
        if (isNull(idPadreEnDOM))
            return _alertErrores('MesasController.indexConIconos(): Parámetro inválido.');
        //  Obtiene array de objetos-mesa.
        const mesas = this.index();
        //  Limpia y renderiza iconos de mesas en el DOM.
        Dom.clearById(idPadreEnDOM);
        mesas.forEach((mesa) => {
            Dom.renderIcono({
                sufijoId: 'mesa-' + mesa.id,
                idPadreEnDOM: idPadreEnDOM,
                claseDivIcono: 'div-icono',
                claseImagen: 'imagen-circular',
                srcImagen: (mesa.estado === 'disponible' ?
                    './assets/mesa_disponible.jpg' : './assets/mesa_abierta.jpg'),
                claseDivTexto: (mesa.id === this.idSeleccionada ?
                    'texto-sobre-imagen-seleccionado' : 'texto-sobre-imagen'),
                texto: mesa.descripcion,
                funClick: `ConsumosController.index("id-formulario", ${mesa.id})`}
            )}
        );
        return mesas;
    };


    //
    //  Renderiza formulario con instancia vacía.
    //
    static new(evento, idPadreEnDOM = '', descripcion = '') {
        //
        evento.preventDefault();
        //  Toastify !!!
        Toastify({text: 'Nueva mesa...', duration: 3000}).showToast();
        //
        idPadreEnDOM = (isNull(idPadreEnDOM) ?
            evento.target.formTarget : idPadreEnDOM);
        Dom.clearById(idPadreEnDOM);
        //
        const mesa = new Mesa();
        mesa.descripcion = descripcion ?? '';
        //
        return this.renderForm(mesa, idPadreEnDOM);
        //
    };


    //
    //  Construye nueva instancia con formulario en DOM y persiste.
    //
    static create(evento) {
        evento.preventDefault();
        const nomForm = evento.target.formTarget;
        const mesaEnDOM = Dom.getObjectByForm(nomForm);
        const mesa = new Mesa(mesaEnDOM)
        if (mesa.save()) {
            //  Toastify !!!
            Toastify({text: 'Mesa grabada...', duration: 3000}).showToast();
            Swal.fire('Mesa grabada !!!');
            //  Borra reserva origen de nueva mesa.
            if (this.reserva) {
                this.reserva.destroy();
            }
            //
            this.indexConIconos('id-main');
            this.index('id-formulario');
            //
        } else if (mesa._errores) {
            Dom.renderErrores({
                nomForm: nomForm,
                texto: mesa._errores}
            );
            //  Toastify !!!
            Toastify({text: 'Hay errores...', duration: 3000}).showToast();
            //
        };
    };


    //
    //  Busca con id y renderiza formulario para edición.
    //
    static edit(evento) {
        evento.preventDefault();
        const mesa = Mesa.find(evento.target.value);
        const idPadreEnDOM = evento.target.formTarget;
        Dom.clearById(idPadreEnDOM);
        //  Toastify !!!
        Toastify({text: `Edición de ${mesa.descripcion}...`, duration: 3000}).showToast();
        //
        return this.renderForm(mesa, idPadreEnDOM);
    };


    //
    //  Construye instancia con formulario en DOM, busca en Store, actualiza y persiste.
    //
    static update(evento) {
        evento.preventDefault();
        const nomForm = evento.target.formTarget;
        const mesaEnDOM = Dom.getObjectByForm(nomForm);
        const mesa = Mesa.find(mesaEnDOM.id);
        if (mesa.updateAttributes(mesaEnDOM)) {
            this.indexConIconos('id-main');
            this.index('id-formulario');
            //  Toastify !!!
            Toastify({text: 'Mesa actualizada...', duration: 3000}).showToast();
            Swal.fire({text: 'Mesa actualizada !!!', timer: 3000, icon: 'success'});
            //
        } else if (mesa._errores) {
            Dom.renderErrores({
                nomForm: nomForm,
                texto: mesa._errores}
            );
            //  Toastify !!!
            Toastify({text: 'Falta información...', duration: 3000}).showToast();
            //
        };
    };


    //
    //  Busca un objeto persistido con id y lo borra de Store.
    //
    static delete(evento) {
        //  Procesa evento.
        evento.preventDefault();
        const mesa = Mesa.find(evento.target.value);
        //
        Swal.fire({
            title: '¿ Está seguro ?',
            text: `Desea borrar: "${mesa.descripcion}" ?`,
            icon: "warning",
            showDenyButton: true,
            confirmButtonText: 'Si',
            denyButtonText: 'No'
        }).then((resultado) => {
            if (resultado.isConfirmed) {
                let error = false;
                //  Borra consumo asociado
                ConsumosController.index('', this.id).forEach(
                    (consumo) => {
                        if (!Store.remove('Consumo' + consumo.id)) error = true
                    }
                );
                //  Si no hay _errores, borra la mesa.
                if (!error && mesa.destroy()) {
                    //  Toastify !!!
                    Toastify({text: 'Mesa borrada.', duration: 3000}).showToast();
                    //
                    this.indexConIconos('id-main');
                    this.index('id-formulario');
                    Swal.fire('Mesa borrada !!!');
                };
            }});
    };


    //
    //  Devuelve string con nombre y total de mejor mozo.
    //
    static mejorMozo() {
        //  Lee TODAS los mesas y las ordena por mozo para corte de control.
        const mesas = Mesa.all();
        mesas.sort((mesaA, mesaB) => {
            return (mesaA.mozo.toUpperCase() > mesaB.mozo.toUpperCase() ? 1 :
                (mesaB.mozo.toUpperCase() > mesaA.mozo.toUpperCase() ? -1 : 0))}
        );
        //
        const mejor = {nombre: '', total: 0.00};
        //
        let total = 0;
        let mozoAnt = '';
        let mesa = null;
        for (let i = 0; i < mesas.length; i++) {
            //
            mesa = mesas[i];
            //  Corte de control
            if (mesa.mozo.toUpperCase().trim() !== mozoAnt.toUpperCase().trim()) {
                if (mozoAnt !== '') {
                    if (total > mejor.total) {
                        mejor.nombre = mozoAnt;
                        mejor.total = total;
                    }
                }
                total = 0.00;
                mozoAnt = mesa.mozo;
            }
            //
            total += ConsumosController.getTotalMesa(mesa.id);
            //
        };
        //
        if (total > mejor.total) {
            mejor.nombre = mozoAnt;
            mejor.total = total;
        }
        //
        const ret = (mejor.nombre ?
            `${mejor.nombre} = $ ${mejor.total}` : 'No hay mozo.')
        //
        return ret;
        //
    };


    //
    //  Renderiza formulario con correciones de edición.
    //
    static renderForm(mesa, idPadreEnDOM) {
        //  Renderiza formulario
        const ret = Dom.renderForm(mesa, idPadreEnDOM, this.name);
        //  Estado
        const input = Dom.get('mesa-' + mesa.id + '-estado');
        input.classList.add('clase-readonly');
        input.readOnly = true;
        //
        return ret;
        //
    };

};
