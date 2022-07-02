//
//  *****************************************************************
//
//                   C O N S U M O   D E   M E S A S
//
//  *****************************************************************
//
class Consumo {

    //
    //  Nombre en plural de la clase
    //
    static nombrePlural = 'Consumos';


    //
    //  Array con propiedades
    //
    static propiedades = getClaves(new this());


    //
    // Devuelve array de objetos-consumo de TODOS los datos persistidos
    //
    static all() {
        let ret = Store.getConNomClase('Consumo');
        ret = ret.map((datoJSON) => JSON.parse(datoJSON));
        return ret;
    };

    //
    //  Devuelve instancia de objeto persistido con id de parámetro.
    //
    static find(id) {
        if (!id) return alertError('Consumo.find(): Parámetro-id inválido.')
        const datoJSON = Store.get('Consumo' + id);
        return (!datoJSON ? null : new this(JSON.parse(datoJSON)));
    };
    

    //
    //  Construye instancia con parámetro-objeto.
    //
    constructor(paramObj) {
        this.id = (isNull(paramObj) ? 0 : Number(paramObj.id));
        this.idMesa = (isNull(paramObj) ? 0 : Number(paramObj.idMesa));
        this.mesa = (isNull(paramObj) ? '' : String(paramObj.mesa));
        this.producto = (isNull(paramObj) ? '' : String(paramObj.producto));
        this.cantidad = (isNull(paramObj) ? 0 : Number(paramObj.cantidad));
        this.precio = (isNull(paramObj) ? 0.00 : Number(paramObj.precio));
        this.importe = (isNull(paramObj) ? 0.00 : Number(paramObj.importe));
    };


    //
    //  Persiste instancia, devuelve true o false.
    //
    save() {
        if (this.valid()) {;
            if (isNull(this.id)) this.id = Store.nextId('Consumo');
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
        if (isNull(this.idMesa)) _errores += 'Debe ingresar id de mesa. ';
        //
        if (isNull(this.producto)) _errores += 'Debe ingresar producto. ';
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
        this.idMesa = (paramObj.idMesa ? Number(paramObj.idMesa) : 0);
        this.mesa = (paramObj.mesa ? String(paramObj.mesa) : '');
        this.producto = (paramObj.producto ? String(paramObj.producto) : '');
        this.cantidad = (paramObj.cantidad ? Number(paramObj.cantidad) : 0);
        this.precio = (paramObj.precio ? Number(paramObj.precio) : 0.00);
        this.importe = (paramObj.importe ? Number(paramObj.importe) : 0.00);
        return this.save()
    }


    //
    //  Borra instancia del Store
    //
    destroy() {
        return Store.remove(this.constructor.name + this.id)
    };

};


//
//  *****************************************************************
//
//                       C O N T R O L A D O R
//
//  *****************************************************************
//
class ConsumosController {

    //
    //  Instancia de mesa asociada al consumo y total
    //
    static mesaAsoc = null;


