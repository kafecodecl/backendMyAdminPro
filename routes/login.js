//Zona de importaciones
var express = require('express'); // cargo la libreria de express
var app = express(); //utilizar express
var bodyParser = require('body-parser'); //para obtener los valores ingresados en el body
var bcrypt = require('bcryptjs'); //Para encriptación de una sola vía de la contraseña de usuario
var jwt = require('jsonwebtoken');
var Usuario = require('../models/usuario');
var SEED = require('../config/config').SEED;

//configurar bodyparse
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


//***********************************************************************/
// Método Login
//***********************************************************************/
app.post('/', (req, res) => {

    //Variable para obtener los datos del body
    var body = req.body;

    //1. Verificar si el usuario existe (email)
    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {

        //Valido si ocurre algun error en la bd
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario ' + body.email,
                errors: err
            });
        }

        //valido si el usuario existe
        if (!usuarioDB) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error, creadenciales incorrectas - email',
                errors: err
            });
        }

        //verifico la contraseña
        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error, creadenciales incorrectas - password',
                errors: err
            });
        }

        //2. Crear un token (JWT)
        //params: 1. la data que quiero colocar en el token, 2. un SEED para hacer el token unico, 3. FEcha de expiración del token
        var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 }); //expiración 4 horas 


        //Si el usuario existe
        usuarioDB.password = ':)'; //ocultar la contraseña del token

        res.status(200).json({
            ok: true,
            usuario: usuarioDB,
            token: token,
            id: usuarioDB._id
        });

    });



});



module.exports = app;