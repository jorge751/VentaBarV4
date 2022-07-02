//
//  *****************************************************************
//
//                          R E S E R V A
//
//  *****************************************************************
//
class Reserva {

    //
    //  Nombre de tabla y plural de la clase
    //
    static tabla = 'reservas';
    static nombrePlural = 'Reservas de mesas';


    //
    //  Array con propiedades
    //
    static propiedades = getClaves(new this());


    //
    //  Devuelve array de objetos-Reserva de TODOS los datos persistidos.
    //
    static async all() {
        let respuesta = await ApiRest.getTabla(this.tabla);
        const ret = [];
        for (let obj in respuesta) {
            respuesta[obj]['id'] = obj;
            ret.push(respuesta[obj]);
        };
        return ret;
    }


    //
    //  Devuelve instancia de objeto persistido con id.
    //
    static async find(id) {
        if (isNull(id))
			return alertError('Reserva.find(): Parámetro-id inválido.')
        const obj = await ApiRest.getById(this.tabla, id);
        if (obj) {
            obj['id'] = id;
            return new this(obj);
        } else {
            return null;
        }
    };
    

    //
    //  Construye instancia con parámetro-objeto.
    //
    constructor(paramObj) {
        this.id = paramObj?.id ?? '';
        this.fecha = paramObj?.fecha ?? fechaAMD();
		this.hora = (isNull(paramObj) ? 0 : Number(paramObj.hora));
        this.descripcion = paramObj?.descripcion ?? '';
    };


    //
    //  Persiste instancia, devuelve true o false.
    //
    save() {
        if (this.valid()) {;
            return ApiRest.set('reservas', this);
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
        if (isNaN(this.hora)) _errores += 'Hora debe ser un número.';
        if (!Number.isInteger(this.hora)) _errores += 'Hora debe ser un número entero.';
        if (this.hora < 0 || this.hora > 23) _errores += 'Hora inválida (válida 0 a 23).';
        //
        if (isNull(this.descripcion)) _errores += 'Debe ingresar descripción.';
        //
        if (!isNull(_errores)) this['_errores'] = _errores;
        //
        return isNull(_errores);
        //
    };


    //
    //  Actualiza instancia con objeto y persiste.
    //
    updateAttributes(paramObj) {
        this.fecha = (paramObj.fecha ? String(paramObj.fecha) : '');
        this.hora = (paramObj.hora ? Number(paramObj.hora) : 0);
        this.descripcion = (paramObj.descripcion ? String(paramObj.descripcion) : '');
        return this.save()
    }


    //
    //  Borra instancia de la nube.
    //
    destroy() {
        return ApiRest.delete('reservas', this.id);
    };

};


//
//  *****************************************************************
//
//                       C O N T R O L A D O R
//
//  *****************************************************************
//
class ReservasController {

    //
    //  Devuelve array de objetos-Reserva.
    //
    static index(idPadreEnDOM) {
        return new Promise(resuelve => {
        //  Toastify !!!
        Toastify({text: 'Todos las reservas...', duration: 3000}).showToast();
        //  Obtiene array de objetos-Reserva.
        Reserva.all()
            .then((reservas) => {
            //  Ordena por fecha y hora.
            if (reservas) {
                reservas.sort(function(rA, rB) {
                    return (rA.fecha + rA.hora > rB.fecha + rB.hora ?
                        1 : (rB.fecha + rB.hora > rA.fecha + rA.hora ? -1 : 0));
                });
            };
            //  Id de body
            const idTbody = 'id-Tbody-tabla';
            //  Renderiza tabla en el DOM.
            if (!isNull(idPadreEnDOM)) {
                Dom.clearById(idPadreEnDOM);
                Dom.renderTabla({
                    arrObjetos: reservas,
                    idPadreEnDOM: idPadreEnDOM,
                    propiedades: Reserva.propiedades,
                    funClickEitar: `${this.name}.edit`,
                    funClickBorrar: `${this.name}.delete`,
                    funClickAgregar: `${this.name}.new`,
                    funClickExtra: `${this.name}.abrirMesa`,
                    textBtnExtra: 'Usar',
                    funClickCancelar: `${this.name}.cancelIndex`,
                    titulo: Reserva.nombrePlural,
                    idTbody: idTbody}
                );
            };
            //
            resuelve(reservas);
            })
        })
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
    //  Limpia index.
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
        const reserva = new Reserva();
        idPadreEnDOM = idPadreEnDOM ?? evento.target.formTarget;
        Dom.clearById(idPadreEnDOM);
        return this.renderForm(reserva, idPadreEnDOM);
    };


