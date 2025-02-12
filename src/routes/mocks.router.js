import { Router } from 'express';
import { generarUsuarios, generarMascotas } from '../utils/mocking.js';
import User from '../dao/models/User.js';
import Pet from '../dao/models/Pet.js';

const router = Router();

router.get('/mockingpets', (req, res) => {
    const pets = [];
    for (let i = 0; i < 50; i++) {
        const mascota = generarMascotas();
        pets.push(mascota);
    }
    res.json(pets);
});

router.get('/mockingusers', (req, res) => {
    const usuarios = generarUsuarios(50);
    res.json(usuarios);
});

router.post('/generateData', async (req, res) => {
    const { users, pets } = req.body;

    const usuarios = generarUsuarios(users);
    await User.insertMany(usuarios);

    const mascotas = [];
    for (let i = 0; i < pets; i++) {
        mascotas.push(generarMascotas());
    }
    await Pet.insertMany(mascotas);

    res.status(201).json({ message: 'Datos generados e insertados correctamente' });
});

export default router;