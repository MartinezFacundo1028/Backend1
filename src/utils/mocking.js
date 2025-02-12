import { faker } from "@faker-js/faker";
import bcrypt from 'bcrypt';
export const generarMascotas = () => {
    const mascota = {
        id: faker.database.mongodbObjectId(),
        name: faker.animal.dog(),
        specie: faker.helpers.arrayElement(['Perro', 'Gato', 'Pájaro', 'Reptil']), 
        raza: faker.animal.cat(), 
        edad: parseInt(faker.string.numeric({ min: 1, max: 15 })), 
        dueño: {
            id: faker.database.mongodbObjectId(),
            nombre: faker.person.firstName(),
            apellido: faker.person.lastName(),
            telefono: faker.phone.number(),
            email: faker.internet.email(),
        }
    }
    return mascota;
}

export const generarUsuarios = (num) => {
    const usuarios = [];
    for (let i = 0; i < num; i++) {
        const password = bcrypt.hashSync('coder123', 10);
        const role = Math.random() < 0.5 ? 'user' : 'admin'; 
        usuarios.push({
            id: faker.database.mongodbObjectId(),
            first_name: faker.person.firstName(),
            last_name: faker.person.lastName(),
            email: faker.internet.email(),
            password,
            role,
            pets: [],
        });
    }
    return usuarios;
}

