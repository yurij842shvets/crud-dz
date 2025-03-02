import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;
const moviesFilePath = path.join(__dirname, 'movies.json');

app.use(express.json());
app.use(express.static('public'));

function getMovies() {
    if (!fs.existsSync(moviesFilePath)) return []; // Якщо файл не існує – повертаємо пустий масив

    const data = fs.readFileSync(moviesFilePath, 'utf8').trim();
    if (!data) return []; // Якщо файл порожній – повертаємо пустий масив

    try {
        const parsedData = JSON.parse(data);
        return Array.isArray(parsedData.movies) ? parsedData.movies : []; // Переконуємося, що це масив
    } catch (error) {
        console.error("Помилка читання JSON:", error);
        return [];
    }
}

function saveMovies(movies) {
    fs.writeFileSync(moviesFilePath, JSON.stringify({ movies }, null, 2), 'utf8');
}

app.get('/movies', (req, res) => {
    res.json(getMovies());
});

app.post('/movies', (req, res) => {
    const movies = getMovies();
    const newMovie = { id: movies.length + 1, ...req.body };
    movies.push(newMovie);
    saveMovies(movies);
    res.status(201).json(newMovie);
});

app.put('/movies/:id', (req, res) => {
    const movies = getMovies();
    const movieId = parseInt(req.params.id);
    const movieIndex = movies.findIndex(m => m.id === movieId);

    if (movieIndex === -1) {
        return res.status(404).json({ message: "Фільм не знайдено" });
    }

    movies[movieIndex] = { ...movies[movieIndex], ...req.body };
    saveMovies(movies);
    res.json(movies[movieIndex]);
});

app.delete('/movies/:id', (req, res) => {
    let movies = getMovies();
    const movieId = parseInt(req.params.id);

    if (!movies.some(m => m.id === movieId)) {
        return res.status(404).json({ message: "Фільм не знайдено" });
    }

    movies = movies.filter(m => m.id !== movieId);
    saveMovies(movies);
    res.json({ message: "Фільм видалено" });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});