var express = require('express'); // cargo la libreria de express
var app = express();

//Obtener imagenes
const path = require('path');
const fs = require('fs')//crear archivos, mover cosas etc...

//***********************************************************************/
// Rutas, peticiones
//***********************************************************************/
app.get('/:tipo/:img', (req, res, next) => {

    //obtengo los parametros de entrada
    var tipo = req.params.tipo;
    var img = req.params.img;

    //se crea un path para ver si las imagenes existen
    //sino existen se mnostrará una imagen por defecto
    var pathImagen = path.resolve( __dirname, `../uploads/${ tipo }/${ img }` );

    if( fs.existsSync( pathImagen ) ){
        res.sendFile( pathImagen );
    }else{
        var pathNoImagen =  path.resolve( __dirname, `../assets/no-img.jpg` );
        res.sendFile( pathNoImagen );
    }




    //Respuesta, con formato json
    // res.status(200).json({
    //     ok: true,
    //     mensaje: 'Petición realizada correctamente.'
    // });

});

module.exports = app;