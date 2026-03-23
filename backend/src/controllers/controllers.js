import 'dotenv/config';
import db from '../config/firebase.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const commentsCollection = db.collection('comments');

// Get /comments
export async function getComments(req, res) {
    try {
        const snapshot = await commentsCollection.get();
        const comments = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                username: data.username,
                message: data.message,
                date: data.date
            };
        });
        const sortedComments = comments.sort((a, b) => new Date(b.date) - new Date(a.date));
        res.json(sortedComments);
    } catch (error) {
        res.status(500).send("Error al obtener comentarios");
    }
}

// Post /comments
export async function createComment(req, res) {
    try {
        const { username, message } = req.body;
        if (!username) {
            return res.status(400).json({ error: "El nombre de usuario es obligatorio" });
        } else if (!message) {
            return res.status(400).json({ error: "El mensaje es obligatorio" });
        } else if (message.length < 5) {
            return res.status(400).json({ error: "El mensaje debe tener al menos 5 caracteres" });
        }

        const snapshot = await commentsCollection.get();
        let nextId = 1;
        if (!snapshot.empty) {
            const ids = snapshot.docs.map(doc => parseInt(doc.id)).filter(id => !isNaN(id));
            if (ids.length > 0) {
                nextId = Math.max(...ids) + 1;
            }
        }

        const newComment = { 
            username, 
            message, 
            date:  new Date().toISOString() };

        await commentsCollection.doc(nextId.toString()).set(newComment);

        res.status(201).json({ id: nextId, ...newComment });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// Delete /comments/:id
export async function deleteComment(req, res) {
    try {
        const id = req.params.id;

        const doc = await commentsCollection.doc(id).get();
        if (!doc.exists) {
            return res.status(404).json({ error: "Comentario no encontrado" });
        }

        await commentsCollection.doc(id).delete();
        res.status(204).send();
    } catch (error) {
        res.status(500).send("Error al eliminar comentario");
    }
}


/* 

// GET /users
export const getUsers = async (req, res) => {
    try {
        const snapshot = await usersCollection.get();
        const users = snapshot.docs.map(doc => {
            return {
                id: doc.id,
                username: doc.data().username
            };
        });
        res.json(users);
    } catch (error) {
        res.status(500).send("Error al obtener usuarios");
    }
};

// POST /users
export async function createUser(req, res) {
    try {
        const { username, password } = req.body;
        if (!username) {
            return res.status(400).json({ error: "El nombre de usuario es obligatorio" });
        } else if (!password) {
            return res.status(400).json({ error: "La contraseña es obligatoria" });
        }

        const existingUserSnapshot = await usersCollection.where('username', '>=', username.toLowerCase()).where('username', '<=', username.toLowerCase() + '\uf8ff').get();
        if (!existingUserSnapshot.empty) {
            return res.status(400).json({ error: "El nombre de usuario ya está registrado" });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const snapshot = await usersCollection.get();
        let nextId = 1;

        if (!snapshot.empty) {
            const ids = snapshot.docs.map(doc => parseInt(doc.id)).filter(id => !isNaN(id));
            if (ids.length > 0) {
                nextId = Math.max(...ids) + 1;
            }
        }

        const newUser = { username, password: hashedPassword };

        await usersCollection.doc(nextId.toString()).set(newUser);

        res.status(201).json({ id: nextId, ...newUser });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// DELETE /users/:id
export async function removeUser(req, res) {
    try {
        const id = req.params.id;
        await usersCollection.doc(id).delete();
        res.status(204).send();
    } catch (error) {
        res.status(500).send("Error al eliminar usuario");
    }
};

// Login
export async function login(req, res) {

    const { username, password } = req.body;
    try {
        const userSnapshot = await usersCollection.where('username', '==', username).get();
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
            { userId: userDoc.id, username: userData.username },
            process.env.JWT_SECRET,
            { expiresIn: '2h' }
        );

        res.json({
            message: "¡Inicio de sesión exitoso!",
            token: token,
            userId: userDoc.id,
            username: userData.username
        });
    } catch (error) {
        res.status(500).json({ error: 'Error en el login' });
    }
};

*/