    //
    //  Devuelve array de objetos-consumo.
    //  Opcional "idPadreEnDOM", si existe en DOM, apendiza una tabla con datos.
    //  Opcional "arrProps", array de filtro de propiedades.
    //
    static index(idPadreEnDOM, idMesa = 0) {
        //  Resuelve mesa asociada.
        if (idMesa === 'all') {
            this.mesaAsoc = null;
            MesasController.idSeleccionada = 0;
        } else if (!isNull(idMesa)) {
            this.mesaAsoc = Mesa.find(idMesa);
            this.mesaAsoc['total'] = 0.00;
            this.mesaAsoc['lineas'] = 0;
            MesasController.idSeleccionada = idMesa;
        };
        MesasController.indexConIconos('id-main');
        //  Obtiene array de objetos-consumo.
        let consumos = Consumo.all();
        //  Filtra por mesa asociada
        if (!isNull(this.mesaAsoc)) {
            consumos = consumos.filter((consumo) => consumo.idMesa === this.mesaAsoc.id);
        };
        //  Ordena por id
        consumos.sort(function(consumoA, consumoB) {
            return (consumoA.id > consumoB.id ? 1 : (consumoB.id > consumoA.id ? -1 : 0));
        });
        //
        //  Total consumo
        let total = 0.00;
        consumos.forEach((consumo) => total += consumo.importe);
        //  Actualiza mesa asociada.
        if (this.mesaAsoc) {
            this.mesaAsoc.total = total;
            this.mesaAsoc.lineas = consumos.length;
        };
        //
        //  Id del body de la tabla.
        const idTbody = 'id-Tbody-tabla';
        //
        //  Renderiza tabla en DOM.
        if (!isNull(idPadreEnDOM)) {
            Dom.clearById(idPadreEnDOM);
            Dom.renderTabla({
                arrObjetos: consumos,
                idPadreEnDOM: idPadreEnDOM,
                propiedades: Consumo.propiedades,
                funClickEitar: (idMesa === 'all' ? null : `${this.name}.edit`),
                funClickBorrar: (idMesa === 'all' ? null : `${this.name}.delete`),
                funClickAgregar: (idMesa === 'all' ? null : `${this.name}.new`),
                funClickCancelar: `${this.name}.cancelIndex`,
                idTbody: idTbody,
                titulo: `${Consumo.nombrePlural}
                    ${(this.mesaAsoc ? ` de ${this.mesaAsoc.descripcion}` : '')}`,
                addCaption: (idMesa === 'all' ? '' : `Mozo: ${this.mesaAsoc.mozo}`)}
            );
            //
            //  Botón de cierre de mesa.
            if (this.mesaAsoc) {
                //  Pone botón si hay líneas.
                if (this.mesaAsoc.lineas > 0) {
                    const divBotones = Dom.get('id-div-botones-acciones-tabla')
                    const boton = Dom.buildBoton({
                            texto: 'Cerrar mesa',
                            funClick: `${this.name}.cerrarMesaAsoc`,
                            idPadreEnDOM: idPadreEnDOM,
                            idDato: this.mesaAsoc.id,
                            clase: 'clase-boton-accion-tabla'
                        }
                    );
                    divBotones.appendChild(boton);
                };
            };
            //
            //  Renderiza total en una columna de un body de tabla.
            //
            Dom.renderColTabla({idTbody: idTbody, texto: `$ ${total}`, col: 7})
            //
        };
        //
        return consumos;
        //
    };


    //
    //  Llama a 'index" con información de evento.
    //
    static indexConEvento(evento) {
        evento.preventDefault();
        const idPadreEnDOM = evento.target.formTarget;
        const idMesa = evento.target.value;
        return this.index(idPadreEnDOM);
    };


    //
    //  Limpia formulario y mesa seleccionada.
    //
    static cancelIndex(evento) {
        evento.preventDefault();
        MesasController.idSeleccionada = 0;
        MesasController.indexConIconos('id-main');
        Dom.clearById('id-formulario');
        renderAyuda();
    };


    //
    //  Renderiza formulario con instancia vacía.
    //
    static new(evento) {
        //  Procesa evento.
        evento.preventDefault();
        const idPadreEnDOM = evento.target.formTarget
        const consumo = new Consumo();
        //  Mesa asociada
        if (!isNull(this.mesaAsoc)) {
            consumo.idMesa = this.mesaAsoc.id;
            consumo.mesa = this.mesaAsoc.descripcion;
        };
        //  Limpia y renderiza.
        Dom.clearById(idPadreEnDOM);
        return this.renderForm(consumo, idPadreEnDOM);
    };


