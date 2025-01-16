//Importamos el repository: 
import UserDTO from "../dto/user.dto.js";
import userRepository from "../repository/user.repository.js";

//Nos traemos de util las funciones de bcrypt: 
import { createHash, isValidPassword } from "../utils/util.js";

class UserService {
    async registerUser(userData) {
        const existeUsuario = await userRepository.getUserByEmail(userData.email);

        if(existeUsuario) throw new Error("El usuario ya existe"); 

        userData.password = createHash(userData.password); 
        return await userRepository.createUser(userData); 
    }

    async loginUser(email, password) {
        const user = await userRepository.getUserByEmail(email); 
        console.log("Usuario encontrado en el servicio:", user);
        if (!user || !isValidPassword(password, user)) throw new Error("Error con las credenciales"); 
        return user; 
    }

    async generarDTO(user) {
        const usuarioFinal = new UserDTO(user); 
        return usuarioFinal; 
    }

}

export default new UserService(); 