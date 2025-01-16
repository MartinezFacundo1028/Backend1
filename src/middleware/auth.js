//Creamos dos funciones para verificar los roles: 

export function soloAdmin(req, res, next) {
    if(req.user.role === "admin") {
        next(); 
    } else {
        res.status(403).send("Acceso denegado, este lugar es solo admin queridooooo "); 
    }
}

export function soloUser(req, res, next) {
    if(req.user.role === "user") {
        next(); 
    } else {
        res.status(403).send("Acceso denegado, este lugar es solo para usuarios comunachos. "); 
    }
}