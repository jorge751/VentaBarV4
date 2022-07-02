//
//  *****************************************************************
//
//                         F U N C I O N E S
//
//  *****************************************************************
//


//
//  Luxon !!!
//
const DateTime = luxon.DateTime;


//
//	Datos de la conexión con la nube.
//
const URL_BASE = 'https://ventabarv4-default-rtdb.firebaseio.com/';


//
//  Devuelve array con claves del objeto de parámetro.
//
function getClaves(paramObj = new Object()) {
    return Object.keys(paramObj);
};


//
//  Devuelve string con primera letra en mayúscula.
//
function capitalize(cadena = '') {
    cadena = String(cadena);
    return cadena[0].toUpperCase() + cadena.slice(1);
};


//
//  Devuelve true si es array con datos.
//
function isArray(param, noVacio = false) {
    return Array.isArray(param) && (noVacio ? param.length !== 0 : true);
};


//
//  Muestra error en un alert().
//
function alertError(texto, ret) {
    texto = String(texto);
    ret = (isNull(ret) ? null : ret);
    alert(texto);
    return ret;
};


//
//  Devuelve fecha en string con formato YYYY-MM-DD con LUXON !!!!!.
//
function fechaAMD(fecha = DateTime.now()) {
    let mes = fecha.month;
    mes = (mes < 10 ? '0' + mes : mes);
    let dia = fecha.day;
    dia = (dia < 10 ? '0' + dia : dia);
    return  `${fecha.year}-${mes}-${dia}`;
};


//
//  Devuelve true si el parámetro es un objeto no nulo.
//
function isObject(objecto) {
    return (typeof(objecto) === 'object' && objecto !== null);
};


//
//  Devuelve true si el parámtero es inútil.
//
function isNull(value) {
    return (value === null ||
        value === undefined ||
            String(value).trim() === '' ||
                Number(value) === 0 ||
                    (Array.isArray(value) && value.length == 0))
};


//
//  Renderiza ayuda en div "id-formulario".
//
function renderAyuda() {
    //
    Toastify({text: 'Uso del sistema...', duration: 3000}).showToast();
    //
	const idPadreEnDom = 'id-formulario';
    Dom.clearById(idPadreEnDom);
    //
	const iframe = Dom.create('iframe');
	iframe.id = 'id-iframe-ayuda';
	iframe.src = '../assets/_ayuda.html';
    //
	Dom.get(idPadreEnDom).appendChild(iframe);
    //
};


//
//  Renderiza información rotativa en el pie.
//
function renderInfoPie() {
    //
    //  Funciones rotativas
    const funciones = [
        {descripcion: 'Mesa con mayor consumo: ',
            funcion: 'ConsumosController.mejorMesa()'},
        {descripcion: 'Producto más vendido: ',
            funcion: 'ConsumosController.mejorProducto()'},
        {descripcion: 'Mozo con mayor venta: ',
            funcion: 'MesasController.mejorMozo()'}
    ]
    //
    const idPieEnDOM = 'id-pie';
    const pieEnDOM = Dom.get(idPieEnDOM);
    //
    let i = 0;
    let span = null;
    //
    setInterval(() => {
        //
        Dom.clearById(idPieEnDOM);
        //
        //  Nombre de función.
        span = Dom.buildSpan({
            texto: funciones[i].descripcion,
            clase: 'clase-span-pie-descripcion-funcion'})
        pieEnDOM.appendChild(span);
        //
        //  Resultado de función.
        span = Dom.buildSpan({
            texto: eval(funciones[i].funcion),
            clase: 'clase-span-pie-funcion'})
        pieEnDOM.appendChild(span);
        //
        i++;
        if (i > funciones.length - 1) i = 0;
        //
    }, 5000);
    //
};

function delay(segundos = 0) {
    return new Promise((resolve) => {
        setTimeout(resolve, segundos * 1000);
    });
}
