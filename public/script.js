document.addEventListener("DOMContentLoaded", () => {
  const movieList = document.getElementById("movie-list");

  async function getMovies() {
    const response = await fetch("/movies");
    let movies = await response.json();

    console.log("Отримані дані:", movies);
    console.log("Тип отриманих даних:", typeof movies);
    console.log("Чи це масив?", Array.isArray(movies));

    if (!Array.isArray(movies)) {
        console.error("Помилка! Дані не є масивом.");
        return;
    }

    movieList.innerHTML = "";
    movies.forEach(movie => {
        const li = document.createElement("li");
        li.innerHTML = `
            ${movie.title} (${movie.year}) - ${movie.genre}, directed by ${movie.director}
            <button class="edit-btn" data-id="${movie.id}">Edit</button>
            <button class="delete-btn" data-id="${movie.id}">Delete</button>
        `;
        movieList.appendChild(li);
    });

    document.querySelectorAll(".edit-btn").forEach(button => {
        button.addEventListener("click", () => editMovie(button.dataset.id));
    });

    document.querySelectorAll(".delete-btn").forEach(button => {
        button.addEventListener("click", () => deleteMovie(button.dataset.id));
    });
}


  async function addMovie() {
      const title = prompt("Введіть назву фільму:");
      if (!title) return alert("Назва фільму не може бути порожньою!");

      const genre = prompt("Введіть жанр фільму:");
      if (!genre) return alert("Жанр фільму не може бути порожнім!");

      const director = prompt("Введіть ім'я режисера:");
      if (!director) return alert("Ім'я режисера не може бути порожнім!");

      const year = parseInt(prompt("Введіть рік випуску фільму:"), 10);
      if (isNaN(year)) return alert("Рік має бути числом!");

      const newMovie = { title, genre, director, year };

      await fetch("/movies", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newMovie),
      });

      getMovies();
  }

  async function editMovie(id) {
      const response = await fetch(`/movies`);
      const movies = await response.json();
      const movie = movies.find(m => m.id == id);
      if (!movie) return;

      const title = prompt("Редагуйте назву фільму:", movie.title) || movie.title;
      const genre = prompt("Редагуйте жанр:", movie.genre) || movie.genre;
      const director = prompt("Редагуйте ім'я режисера:", movie.director) || movie.director;
      const year = parseInt(prompt("Редагуйте рік:", movie.year), 10) || movie.year;

      const updatedMovie = { title, genre, director, year };

      await fetch(`/movies/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedMovie),
      });

      getMovies();
  }

  async function deleteMovie(id) {
      await fetch(`/movies/${id}`, { method: "DELETE" });
      getMovies();
  }

  document.getElementById("add-movie").addEventListener("click", addMovie);

  getMovies();
});