    //
    //  Construye nueva instancia con formulario en DOM y persiste.
    //
    static create(evento) {
        evento.preventDefault();
        const nomForm = evento.target.formTarget;
        const reservaEnDOM = Dom.getObjectByForm(nomForm);
        const reserva = new Reserva(reservaEnDOM)
        if (reserva.save()) {
            delay(1).then(() => this.index('id-formulario'));
        } else if (reserva._errores) {
            Dom.renderErrores({
                nomForm: nomForm,
                texto: reserva._errores}
            );
        };
    };


    //
    //  Busca con id y renderiza formulario para edición.
    //
    static edit(evento) {
        evento.preventDefault();
        Reserva.find(evento.target.value)
            .then((reserva) => {
                const idPadreEnDOM = evento.target.formTarget;
                Dom.clearById(idPadreEnDOM);
                //  Toastify !!!
                Toastify({text: `Reserva ${reserva.descripcion}...`,
                    duration: 3000}).showToast();
                //
                return this.renderForm(reserva, idPadreEnDOM);
            });
    };


    //
    //  Construye instancia con formulario en DOM.
    //  Busca en la nube, actualiza propiedades y persiste.
    //
    static update(evento) {
        evento.preventDefault();
        const nomForm = evento.target.formTarget;
        const reservaEnDOM = Dom.getObjectByForm(nomForm);
        Reserva.find(reservaEnDOM.id)
            .then((reserva) => {
                if (reserva.updateAttributes(reservaEnDOM)) {
                    //  Toastify !!!
                    Toastify({text: 'Reserva actualizado !!!',
                        duration: 3000}).showToast();
                    //
                    delay(1).then(() => this.index('id-formulario'));
                    //
                } else if (reserva._errores) {
                    //  Toastify !!!
                    Toastify({text: 'Hay errores...',
                        duration: 3000}).showToast();
                    //
                    Dom.renderErrores({
                        nomForm: nomForm,
                        texto: reserva._errores}
                    );
                };
            });
    };


    //
    //  Busca un objeto persistido con id y lo borra de la nube.
    //
    static delete(evento) {
        //
        evento.preventDefault();
        //
        Reserva.find(evento.target.value)
        .then((reserva) => {
            Swal.fire({
                title: '¿ Está seguro ?',
                text: `Desea borrar reserva de mesa "${reserva.descripcion}" ?`,
                icon: "warning",
                showDenyButton: true,
                confirmButtonText: 'Si',
                denyButtonText: 'No'})
            .then((resultado) => {
                if (resultado.isConfirmed) {
                    reserva.destroy()
                    .then((destroyOk) => {
                        if (destroyOk) {
                            Toastify({text: 'Reserva borrada.',
                                duration: 3000}).showToast();
                            delay(1)
                            .then(() => this.index('id-formulario'));
                        }
                    })
                }
            })
        })
        //
    };


    //
    //  Abrir mesa con reserva.
    //
    static abrirMesa(evento) {
        //
        evento.preventDefault();
        //
        Reserva.find(evento.target.value)
        .then((reserva) => {
            MesasController.reserva = reserva;
            MesasController.new(evento, 'id-formulario',
                'Res.: ' + reserva.descripcion);
        })
        //
    }


    //
    //  Renderiza formulario con correciones de edición.
    //
    static renderForm(reserva, idPadreEnDOM) {
        //  Renderiza formulario
        const ret = Dom.renderForm(reserva, idPadreEnDOM, this.name);
        //  Id
        let input = Dom.get(`reserva-${reserva.id}-id`);
        input.classList.remove('clase-propiedad-id');
        input.classList.add('clase-propiedad-id-largo');
        //  Fecha
        input = Dom.get(`reserva-${reserva.id}-fecha`);
        input.type = "date";
        //
        return ret;
        //
    };

};
