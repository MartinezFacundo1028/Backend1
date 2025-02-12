import express from 'express';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import mocksRouter from './routes/mocks.router.js';
import errorHandler from './middleware/errorHandler.js';

import usersRouter from './routes/users.router.js';
import petsRouter from './routes/pets.router.js';
import adoptionsRouter from './routes/adoption.router.js';
import sessionsRouter from './routes/sessions.router.js';
import testMiddleware from './middleware/testMiddleware.js';
const app = express();
const PORT = process.env.PORT||8080;
const connection = mongoose.connect(`mongodb+srv://CoderHouse:CoderHouse@codercluster.abfbm.mongodb.net/?retryWrites=true&w=majority&appName=CoderCluster`)

app.use(express.json());
app.use(cookieParser());

app.use('/api/users',usersRouter);
app.use('/api/pets',petsRouter);
app.use('/api/adoptions',adoptionsRouter);
app.use('/api/sessions',sessionsRouter);
app.use('/api/mocks', mocksRouter);
app.use(testMiddleware);
app.use(errorHandler);

app.listen(PORT,()=>console.log(`Listening on ${PORT}`))

export default app;
