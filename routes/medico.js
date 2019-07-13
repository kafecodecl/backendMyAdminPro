//Zona de importaciones
var express = require('express'); // cargo la libreria de express
var app = express();
var bodyParser = require('body-parser');
var bcrypt = require('bcryptjs'); //Para encriptación de una sola vía de la contraseña de usuario
var mdAutenticacion = require('../middleware/autenticacion'); //Se importa el middelware autenticacion para verificar el token

//importamos el modelo de medico
var Medico = require('../models/medico');

//configuracion del body parser
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


//***********************************************************************/
// Obtener todos los medicos
//***********************************************************************/
app.get('/', (req, res, next) => {

    //Realizo una búsqueda de usuarios
    Medico.find({})
        .exec(
            (err, medicos) => {

                //Valido si ocurre algun error en la bd
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando medicos.',
                        errors: err
                    });
                }

                //SI todo eestá OK
                //Respuesta, con formato json
                res.status(200).json({
                    ok: true,
                    medicos: medicos
                });


            });

});


module.exports = app;