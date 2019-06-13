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