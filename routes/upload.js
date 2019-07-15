var express = require('express'); // cargo la libreria de express
var fileUpload = require('express-fileupload');//Libreriaq para subir archivos mediante express
var fs = require('fs');
var app = express();

//Middleware de fileupload, carga opciones por defecto
app.use(fileUpload());


//importamos los modelos
var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');


app.put('/:tipo/:id', (req, res, next) => {

    var tipo = req.params.tipo;
    var id = req.params.id;


    //Validar los tipos de colecciones
    var tiposValidos = [ 'hospitales','medicos','usuarios' ]

    if( tiposValidos.indexOf(tipo) < 0){
        res.status(400).json({
            ok: false,
            mensaje: 'Debe seleccionar un tipo de coleccion válida',
            errors: { message: 'Tipo de colección no válida'} 
        });
    }

    //Válida si vienen archivos en el request
    if( !req.files ) {
        res.status(400).json({
            ok: false,
            mensaje: 'Debe seleccionar un archivo',
            errors: { message: 'No seleccionó un archivo'} 
        });
    }

    //Obtener nombre del archivo
    var archivo = req.files.imagen;

    //Obtengo la extensión del archivo
    var nombreCortado = archivo.name.split('.');
    var extension = nombreCortado[ nombreCortado.length - 1];

    //válidar extensiones
    var extensionesValidas = ['png','jpg','jpeg','bpm', 'gif'];

    if( extensionesValidas.indexOf( extension ) < 0 ) {
        res.status(400).json({
            ok: false,
            mensaje: 'Extensión de archivo incorrecta, solo se permiten imagenes de tipo '+ extensionesValidas.join(', '),
            errors: { message: 'Extensión de archivo incorrecta'} 
        });
    }

    //Nombre de archivo personalizado
    var nombreArchivo = `${ id }-${ new Date().getMilliseconds() }.${extension}`;    

    //Mover el archivo del server temporal a un path
    var path = `./uploads/${ tipo }/${ nombreArchivo }`;

    //Mover el archivo
    archivo.mv(path, err => {

        if( err ){
            res.status(500).json({
                ok: false,
                mensaje: 'Error al mover archivo',
                errors: err 
            });
        }

        subirPorTipo(tipo, id, nombreArchivo, res);

        // res.status(200).json({
        //     ok: true,
        //     mensaje: 'Archivo movido',
        //     extension
        // });

    });

});


function subirPorTipo(tipo, id, nombreArchivo, res) {

    if( tipo === 'usuarios' ) {

        Usuario.findById(id, (err, usuario)=>{

            if(err){
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error usuario no encontrado',
                    errors: err 
                });
            }

            //Obtengo el path viejo de la imagen
            var pathViejo = './uploads/usuarios/' + usuario.img

            //valido si el archivo viejo existe lo borro
            // if ( fs.statSync(pathViejo).isFile() ){
            //     fs.unlinkSync(pathViejo);
            // }

            //Asignar la nueva imagen
            usuario.img = nombreArchivo;

            usuario.save((err, usuarioActualizado) => {

                if(err){
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al actualizar imagen de usuario',
                        errors: err 
                    });
                }

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de usuario actualizada',
                    usuarioActualizado                    
                });
            })
        });

    }

    if( tipo === 'hospitales' ) {
        Hospital.findById(id, (err, hospital)=>{

            if(err){
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error hospital no encontrado',
                    errors: err 
                });
            }

            //Obtengo el path viejo de la imagen
            var pathViejo = './uploads/hospitales/' + hospital.img

            //valido si el archivo viejo existe lo borro
            // if ( fs.statSync(pathViejo).isFile() ){
            //     fs.unlinkSync(pathViejo);
            // }

            //Asignar la nueva imagen
            hospital.img = nombreArchivo;

            hospital.save((err, hospitalActualizado) => {

                if(err){
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al actualizar imagen de hospital',
                        errors: err 
                    });
                }

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de hospital actualizada',
                    hospitalActualizado                    
                });
            })
        });
    }

    if( tipo === 'medicos' ) {

        Medico.findById(id, (err, medico)=>{

            if(err){
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error medico no encontrado',
                    errors: err 
                });
            }

            //Obtengo el path viejo de la imagen
            var pathViejo = './uploads/medicos/' + medico.img

            //valido si el archivo viejo existe lo borro
            // if ( fs.statSync(pathViejo).isFile() ){
            //     fs.unlinkSync(pathViejo);
            // }

            //Asignar la nueva imagen
            medico.img = nombreArchivo;

            medico.save((err, medicoActualizado) => {

                if(err){
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al actualizar imagen de medico',
                        errors: err 
                    });
                }

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de medico actualizada',
                    medicoActualizado                    
                });
            })
        });
    }

}



module.exports = app;