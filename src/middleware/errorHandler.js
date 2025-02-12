const errorDictionary = {
    USER_NOT_FOUND: 'Usuario no encontrado',
    PET_NOT_FOUND: 'Mascota no encontrada',
};

function errorHandler(err, req, res, next) {
    const statusCode = err.status || 500;
    const message = errorDictionary[err.code] || 'Error interno del servidor';
    res.status(statusCode).json({ error: message });
}

export default errorHandler;