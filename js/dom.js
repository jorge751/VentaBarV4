//
//  *****************************************************************
//
//                 E L E M E N T O S    E N    D O M
//
//  *****************************************************************
//

class Dom {

    //
    //  Contador de avance de elementos renderizados.
    //
    static lastClave = 0;


    //
    //  Devuelve true si existe el elemento con id de parámetro.
    //
    static get(id, mostrarError) {
        const ret = !isNull(id) && document.getElementById(id);
        if (!ret && mostrarError)
            alertError('Dom.get(): No se encuentra id: "' + id + '".')
        return ret;
    }


    //
    //  Devuelve elemento creeado en el DOM
    //
    static create(tipo) {
        return document.createElement(tipo);
    }


    //
    //  Actualiza contador de avance y devuelve próxima clave.
    //
    static nextClave() {
        this.lastClave = this.lastClave + 1;
        return this.lastClave;
    };


    //
    //  Construye y devuelve DIV.
    //  Se configura con objeto de parámetro.
    //
    static buildDiv(cfg) {
        const ret = this.create('div');
        ret.id = cfg.id ?? '';
        ret.classList.add(cfg.clase);
        return ret;
    };


    //
    //  Construye y devuelve SPAN.
    //  Se configura con objeto de parámetro.
    //
    static buildSpan(cfg) {
        const ret = this.create('span');
        ret.id = cfg.id ?? '';
        ret.classList.add(cfg.clase ?? '""');
        ret.textContent = cfg.texto ?? '';
        return ret;
    };


    //
    //  Devuelve botón con objeto cfgurador de parámetro.
    //
    static buildBoton(cfg) {
        const boton = this.create('button');
        boton.textContent = cfg.texto ?? 'Botón';
        if (cfg.funClick) boton.addEventListener('click',
            (evento) => eval(cfg.funClick + '(evento)'));
        boton.formTarget = cfg.idPadreEnDOM ?? '';
        boton.value = cfg.idDato ?? 0;
        boton.classList.add(cfg.clase ?? '""');
        boton.classList.add('btn');
        boton.classList.add('btn-sm');
        boton.classList.add('btn-primary');
        return boton;
    };


    //
    //  Renderiza un icono en DOM con objeto cfgurador.
    //
    static renderIcono(cfg) {
        //  Div del ícono
        const divIcono = this.create('div')
        divIcono.id = 'div-icono-' + cfg.sufijoId;
        divIcono.classList.add(cfg.claseDivIcono);
        //  Acción
        divIcono.onclick = () => eval(cfg.funClick);
        //  Imagen
        const imagen = this.create('img')
        imagen.id = 'img-icono-' + cfg.sufijoId;
        imagen.src = cfg.srcImagen;
        imagen.classList.add(cfg.claseImagen);
        //  Texto sobre imagen
        const divTexto = this.create('div')
        divTexto.id = 'texto-icono-' + cfg.sufijoId;
        divTexto.innerHTML = '<br>' + cfg.texto;
        divTexto.classList.add(cfg.claseDivTexto);
        divTexto['data-toggle'] = 'tooltip';
        divTexto['title'] = 'Editar cosumo';
        //  Apendiza a div
        divIcono.appendChild(imagen);
        divIcono.appendChild(divTexto);
        //  Apendiza al padre
        const padre = this.get(cfg.idPadreEnDOM);
        padre.appendChild(divIcono);
    };


