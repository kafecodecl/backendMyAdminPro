var express = require('express'); // cargo la libreria de express
var app = express();

//***********************************************************************/
// Rutas, peticiones
//***********************************************************************/
app.get('/', (req, res, next) => {

    //Respuesta, con formato json
    res.status(200).json({
        ok: true,
        mensaje: 'Petición realizada correctamente.'
    });

});

module.exports = app;