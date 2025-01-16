class UserDTO {
    constructor(user) {
        this.email = user.email;
        this.role = user.role; 
        //El usuario y otros datos sensibles no me van a llegar a la vista. 
    }

}

export default UserDTO; 