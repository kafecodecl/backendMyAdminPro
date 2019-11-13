var express = require('express'); // cargo la libreria de express
var app = express();

var bodyParser = require('body-parser');

//configuracion del body parser
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//importamos los modelos
var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');


//***********************************************************************/
// Búsqueda por colección
//***********************************************************************/
app.get('/coleccion/:tabla/:busqueda', (req, res) => {

    var busqueda = req.params.busqueda;
    var tabla = req.params.tabla;

    var regex = new RegExp(busqueda, 'i');

    var promesa;

    switch (tabla) {
        case 'usuario':
            promesa = buscarUsuarios(busqueda, regex);
            break;

        case 'medico':
            promesa = buscarMedicos(busqueda, regex);
            break;

        case 'hospital':
            promesa = buscarHospitales(busqueda, regex);
            break;
        default:
            return res.status(400).json({
                ok: false,
                mensaje: 'ERROR, Los tipos de búsqueda solo pueden ser usuario, medico, hospital',
                error: { message: 'Error, colección o tabla no válido' }
            });
    }

    promesa.then(data => {
        return res.status(200).json({
            ok: true,
            [tabla]: data
        });
    });


});


//***********************************************************************/
// Búsqueda general
//***********************************************************************/
app.get('/todo/:busqueda', (req, res, next) => {

    var busqueda = req.params.busqueda;

    //Convierto el parametro busqueda en una expresión regular
    //para que realice la búsqueda case insensitive
    var regex = new RegExp(busqueda, 'i');

    Promise.all([
        buscarHospitales(busqueda, regex),
        buscarMedicos(busqueda, regex),
        buscarUsuarios(busqueda, regex)
    ]).then(repuestas => {

        res.status(200).json({
            ok: true,
            hospitales: repuestas[0],
            medicos: repuestas[1],
            usuarios: repuestas[2]
        })
    });



});

//Utilizamos promesas para realizar las busquedas en las distintas tablas
function buscarHospitales(busqueda, regex) {

    return new Promise((resolve, reject) => {

        Hospital.find({ nombre: regex })
            .populate('hospital')
            .exec((err, hospitales) => {

                if (err) {
                    reject('Error al cargar hospitales desde la búsqueda general.', err);
                } else {
                    resolve(hospitales);
                }

            });
    });
}

function buscarMedicos(busqueda, regex) {

    return new Promise((resolve, reject) => {

        Medico.find({ nombre: regex })
            .populate('usuario')
            .populate('hospital')
            .exec((err, medicos) => {

                if (err) {
                    reject('Error al cargar medicos desde la búsqueda general.', err);
                } else {
                    resolve(medicos);
                }

            });
    });

}

function buscarUsuarios(busqueda, regex) {

    return new Promise((resolve, reject) => {

        Usuario.find({}, 'nombre email role img')
            .or([{ 'nombre': regex }, { 'email': regex }])
            .exec((err, usuarios) => {
                if (err) {
                    reject('Error al cargar usuarios desde la búsqueda general.', err);
                } else {
                    resolve(usuarios);
                }
            })

    });

}

module.exports = app;