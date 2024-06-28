
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const apiKey = 'e36097fbe2fd55722e0e5c36cb0aa671'; // Reemplaza con tu clave de API de TMDb

const getMovies2023InArgentina = async (page = 1) => {
  const url = `https://api.themoviedb.org/3/discover/movie`;
  const params = {
    api_key: apiKey,
    // language: 'es-AR', // Lenguaje preferido para nombres de películas y personas
    sort_by: 'release_date.desc',
    include_adult: false,
    include_video: false,
    primary_release_year: 2023,
    with_original_language: 'es', // Limita a películas en español (opcional)
    with_countries: 'AR', // Limita a películas producidas en Argentina
    //  with_crew: '274702', // ID de género para mujeres como directoras
    page: 1,
  };
  const response = await axios.get(url, { params });
  return response.data;
};

const getMovieDetails = async (movieId) => {
  const url = `https://api.themoviedb.org/3/movie/${movieId}`;
  const params = { api_key: apiKey, language: 'en-US', append_to_response: 'credits' };
  const response = await axios.get(url, { params });
  return response.data;
};

const getPersonDetails = async (personId) => {
  const url = `https://api.themoviedb.org/3/person/${personId}`;
  const params = { api_key: apiKey, language: 'en-US' };
  const response = await axios.get(url, { params });
  return response.data;
};

const App = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovies = async () => {
      let allMovies = [];
      let page = 1;
      let keepFetching = true;

      while (keepFetching) {
        const data = await getMovies2023InArgentina(page);
        if (data.results.length === 0 || page > data.total_pages) {
          keepFetching = false;
          break;
        }

        for (const movie of data.results) {
          const movieDetails = await getMovieDetails(movie.id);
          const directors = movieDetails.credits.crew.filter(crew => crew.job === 'Director');

          for (const director of directors) {
            const directorDetails = await getPersonDetails(director.id);
            if (directorDetails.gender === 1) { // Filtra por directoras mujeres
              allMovies.push({
                title: movieDetails.title,
                release_date: movieDetails.release_date,
                country: movieDetails.production_countries.length > 0 ? movieDetails.production_countries[0].name : 'Unknown',
                director_name: directorDetails.name,
                director_gender: 'Female'
              });
            }
          }
        }
        page += 1;
      }

      setMovies(allMovies);
      setLoading(false);
    };

    fetchMovies();
  }, []);

  console.log('allMovies: ', movies)

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="App">
      <h1>Películas de 2023 en Argentina dirigidas por mujeres</h1>
      <ul>
        {movies.map((movie, index) => (
          <li key={index}>
            <h2>{movie.title}</h2>
            <p>Fecha de estreno: {movie.release_date}</p>
            <p>País: {movie.country}</p>
            <p>Directora: {movie.director_name}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default App;
