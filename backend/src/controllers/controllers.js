import 'dotenv/config';
import db from '../config/firebase.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const usersCollection = db.collection('users');

const SALT_ROUNDS = 12;


// GET /users
export const getUsers = async (req, res) => {
    try {
        const snapshot = await usersCollection.get();
        const users = snapshot.docs.map(doc => {
            return {
                id: doc.id,
                name: doc.data().name,
                email: doc.data().email,
                password: doc.data().password,
            };
        });
        res.json(users);
    } catch (error) {
        res.status(500).send("Error al obtener usuarios");
    }
};

// POST /users
export const createUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name) {
            return res.status(400).json({ error: "El nombre es obligatorio" });
        } else if (!email) {
            return res.status(400).json({ error: "El email es obligatorio" });
        } else if (!password) {
            return res.status(400).json({ error: "La contraseña es obligatoria" });
        }

        const existingUserSnapshot = await usersCollection.where('email', '==', email).get();
        if (!existingUserSnapshot.empty) {
            return res.status(400).json({ error: "El email ya está registrado" });
        }

        const hashedPassword = await hashedPasswordSafely(password);

        const snapshot = await usersCollection.get();
        let nextId = 1;

        if (!snapshot.empty) {
            const ids = snapshot.docs.map(doc => parseInt(doc.id)).filter(id => !isNaN(id));
            if (ids.length > 0) {
                nextId = Math.max(...ids) + 1;
            }
        }

        const newUser = { name, email, password: hashedPassword };

        await usersCollection.doc(nextId.toString()).set(newUser);

        res.status(201).json({ id: nextId, ...newUser });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// DELETE /users/:id
export const removeUser = async (req, res) => {
    try {
        const id = req.params.id;
        await usersCollection.doc(id).delete();
        res.status(204).send();
    } catch (error) {
        res.status(500).send("Error al eliminar usuario");
    }
};

// Login
export const login = async (req, res) => {

    const { email, password } = req.body;
    try {
        const userSnapshot = await usersCollection.where('email', '==', email).get();
        if (userSnapshot.empty) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        const userDoc = userSnapshot.docs[0];
        const userData = userDoc.data();

        const isMatch = await bcrypt.compare(password, userData.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Contraseña incorrecta' });
        }

        const token = jwt.sign(
            { userId: userDoc.id, email: userData.email },
            process.env.JWT_SECRET,
            { expiresIn: '2h' }
        );

        res.json({
            message: "¡Inicio de sesión exitoso!",
            token: token,
            userId: userDoc.id,
            name: userData.name,
            email: userData.email
        });
    } catch (error) {
        res.status(500).json({ error: 'Error en el login' });
    }
};