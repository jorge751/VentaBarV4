//
//  *****************************************************************
//
//                 P R O C E S O    P R I N C I P A L
//
//  *****************************************************************
//


//
//  Mesas iniciales
//
let mesa;
if (!Store.get('lastIdMesa')) {
    Toastify({text: 'Mesas iniciales...', duration: 3000}).showToast();
    new Mesa({id: 1, descripcion: 'Jardin: mesa 1', mozo: 'Ramiro', estado: 'abierta'}).save();
    new Mesa({id: 2, descripcion: 'Salon: mesa 1', mozo: 'Guadalupe', estado: 'abierta'}).save();
    new Mesa({id: 3, descripcion: 'Patio: mesa 1', mozo: 'Fabricio', estado: 'abierta'}).save();
    Store.set('lastIdMesa', 3);
};
MesasController.indexConIconos('id-main');
    
//
//  Consumos iniciales
//
if (!Store.get('lastIdConsumo')) {
    Toastify({text: 'Consumo inicial...', duration: 3000}).showToast();
    new Consumo({id: 1, idMesa: 1, mesa: 'Jardin: mesa 1', producto: 'Milanesa', cantidad: 1, precio: 600.00, importe: 600.00}).save();
    new Consumo({id: 2, idMesa: 2, mesa: 'Salon: mesa 1', producto: 'Lomito', cantidad: 1, precio: 700.00, importe: 700.00}).save();
    new Consumo({id: 3, idMesa: 3, mesa: 'Patio: mesa 1', producto: 'Hamburguesa', cantidad: 1, precio: 500.00, importe: 500.00}).save();
    Store.set('lastIdConsumo', 3);
};

//
//  Reservas iniciales
//
const ret = ReservasController.index()
    .then((reservas) => {
        if (isNull(reservas)) {
            Toastify({text: 'Reservas iniciales...', duration: 3000}).showToast();
            new Reserva({fecha: fechaAMD(), hora: 20, descripcion: 'Flia. Pereyra'}).save();
            new Reserva({fecha: fechaAMD(), hora: 21, descripcion: 'Club de truco'}).save();
            new Reserva({fecha: fechaAMD(), hora: 22, descripcion: 'Cumple de jorge'}).save();
        };
    })

//
//  Configuración de eventos
//
window.onload = function() {

    let opcion = Dom.get('menu-agregar-mesa');
    //opcion.title = 'id-formulario';
    opcion.onclick = (evento) => MesasController.new(evento, 'id-formulario');

    opcion = Dom.get('menu-ver-mesas');
    opcion.onclick = (evento) => MesasController.index('id-formulario');

    opcion = Dom.get('menu-ver-consumos');
    opcion.onclick = (evento) => ConsumosController.index('id-formulario', 'all');

    opcion = Dom.get('menu-ver-recaudacion');
    opcion.onclick = (evento) => CierresController.index('id-formulario');

    opcion = Dom.get('menu-ver-reservas');
    opcion.onclick = (evento) => ReservasController.index('id-formulario');

    opcion = Dom.get('menu-ver-ayuda');
    opcion.onclick = (evento) => renderAyuda();

    opcion = Dom.get('id-logo');
    opcion.onclick = (evento) => window.open('https://github.com/jorge751', '_blank');

    renderAyuda()

    renderInfoPie()

};
