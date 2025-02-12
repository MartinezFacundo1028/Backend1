
function testMiddleware(req, res, next) {
    const error = new Error('Prueba de error');
    error.code = 'USER_NOT_FOUND';
    next(error);
}

export default testMiddleware;
