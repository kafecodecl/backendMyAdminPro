var mongoose = require('mongoose'); //importación de mongoose
var uniqueValidator = require('mongoose-unique-validator');


//Funcion para definir esquemas
var Schema = mongoose.Schema;


//Roles permitidos
var rolesValidos = {
    values: ['ADMIN_ROLE', 'USER_ROLE'],
    message: 'El Rol {VALUE} no es un rol válido...'
}


//Configuración del schema
var usuarioSchema = new Schema({
    nombre: { type: String, required: [true, 'El nombre es requerido'] },
    email: { type: String, unique: true, required: [true, 'El email es requerido'] },
    password: { type: String, required: [true, 'La contraseña es requerida'] },
    img: { type: String, required: false },
    role: { type: String, required: true, default: 'USER_ROLE', enum: rolesValidos },
    google: { type: Boolean, default: false }
});

usuarioSchema.plugin(uniqueValidator, { message: 'El {PATH} debe ser único' });

//Para utilizar el modulo desde fuera lo exportamos
module.exports = mongoose.model('Usuario', usuarioSchema);