    //
    //  Renderiza tabla de datos con "arrObjetos".
    //  Se cfgura con objeto "cfg".
    //  Devuelve id de tabla.
    //
    static renderTabla(cfg) {
        //  Valida parámetros.
        if (!isArray(cfg.arrObjetos) || !this.get(cfg.idPadreEnDOM) ||
                !isArray(cfg.propiedades, 'no_vacio'))
            return alertError('Dom.renderTabla(): Error en parámertos.');
        //  Tabla
        const tabla = this.create('table');
        tabla.id = 'id-tabla-' + this.nextClave();
        tabla.border = '1'
        tabla.classList.add('clase-tabla');
        tabla.classList.add('table-bordered');
        //  Título
        const caption = tabla.createCaption()
        caption.align = 'top';
        caption.innerHTML = cfg.titulo +
            (cfg.addCaption ? '<br> ' + cfg.addCaption : '');
        //  Variables para construcción
        let fila, columna, extra;
        //  Head con fila de encabezado
        const thead = tabla.createTHead();
        fila = thead.insertRow(-1);
        cfg.propiedades.forEach((p) => {
            columna = this.create('th');
            columna.innerHTML = capitalize(p);
            fila.appendChild(columna)}
        );
        thead.appendChild(fila);
        tabla.appendChild(thead);
        //
        //  Body con filas de datos
        const tbody = tabla.createTBody();
        if (cfg.idTbody) tbody.id = cfg.idTbody;
        //
        cfg.arrObjetos.forEach((dato) => {
            //  Nueva fila en el body
            fila = tbody.insertRow(-1);
            //  Columnas con campos de dato
            cfg.propiedades.forEach((propiedad) => {
                columna = this.create('td');
                columna.textContent = dato[propiedad];
                columna.classList.add('clase-dato-tabla-' + typeof(dato[propiedad]));
                fila.appendChild(columna)}
            );
            //  Columna con acciones
            columna = this.create('td');
            //  Botón "Editar"
            if (cfg.funClickEitar) {
                columna.appendChild(
                    this.buildBoton({
                        texto: 'Editar',
                        funClick: cfg.funClickEitar,
                        idPadreEnDOM: cfg.idPadreEnDOM,
                        idDato: dato['id'],
                        clase: 'clase-boton-tabla'}
                    )
                );
            };
            //  Botón "Borrar"
            if (cfg.funClickBorrar) {
                columna.appendChild(
                    this.buildBoton({
                        texto: 'Borrar',
                        funClick: cfg.funClickBorrar,
                        idPadreEnDOM: cfg.idPadreEnDOM,
                        idDato: dato['id'],
                        clase: 'clase-boton-tabla'}
                    )
                );
            };
            //  Botón extra
            if (cfg.funClickExtra) {
                extra = this.buildBoton({
                    texto: cfg.textoBtnExtra,
                    funClick: cfg.funClickExtra,
                    idPadreEnDOM: cfg.idPadreEnDOM,
                    idDato: dato['id'],
                    clase: 'clase-boton-tabla'}
                )
                extra['data-toggle'] = 'tooltip';
                extra['title'] = cfg.toolTipBtnExtra;
                columna.appendChild(extra);
            };
            //  Apendiza columna a la fila
            fila.appendChild(columna)
            //  Apendiza fila al body
            tbody.appendChild(fila)}
        );
        //  Apendiza body a la tabla
        tabla.appendChild(tbody);
        //  Div para botones de acciones
        const divBotones = this.buildDiv({
            id: 'id-div-botones-acciones-tabla',
            clase: 'clase-div-botones-acciones-tabla'}
        );
        //  Botón "Agregar"
        if (cfg.funClickAgregar) {
            divBotones.appendChild(
                this.buildBoton({
                        texto: 'Agregar',
                        funClick: cfg.funClickAgregar,
                        idPadreEnDOM: cfg.idPadreEnDOM,
                        clase: 'clase-boton-accion-tabla'
                    }
                )
            );
        };
        //  Botón "Cancelar"
        divBotones.appendChild(
            this.buildBoton({
                    texto: 'Cancelar',
                    funClick: cfg.funClickCancelar ?? 'Dom.clearByIdConEvento',
                    idPadreEnDOM: cfg.idPadreEnDOM,
                    clase: 'clase-boton-accion-tabla'
                }
            )
        );
        //  Apendiza tabla y botones al padre
        const padre = this.get(cfg.idPadreEnDOM);
        padre.appendChild(tabla);
        padre.appendChild(divBotones);
        return tabla.id;
    };


    //
    //  Renderiza columna en body de tabla.
    //
    static renderColTabla(cfg) {
        //  Busca body.
        const tbody = this.get(cfg.idTbody);
        //  Renderiza columnas vacías.
        const tr = this.create('tr');
        let th;
        for (let i = 0; i < cfg.col-1; i++) {
            th = this.create('th');
            tr.appendChild(th);
        }
        //  Renderiza columna destino.
        th = this.create('th');
        th.textContent = cfg.texto;
        tr.appendChild(th);
        //  Apendiza al body.
        tbody.appendChild(tr);
    };


