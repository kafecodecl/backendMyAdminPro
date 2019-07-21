/**
 * Este archivo es el punto de entrada a la aplicación backend
 */

//***********************************************************************/
//Required, son las importaciones necesarias para que funcione express
//***********************************************************************/
var express = require('express'); // cargo la libreria de express
var mongoose = require('mongoose'); //libreria mongoose para trabajar con mongo db
var DB_CONN_URL = require('./config/config').DB_CONN_URL;


//***********************************************************************/
// Inicialización de variables
//***********************************************************************/
var app = express();

//***********************************************************************/
// Habilitar el CORS para peticiones de otros dominios
//***********************************************************************/
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
    );
    res.header("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS");
    next();
});

//***********************************************************************/
// Importar rutas
//***********************************************************************/
var appRoutes = require('./routes/app');
var usuarioRoutes = require('./routes/usuario');
var hospitalRoutes = require('./routes/hospital');
var MedicosRoutes = require('./routes/medico');
var BusquedaRoutes = require('./routes/busqueda');
var UploadRoutes = require('./routes/upload');
var ImagenesRoutes = require('./routes/imagenes');
var loginRoutes = require('./routes/login');

//Server index config
// var serveIndex = require('serve-index');
// app.use(express.static(__dirname + '/'))
// app.use('/upload', serveIndex(__dirname + '/upload'));



//Uso de rutas
app.use('/hospital', hospitalRoutes);
app.use('/medico', MedicosRoutes);
app.use('/usuario', usuarioRoutes);
app.use('/login', loginRoutes);
app.use('/busqueda', BusquedaRoutes);
app.use('/img', ImagenesRoutes);
app.use('/upload', UploadRoutes);

app.use('/', appRoutes);

//Conexion a la base de datos mongodb
mongoose.connection.openUri(DB_CONN_URL, (err, res) => {

    //Valido si hay algun error de conexion
    if (err) { console.log('ERROR, ', err); throw err; }

    console.log('Servidor base de datos OK puerto 27017, online');

});





//***********************************************************************/
// Escuchar peticiones
//***********************************************************************/
app.listen(3000, () => {
    console.log('Servidor express corriendo en el puerto 3000, online');
});