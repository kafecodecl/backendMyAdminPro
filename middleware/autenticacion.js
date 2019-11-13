var jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED;



//***********************************************************************/
// Verificar TOKEN
//***********************************************************************/
exports.verificaToken = function(req, res, next) {
    //Recibir eltoken
    var token = req.query.token;

    //Verificar que el token sea válido
    jwt.verify(token, SEED, (err, decoded) => {

        //::el decoded contiene la información del usuario

        //Valido si ocurre algun error, 401 no autorizado
        if (err) {
            return res.status(401).json({
                ok: false,
                mensaje: 'Token incorrecto',
                errors: err
            });
        }

        req.usuario = decoded.usuario;

        next();

        // return res.status(200).json({
        //     ok: true,
        //     decoded: decoded
        // });


    });
}

//***********************************************************************/
// Verificar Administrador ADMIN_ROLE
//***********************************************************************/
exports.verificaADMIN_ROLE = function(req, res, next) {
    //Recibir eltoken
    var usuario = req.usuario;

    if (usuario.role === 'ADMIN_ROLE') {
        next();
        return;
    } else {

        return res.status(401).json({
            ok: false,
            mensaje: 'Acción no autorizada',
            errors: { message: 'No es administrador' }
        });

    }
}

//***********************************************************************/
// Verificar Admin o mismo usuario
//***********************************************************************/
exports.verificaADMIN_o_MismoUsuario = function(req, res, next) {
    //Recibir eltoken
    var usuario = req.usuario;
    var id = req.params.id;

    if (usuario.role === 'ADMIN_ROLE' || usuario._id === id) {
        next();
        return;
    } else {

        return res.status(401).json({
            ok: false,
            mensaje: 'Acción no autorizada',
            errors: { message: 'No es administrador y no es el usuario logeado' }
        });

    }
}