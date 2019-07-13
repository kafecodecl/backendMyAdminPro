//Zona de importaciones
var express = require('express'); // cargo la libreria de express
var app = express();
var bodyParser = require('body-parser');
var bcrypt = require('bcryptjs'); //Para encriptación de una sola vía de la contraseña de hospital
var mdAutenticacion = require('../middleware/autenticacion'); //Se importa el middelware autenticacion para verificar el token

//importamos el modelo de hospitals
var Hospital = require('../models/hospital');

//configuracion del body parser
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


//***********************************************************************/
// Obtener todos los hospitales
//***********************************************************************/
app.get('/', (req, res, next) => {

    //Realizo una búsqueda de hospitals
    Hospital.find({})
        .exec(
            (err, hospitales) => {

                //Valido si ocurre algun error en la bd
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando hospitales.',
                        errors: err
                    });
                }

                //SI todo eestá OK
                //Respuesta, con formato json
                res.status(200).json({
                    ok: true,
                    hospitales: hospitales
                });


            });

});

//***********************************************************************/
// Actualizar un hospital
//***********************************************************************/
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {

    //Obtengo el id a  actualizar
    var id = req.params.id;
    var body = req.body;

    Hospital.findById(id, (err, hospital) => {



        //Manejo de posible error
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar hospital.',
                errors: err
            });
        }

        //Si no existe el hospital envio error 400
        if (!hospital) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El hospital ID: ' + id + ' no existe',
                errors: { message: 'No existe un hospital con el id enviado' }
            });
        }

        //Si todo está OK
        hospital.nombre = body.nombre;
        hospital.email = body.email;
        hospital.role = body.role;

        //Guardo los cambios
        hospital.save((err, hospitalActualizado) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar el hospital id: ' + id,
                    errors: err
                });
            }

            //si todo esta OK

            //Escondo el password
            hospitalActualizado.password = ":)";

            res.status(200).json({
                ok: true,
                hospital: hospitalActualizado,
                hospitalToken: req.hospital
            });
        });


    });

});



module.exports = app;