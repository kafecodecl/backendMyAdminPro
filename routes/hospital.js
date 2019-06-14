//Zona de importaciones
var express = require('express'); // cargo la libreria de express
var app = express();
var bodyParser = require('body-parser');
var bcrypt = require('bcryptjs'); //Para encriptación de una sola vía de la contraseña de usuario
var mdAutenticacion = require('../middleware/autenticacion'); //Se importa el middelware autenticacion para verificar el token

//importamos el modelo de usuarios
var Hospital = require('../models/hospital');

//configuracion del body parser
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


app.get('/', (req, res) => {

    //Respuesta, con formato json
    res.status(200).json({
        ok: true,
        mensaje: 'Petición hospital realizada correctamente.'
    });

});


module.exports = app;
