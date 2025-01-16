import passport from "passport";
import jwt from "passport-jwt"; 

const JWTStrategy = jwt.Strategy; 
const ExtractJwt = jwt.ExtractJwt; 

//Creamos el cookieExtractor: 
const cookieExtractor = req => {
    let token = null; 
    //Corroboramos que hay alguna cookie para tomar: 
    if(req && req.cookies) {
        token = req.cookies["coderCookieToken"]; 
        //Tomamos la cookie que necesitemos:
    }
    return token; 
}

const initializePassport = () => {
    passport.use("jwt", new JWTStrategy({
        jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]), 
        secretOrKey:  process.env.JWT_SECRET, 
        //Misma palabra que usamos siempre!
    }, async (jwt_payload, done) => {
        try {
            return done(null, jwt_payload); 
        } catch (error) {
            return done(error);
        }
    }))
}


export default initializePassport; 