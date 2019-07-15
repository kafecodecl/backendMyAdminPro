//Zona de importaciones
var express = require('express'); // cargo la libreria de express
var app = express();
var bodyParser = require('body-parser');
var mdAutenticacion = require('../middleware/autenticacion'); //Se importa el middelware autenticacion para verificar el token

//importamos el modelo de hospitales
var Hospital = require('../models/hospital');


//configuracion del body parser
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


//***********************************************************************/
// Obtener todos los hospitales
//***********************************************************************/
app.get('/', (req, res, next) => {

    //Variable desde, que permite indicar desde que numero de registro mostrar 
    //con la funcion limmit
    var desde = req.query.desde || 0;
    desde = Number(desde);

    //Realizo una búsqueda de hospitales
    Hospital.find({})
        .skip(desde)//skip se saltará los primeros 'desde' registros
        .limit(5)// mostrará lso siguientes 5 regsitros despues del skip
        // la función populate() de mongoose permite obtener la información de unba tabla relacionada
        .populate('usuario', 'nombre email') 
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
                Hospital.count({}, (err, conteo) => {

                    if (err) {
                        return res.status(500).json({
                            ok: false,
                            mensaje: 'Error cargando hospitales (conteo).',
                            errors: err
                        });
                    }

                    res.status(200).json({
                        ok: true,
                        hospitales: hospitales
                    });

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
        hospital.usuario = req.usuario._id;

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
            res.status(200).json({
                ok: true,
                hospital: hospitalActualizado,
                hospitalToken: req.hospital
            });
        });


    });

});

//***********************************************************************/
// Crear un hospital
//***********************************************************************/
app.post('/', mdAutenticacion.verificaToken, (req, res) => {

    var body = req.body;

    //Para insertar el hospital
    //1. hago referencia al modelo Hospital
    var hospital = new Hospital({
        nombre: body.nombre,
        usuario: req.usuario._id
    });

    //2. para guardar el hospital
    hospital.save((err, hospitalGuardado) => {

        //Manejo de posible error
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear hospital.',
                errors: err
            });
        }

        //si todo esta OK
        res.status(201).json({
            ok: true,
            hospital: hospitalGuardado,
            hospitalToken: req.hospital
        });


    });

});

//***********************************************************************/
// Eliminar un hospital por id
//***********************************************************************/
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;

    Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {
        //Manejo de posible error
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar hospital.',
                errors: err
            });
        }

        //Si no existe el hospital envio error 400
        if (!hospitalBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El hospital ID: ' + id + ' no existe',
                errors: { message: 'No existe un hospital con el id enviado' }
            });
        }

        //si todo esta OK
        res.status(200).json({
            ok: true,
            hospital: hospitalBorrado,
            hospitalToken: req.hospital
        });
    });

});

module.exports = app;