    //
    //  Renderiza formulario con instancia de clase.
    //
    static renderForm(instancia, idPadreEnDOM, controlador, readonly) {
        //  Nombre de clase
        const nomClase = instancia.constructor.name;
        //  Formulario
        const form = this.create('form');
        form.name = nomClase + '-' + instancia.id;
        form.id = nomClase + '-' + instancia.id;
        form.classList.add('clase-form-instancia');
        //  Título
        const titulo = this.create('h3');
        titulo.textContent = (isNull(instancia.id) ? 'Agregar' : 'Actualizar') +
            ' ' + nomClase;
        form.appendChild(titulo);
        //
        //  Renderiza dupla de etiqueta y dato para cada propiedad.
        let idPropEnDOM, divDupla, label, input;
        const prefijo = instancia.constructor.name.toLowerCase()
        for (const propiedad in instancia) {
            //  Id de la dupla
            idPropEnDOM = prefijo + '-' + instancia.id + '-' + propiedad;
            //  Div dupla de etiqueta y dato
            divDupla = this.create('div');
            divDupla.classList.add('clase-div-dupla')
            //  Etiqueta
            label = this.create('label');
            label.for = idPropEnDOM;
            label.textContent = propiedad + ': ';
            divDupla.appendChild(label);
            //  Dato
            input = this.create('input');
            input.id = idPropEnDOM;
            input.name = propiedad;
            input.value = instancia[propiedad];
            input.type = 'text';
            //  Configura propiedad id
            if (propiedad === 'id') {
                input.classList.add('clase-propiedad-id');
                input.classList.add('clase-readonly');
                input.readOnly = true;
            };
            //  formulario readonly ?
            if (readonly) input.classList.add('clase-readonly');
            //  Apendiza input al div y el div al formulario
            divDupla.appendChild(input);
            form.appendChild(divDupla);
        }
        //
        //  Div para botones de acciones
        const divBotones = this.create('div');
        divBotones.classList.add('clase-div-botones');
        //  Botón submit
        divBotones.appendChild(
            this.buildBoton({
                texto: (isNull(instancia.id) ? 'Agregar' : 'Actualizar'),
                funClick: `${controlador}.${(isNull(instancia.id) ? 'create' : 'update')}`,
                idPadreEnDOM: form.name,
                idDato: instancia.id})
        );
        //  Botón "Cancelar"
        divBotones.appendChild(
            this.buildBoton({
                texto: 'Cancelar',
                funClick: `${controlador}.indexConEvento`,
                idPadreEnDOM: idPadreEnDOM,
                idDato: instancia.id})
        );
        //  Apendiza div de botones al form
        form.appendChild(divBotones);
        //  Apendiza formulario al padre
        const padre = this.get(idPadreEnDOM);
        padre.appendChild(form);
    };


    //
    //  Renderiza errores en form
    //
    static renderErrores(cfg) {
        //  Formulario
        const form = this.get(cfg.nomForm);
        //  Id del div para ererores
        const idDivErrores = `${cfg.nomForm}-errores`
        //  Si existe, remueve div.
        let divErrores = this.get(idDivErrores);
        if (divErrores) form.removeChild(divErrores);
        //  Crea y construye.
        divErrores = this.create('div');
        divErrores.id = idDivErrores;
        divErrores.textContent = cfg.texto;
        divErrores.classList.add('clase-div-errores-en-form');
        //  Apendiza al formulario.
        form.appendChild(divErrores);
    }


    //
    //  Devuelve objeto construido con inputs de formulario en DOM.
    //  'nomForm': Nombre de form requerido.
    //
    static getObjectByForm(nomForm) {
        const ret = {};
        const formEnDOM = document.forms[nomForm];
        for (let i = 0; i < formEnDOM.length; i++) {
            if (formEnDOM[i].nodeName === "INPUT" &&
                    (formEnDOM[i].type === "text" || formEnDOM[i].type === "date")) {
                ret[formEnDOM[i].name] = formEnDOM[i].value
            };
        };
        return ret;
    };
    

    //
    //  Limpia HTML interior con id de elemento de parámetro
    //  Devuelve true si logra limpiar.
    //
    static clearById(id) {
        const elemento = this.get(id);
        if (!isObject(elemento)) return alertError(`Dom.clearById(id): No se encuentra elemento: "${id}".`, false)
        elemento.innerHTML = '';
        return true;
    };

    //
    //  Llama a 'clearById" con información de evento.
    //
    static clearByIdConEvento(evento) {
        evento.preventDefault();
        const idEnDOM = evento.target.formTarget;
        this.clearById(idEnDOM);
    };

};
