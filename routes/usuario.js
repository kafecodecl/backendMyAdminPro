//Zona de importaciones
var express = require('express'); // cargo la libreria de express
var app = express();
var bodyParser = require('body-parser');
var bcrypt = require('bcryptjs'); //Para encriptación de una sola vía de la contraseña de usuario
var mdAutenticacion = require('../middleware/autenticacion'); //Se importa el middelware autenticacion para verificar el token

//importamos el modelo de usuarios
var Usuario = require('../models/usuario');


//configuracion del body parser
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


//***********************************************************************/
// Obtener todos los usuarios
//***********************************************************************/
app.get('/', (req, res, next) => {

    //Variable desde, que permite indicar desde que numero de registro mostrar 
    //con la funcion limmit
    var desde = req.query.desde || 0;
    desde = Number(desde);

    //Realizo una búsqueda de usuarios
    Usuario.find({}, 'nombre email img role google')
        .skip(desde) //skip se saltará los primeros 'desde' registros
        .limit(5) // mostrará lso siguientes 5 regsitros despues del skip
        .exec(
            (err, usuarios) => {

                //Valido si ocurre algun error en la bd
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando usuarios.',
                        errors: err
                    });
                }

                //SI todo eestá OK
                //Respuesta, con formato json
                Usuario.count({}, (err, conteo) => {

                    if (err) {
                        return res.status(500).json({
                            ok: false,
                            mensaje: 'Error cargando usuarios (conteo).',
                            errors: err
                        });
                    }

                    res.status(200).json({
                        ok: true,
                        usuarios: usuarios,
                        total: conteo
                    });

                });



            });

});



//***********************************************************************/
// Actualizar un usuario
//***********************************************************************/
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {

    //Obtengo el id a  actualizar
    var id = req.params.id;
    var body = req.body;

    Usuario.findById(id, (err, usuario) => {



        //Manejo de posible error
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario.',
                errors: err
            });
        }

        //Si no existe el usuario envio error 400
        if (!usuario) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El usuario ID: ' + id + ' no existe',
                errors: { message: 'No existe un usuario con el id enviado' }
            });
        }

        //Si todo está OK
        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;

        //Guardo los cambios
        usuario.save((err, usuarioActualizado) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar el usuario id: ' + id,
                    errors: err
                });
            }

            //si todo esta OK

            //Escondo el password
            usuarioActualizado.password = ":)";

            res.status(200).json({
                ok: true,
                usuario: usuarioActualizado,
                usuarioToken: req.usuario
            });
        });


    });

});

//***********************************************************************/
// Crear un usuario
//***********************************************************************/
app.post('/', (req, res) => {

    var body = req.body;

    //Para insertar el usuario
    //1. hago referencia al modelo Usuario
    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });

    //2. para guardar el usuario
    usuario.save((err, usuarioGuardado) => {

        //Manejo de posible error
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear usuario.',
                errors: err
            });
        }

        //si todo esta OK
        res.status(201).json({
            ok: true,
            usuario: usuarioGuardado,
            usuarioToken: req.usuario
        });


    });

});

//***********************************************************************/
// Eliminar un usuario por id
//***********************************************************************/
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;

    Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
        //Manejo de posible error
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar usuario.',
                errors: err
            });
        }

        //Si no existe el usuario envio error 400
        if (!usuarioBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El usuario ID: ' + id + ' no existe',
                errors: { message: 'No existe un usuario con el id enviado' }
            });
        }

        //si todo esta OK
        res.status(200).json({
            ok: true,
            usuario: usuarioBorrado,
            usuarioToken: req.usuario
        });
    });

});

module.exports = app;