import 'dotenv/config'; 
import express from 'express';
import cors from 'cors';
import taskRoutes from './src/routes/routes.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use('/', taskRoutes);

app.listen(PORT, () => {
    console.log(`🚀 Servidor en http://localhost:${PORT}`);
});