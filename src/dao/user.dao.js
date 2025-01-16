//Nos conectamos con el Model: 
import UsuarioModel from "./models/user.model.js";

class UserDao {
    async findById(id) {
        return await UsuarioModel.findById(id); 
    }

    async findOne(query) {
        return await UsuarioModel.findOne(query); 
    }

    async save(userData) {
        const user = new UsuarioModel(userData); 
        return await user.save(); 
    }

}

export default new UserDao(); 