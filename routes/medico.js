//Zona de importaciones
var express = require('express'); // cargo la libreria de express
var app = express();
var bodyParser = require('body-parser');
var mdAutenticacion = require('../middleware/autenticacion'); //Se importa el middelware autenticacion para verificar el token

//importamos el modelo de medicos
var Medico = require('../models/medico');


//configuracion del body parser
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


//***********************************************************************/
// Obtener todos los medicos
//***********************************************************************/
app.get('/', (req, res, next) => {

    //Variable desde, que permite indicar desde que numero de registro mostrar 
    //con la funcion limmit
    var desde = req.query.desde || 0;
    desde = Number(desde);

    //Realizo una búsqueda de medicos
    Medico.find({})
        .skip(desde) //skip se saltará los primeros 'desde' registros
        .limit(5) // mostrará lso siguientes 5 regsitros despues del skip
        .populate('usuario', 'nombre email')
        .populate('hospital')
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
                Medico.count({}, (err, conteo) => {

                    if (err) {
                        return res.status(500).json({
                            ok: false,
                            mensaje: 'Error cargando hospitales (conteo).',
                            errors: err
                        });
                    }

                    res.status(200).json({
                        ok: true,
                        medicos: medicos,
                        conteo: conteo
                    });


                });


            });

});



//***********************************************************************/
// Actualizar un medico
//***********************************************************************/
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {

    //Obtengo el id a  actualizar
    var id = req.params.id;
    var body = req.body;

    Medico.findById(id, (err, medico) => {

        //Manejo de posible error
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar medico.',
                errors: err
            });
        }

        //Si no existe el medico envio error 400
        if (!medico) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El medico ID: ' + id + ' no existe',
                errors: { message: 'No existe un medico con el id enviado' }
            });
        }

        //Si todo está OK
        medico.nombre = body.nombre;
        medico.usuario = req.usuario._id;
        medico.hospital = body.hospital;

        //Guardo los cambios
        medico.save((err, medicoActualizado) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar el medico id: ' + id,
                    errors: err
                });
            }

            //si todo esta OK
            res.status(200).json({
                ok: true,
                medico: medicoActualizado,
                medicoToken: req.medico,
                hospital: medicoActualizado.hospital
            });
        });


    });

});

//***********************************************************************/
// Crear un medico
//***********************************************************************/
app.post('/', mdAutenticacion.verificaToken, (req, res) => {

    var body = req.body;

    //Para insertar el medico
    //1. hago referencia al modelo Medico
    var medico = new Medico({
        nombre: body.nombre,
        usuario: req.usuario._id,
        hospital: body.hospital
    });

    //2. para guardar el medico
    medico.save((err, medicoGuardado) => {

        //Manejo de posible error
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear medico.',
                errors: err
            });
        }

        //si todo esta OK
        res.status(201).json({
            ok: true,
            medico: medicoGuardado,
            medicoToken: req.medico
        });


    });

});

//***********************************************************************/
// Eliminar un medico por id
//***********************************************************************/
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;

    Medico.findByIdAndRemove(id, (err, medicoBorrado) => {
        //Manejo de posible error
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar medico.',
                errors: err
            });
        }

        //Si no existe el medico envio error 400
        if (!medicoBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El medico ID: ' + id + ' no existe',
                errors: { message: 'No existe un medico con el id enviado' }
            });
        }

        //si todo esta OK
        res.status(200).json({
            ok: true,
            medico: medicoBorrado,
            medicoToken: req.medico
        });
    });

});

module.exports = app;