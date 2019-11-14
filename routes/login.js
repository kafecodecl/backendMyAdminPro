//Zona de importaciones
var express = require("express"); // cargo la libreria de express

var app = express(); //utilizar express
var bodyParser = require("body-parser"); //para obtener los valores ingresados en el body
var bcrypt = require("bcryptjs"); //Para encriptación de una sola vía de la contraseña de usuario
var jwt = require("jsonwebtoken");
var Usuario = require("../models/usuario");
var SEED = require("../config/config").SEED;

//Google
var CLIENT_ID = require("../config/config").CLIENT_ID;

const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(CLIENT_ID);

//middelware Autenticación
var mdAutenticacion = require('../middleware/autenticacion');

//configurar bodyparse
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


//***********************************************************************/
// Renueva Token
//***********************************************************************/
app.get('/renuevatoken', mdAutenticacion.verificaToken, (req, res) => {

    var token = jwt.sign({ usuario: req.usuario }, SEED, { expiresIn: 14400 }); //expiración 4 horas

    res.status(200).json({
        ok: true,
        token: token
    });

});

//***********************************************************************/
// Autenticación google
//***********************************************************************/
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID // Specify the CLIENT_ID of the app that accesses the backend
            // Or, if multiple clients access the backend:
            //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    //   const userid = payload["sub"];
    // If request specified a G Suite domain:
    //const domain = payload['hd'];

    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true,
        payload
    };

}

app.post("/google", async(req, res) => {

    var token = req.body.token;
    var googleUser = await verify(token)
        .catch(e => {
            res.status(403).json({
                ok: false,
                mensaje: "Token no válido"
            });

        });

    //Grabar el usuario en la BBDD
    Usuario.findOne({ email: googleUser.email }, (err, usuarioDB) => {

        //Verificar error de base de datos
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error al buscar usuario ",
                errors: err
            });
        }

        //Verificar si el usuario existe en la BD, y sea una reatenticación
        if (usuarioDB) {

            //verificar si No es usuario google
            if (usuarioDB.google === false) {
                return res.status(500).json({
                    ok: false,
                    mensaje: "Debe usa su autenticación normal!"
                });
            } else {
                //Si estamos aquí es porque el usuario ya se autentico con google
                //y se requiere generar un nuevo token
                var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 }); //expiración 4 horas
                res.status(200).json({
                    ok: true,
                    usuario: usuarioDB,
                    token: token,
                    id: usuarioDB._id,
                    menu: obtenerMenu(usuarioDB.role)
                });
            }

        } else {
            //El usuario no existe y hay que crearlo
            var usuario = new Usuario();

            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = '=)';

            usuario.save((err, usuarioDB) => {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: "Error al crear usuario ",
                        errors: err
                    });
                }

                var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 }); //expiración 4 horas
                res.status(200).json({
                    ok: true,
                    usuario: usuarioDB,
                    token: token,
                    id: usuarioDB._id,
                    menu: obtenerMenu(usuarioDB.role)
                });

            });

        }



    });

});


//***********************************************************************/
// Autenticación normal
//***********************************************************************/
app.post("/", (req, res) => {
    //Variable para obtener los datos del body
    var body = req.body;

    //1. Verificar si el usuario existe (email)
    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {
        //Valido si ocurre algun error en la bd
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error al buscar usuario " + body.email,
                errors: err
            });
        }

        //valido si el usuario existe
        if (!usuarioDB) {
            return res.status(400).json({
                ok: false,
                mensaje: "Error, el email ingresado no es válido",
                errors: err
            });
        }

        //verifico la contraseña
        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            return res.status(400).json({
                ok: false,
                mensaje: "Error, la contraseña es incorrecta",
                errors: err
            });
        }

        //2. Crear un token (JWT)
        //params: 1. la data que quiero colocar en el token, 2. un SEED para hacer el token unico, 3. FEcha de expiración del token
        var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 }); //expiración 4 horas

        //Si el usuario existe
        usuarioDB.password = ":)"; //ocultar la contraseña del token

        res.status(200).json({
            ok: true,
            usuario: usuarioDB,
            token: token,
            id: usuarioDB._id,
            menu: obtenerMenu(usuarioDB.role)
        });
    });
});


function obtenerMenu(ROLE) {
    var menu = [{
            titulo: 'Principal',
            icono: 'mdi mdi-gauge',
            submenu: [
                { titulo: 'Dashboard', url: '/dashboard' },
                { titulo: 'ProgressBar', url: '/progress' },
                { titulo: 'Gráficas', url: '/graficas1' },
                { titulo: 'Rxjs', url: '/rxjs' },
                { titulo: 'Promesas', url: '/promesas' }
            ]
        },
        {
            titulo: 'Mantenimiento',
            icono: 'mdi mdi-folder-lock-open',
            submenu: [
                // { titulo: 'Usuarios', url: '/usuarios' },
                { titulo: 'Hospitales', url: '/hospitales' },
                { titulo: 'Medicos', url: '/medicos' }
            ]
        }
    ];

    if (ROLE === 'ADMIN_ROLE') {
        menu[1].submenu.unshift({ titulo: 'Usuarios', url: '/usuarios' });
    }

    return menu;
}

module.exports = app;