    //
    //  Construye nueva instancia con formulario en DOM y persiste.
    //
    static create(evento) {
        evento.preventDefault();
        const nomForm = evento.target.formTarget;
        const consumoEnDOM = Dom.getObjectByForm(nomForm);
        const consumo = new Consumo(consumoEnDOM)
        if (consumo.save()) {
            this.index('id-formulario');
            this.updEstadoMesa();
            //
            Toastify({text: 'Consumo agregado...', duration: 3000}).showToast();
            //
        } else if (consumo._errores) {
            Dom.renderErrores({
                nomForm: nomForm,
                texto: consumo._errores}
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
        const consumo = Consumo.find(evento.target.value);
        const idPadreEnDOM = evento.target.formTarget;
        Dom.clearById(idPadreEnDOM);
        return this.renderForm(consumo, idPadreEnDOM);
    };


    //
    //  Construye instancia con formulario en DOM, busca en Store, actualiza y persiste.
    //
    static update(evento) {
        evento.preventDefault();
        const nomForm = evento.target.formTarget;
        const consumoEnDOM = Dom.getObjectByForm(nomForm);
        const consumo = Consumo.find(consumoEnDOM.id);
        if (consumo.updateAttributes(consumoEnDOM)) {
            this.index('id-formulario');
            this.updEstadoMesa();
            //  Toastify !!!
            Toastify({text: 'Consumo actualizado...', duration: 3000}).showToast();
            //
        } else if (consumo._errores) {
            Dom.renderErrores({
                nomForm: nomForm,
                texto: consumo._errores}
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
        //
        evento.preventDefault();
        //
        const consumo = Consumo.find(evento.target.value);
        //
        Swal.fire({
            title: '¿ Está seguro ?',
            text: `¿ Desea borrar: "${consumo.producto}" ?`,
            icon: "warning",
            showDenyButton: true,
            confirmButtonText: 'Si',
            denyButtonText: 'No'
        }).then((resultado) => {
            if (resultado.isConfirmed && consumo.destroy()) {
                //  Toastify !!!
                Toastify({text: 'Consumo borrado.', duration: 3000}).showToast();
                //
                this.index('id-formulario');
                this.updEstadoMesa();
                //
            }});
        //
    };


    //
    //  Borra consumo asociado
    //
    static borrarConsumoMesaAsoc() {
        //  NO hay mesa asociada ?
        if (!this.mesaAsoc) return false;
        //  Borra !!!
        this.index().forEach(
            (consumo) => {
                if (!Store.remove('Consumo' + consumo.id)) error = true
            }
        );
        return true;
    };


    //
    //  Cierra mesa asociada y graba registro de cierre.
    //
    static cerrarMesaAsoc(evento) {
        //
        evento.preventDefault();
        //
        Swal.fire({
            title: '¿ Está seguro ?',
            text: `¿ Cierra mesa "${this.mesaAsoc.descripcion}" ?`,
            icon: "warning",
            showDenyButton: true,
            confirmButtonText: 'Si',
            denyButtonText: 'No'
        }).then((resultado) => {
            if (resultado.isConfirmed) {
                //  Instancia nuevo objeto-CierreMesa.
                const cierre = new CierreMesa({
                        id: 0,
                        fecha: fechaAMD(),
                        idMesa: this.mesaAsoc.id,
                        mesa: this.mesaAsoc.descripcion,
                        mozo: this.mesaAsoc.mozo,
                        total: this.mesaAsoc.total
                    }
                );
                //
                if (cierre.save() && this.borrarConsumoMesaAsoc()) {
                    //  Cambia estado de mesa asociada y actualiza.
                    this.mesaAsoc.estado = 'disponible';
                    this.mesaAsoc.save();
                    MesasController.indexConIconos('id-main');
                    Dom.clearById('id-formulario');
                    CierresController.index('id-formulario');
                };
            }});
        //
    };


    //
    //  Renderiza formulario con correciones de edición.
    //
    static renderForm(consumo, idPadreEnDOM) {
        //  Render formulario
        const ret = Dom.renderForm(consumo, idPadreEnDOM, this.name);
        //  Id de mesa
        let input = Dom.get('consumo-' + consumo.id + '-idMesa');
        input.classList.add('clase-readonly');
        input.classList.add('clase-propiedad-id');
        input.readOnly = true;
        //  Nombre de mesa
        input = Dom.get('consumo-' + consumo.id + '-mesa');
        input.classList.add('clase-readonly');
        input.readOnly = true;
        //  Cantidad
        input = Dom.get('consumo-' + consumo.id + '-cantidad');
        input.classList.add('clase-propiedad-monto');
        input.addEventListener('change',
            (evento) => eval('updImporteEnDOM(evento, ' + consumo.id +')'));
        //  Precio
        input = Dom.get('consumo-' + consumo.id + '-precio');
        input.classList.add('clase-propiedad-monto');
        input.addEventListener('change',
            (evento) => eval('updImporteEnDOM(evento, ' + consumo.id +')'));
        //  Importe
        input = Dom.get('consumo-' + consumo.id + '-importe');
        input.classList.add('clase-readonly');
        input.classList.add('clase-propiedad-monto');
        input.readOnly = true;
        //
        return ret;
        //
    };


    //
    //  Actualiza el estado de la mesa asociada.
    //  Si hay consumo esta "abierta"
    //  Si NO hay consumo esta "disponible"
    //
    static updEstadoMesa() {
        if (!isNull(this.mesaAsoc)) {
            this.mesaAsoc.estado =
                (this.index().length > 0 ? 'abierta' : 'disponible');
            this.mesaAsoc.save();
            MesasController.indexConIconos('id-main');
        };
    };


    //
    //  Devuelve string con nombre y total de mejor mesa.
    //
    static mejorMesa() {
        //  Lee TODOS los consumos y los ordena por idMesa para corte de control.
        const consumos = Consumo.all();
        consumos.sort((consuA, consuB) => {
            (consuA.idMesa > consuB.idMesa ? 1 :
                (consuB.idMesa > consuA.idMesa ? -1 : 0))}
        );
        //
        const mejor = {descripcion: '', total: 0};
        //
        let total = 0;
        let idMesaAnt = 0;
        let mesaAnt = ''
        let consu = null;
        for (let i = 0; i < consumos.length; i++) {
            //
            consu = consumos[i];
            //  Corte de control
            if (consu.idMesa !== idMesaAnt) {
                if (idMesaAnt !== 0) {
                    if (total > mejor.total) {
                        mejor.descripcion = mesaAnt;
                        mejor.total = total;
                    }
                }
                total = 0;
                idMesaAnt = consu.idMesa;
                mesaAnt = consu.mesa;
            }
            total += consu.importe;
        };
        //
        if (total > mejor.total) {
            mejor.descripcion = mesaAnt;
            mejor.total = total;
        }
        //
        const ret = (mejor.descripcion ?
            `${mejor.descripcion} = $ ${mejor.total}` : 'No hay mesa.')
        //
        return ret;
        //
    };


    //
    //  Devuelve string con nombre y cantidad de mejor producto.
    //
    static mejorProducto() {
        //  Lee TODOS los consumos y los ordena por producto para corte de control.
        const consumos = Consumo.all();
        consumos.sort((consuA, consuB) => {
            return (consuA.producto.toUpperCase() > consuB.producto.toUpperCase() ? 1 :
                (consuB.producto.toUpperCase() > consuA.producto.toUpperCase() ? -1 : 0))}
        );
        //
        const mejor = {nombre: '', cantidad: 0};
        //
        let cantidad = 0;
        let prodAnt = '';
        let consu = null;
        for (let i = 0; i < consumos.length; i++) {
            //
            consu = consumos[i];
            //  Corte de control
            if (consu.producto.toUpperCase().trim() !== prodAnt.toUpperCase().trim()) {
                if (prodAnt !== '') {
                    if (cantidad > mejor.cantidad) {
                        mejor.nombre = prodAnt;
                        mejor.cantidad = cantidad;
                    }
                }
                cantidad = 0;
                prodAnt = consu.producto;
            }
            //
            cantidad += consu.cantidad;
            //
        };
        //
        if (cantidad > mejor.cantidad) {
            mejor.nombre = prodAnt;
            mejor.cantidad = cantidad;
        }
        //
        const ret = (mejor.nombre ?
            `${mejor.nombre} = ${mejor.cantidad} unidades.` : 'No hay producto.')
        //
        return ret;
        //
    };


    //
    //  Devuelve el total de consumo de mesa de parámetro.
    //
    static getTotalMesa(idMesa = 0){
        //  Valida.
        if (isNull(idMesa)) return 0;
        //  Lee TODOS los consumos y los filtra por mesa requerida.
        const consumos = Consumo.all().filter((consumo) =>
            consumo.idMesa === idMesa);
        //  Calcula total de consumo.
        let total = 0.00;
        consumos.forEach((consumo) => total += consumo.importe);
        //
        return total;
        //
    }

};


//
//  Actualiza importe con cantidad y precio en DOM
//
function updImporteEnDOM(evento, idConsumo) {
    evento.preventDefault();
    //  Captura cantidad.
    const cantidad = Dom.get('consumo-' + idConsumo + '-cantidad');
    //  Captura precio.
    const precio = Dom.get('consumo-' + idConsumo + '-precio');
    //  Captura importe.
    const importe = Dom.get('consumo-' + idConsumo + '-importe');
    importe.value = Math.round(Number(cantidad.value) * Number(precio.value) * 100) / 100;
};
