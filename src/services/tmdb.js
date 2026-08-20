// src/services/tmdb.js

// Leemos la llave secreta desde el archivo .env
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

// ==========================================
// 1. OBTENER CARTELERA (Para el Home) - ¡AHORA CON DURACIÓN REAL!
// ==========================================
export const obtenerPeliculasEnCartelera = async () => {
    try {
      // 1. Traemos la lista principal
      const respuesta = await fetch(`${BASE_URL}/movie/now_playing?api_key=${API_KEY}&language=es-ES&page=1`);
      const datos = await respuesta.json();
  
      // 2. Usamos Promise.all para pedir los detalles exactos (duración y géneros) de cada película a la vez
      const peliculasConDetalle = await Promise.all(
        datos.results.map(async (pelicula) => {
          const resDetalle = await fetch(`${BASE_URL}/movie/${pelicula.id}?api_key=${API_KEY}&language=es-ES`);
          const detalle = await resDetalle.json();
  
          return {
            id: detalle.id.toString(), 
            titulo: detalle.title,
            // Extraemos los géneros reales
            genero: detalle.genres && detalle.genres.length > 0 ? detalle.genres[0].name : "Cine", 
            // Extraemos la duración real en minutos
            duracion: detalle.runtime ? `${detalle.runtime} min` : "120 min", 
            calificacion: detalle.adult ? "+18" : "+13",
            poster: detalle.poster_path 
              ? `https://image.tmdb.org/t/p/w500${detalle.poster_path}` 
              : 'https://via.placeholder.com/500x750/1b222b/ffffff?text=Sin+Poster',
            backdrop: detalle.backdrop_path 
              ? `https://image.tmdb.org/t/p/original${detalle.backdrop_path}` 
              : null,
            sinopsis: detalle.overview || "Sinopsis no disponible en español.",
            horarios: ["15:00", "18:15", "20:30", "22:45"] 
          };
        })
      );
  
      return peliculasConDetalle;
    } catch (error) {
      console.error("Error al traer cartelera con detalles:", error);
      return [];
    }
  };

// ==========================================
// 2. DETALLE DE UNA PELÍCULA (Para Butacas.jsx)
// ==========================================
export const obtenerDetallePelicula = async (id) => {
  try {
    const resDetalle = await fetch(`${BASE_URL}/movie/${id}?api_key=${API_KEY}&language=es-ES`);
    const detalle = await resDetalle.json();

    // Pedimos los videos en ESPAÑOL
    let resVideos = await fetch(`${BASE_URL}/movie/${id}/videos?api_key=${API_KEY}&language=es-ES`);
    let videos = await resVideos.json();
    
    // PLAN B: Si no hay videos en español, pedimos los videos en INGLÉS
    if (videos.results.length === 0) {
      resVideos = await fetch(`${BASE_URL}/movie/${id}/videos?api_key=${API_KEY}&language=en-US`);
      videos = await resVideos.json();
    }

    // Buscamos Trailer. Si no hay, nos conformamos con un Teaser o el primer video de YouTube que haya.
    const trailer = videos.results.find(vid => vid.site === 'YouTube' && vid.type === 'Trailer') ||
                    videos.results.find(vid => vid.site === 'YouTube' && vid.type === 'Teaser') ||
                    videos.results.find(vid => vid.site === 'YouTube');

    const trailerUrl = trailer ? `https://www.youtube.com/embed/${trailer.key}` : null;

    return {
      id: detalle.id.toString(),
      titulo: detalle.title,
      genero: detalle.genres && detalle.genres.length > 0 ? detalle.genres.map(g => g.name).join(' • ') : "Sin género",
      duracion: `${detalle.runtime || 120} min`,
      calificacion: detalle.adult ? "+18" : "+13",
      poster: detalle.poster_path 
        ? `https://image.tmdb.org/t/p/w500${detalle.poster_path}` 
        : 'https://via.placeholder.com/500x750/1b222b/ffffff?text=Sin+Poster',
      backdrop: detalle.backdrop_path 
        ? `https://image.tmdb.org/t/p/original${detalle.backdrop_path}` 
        : null,
      sinopsis: detalle.overview || "La sinopsis de esta película aún no está disponible.",
      trailer: trailerUrl, 
      horarios: ["15:00", "18:15", "20:30", "22:45"] 
    };
  } catch (error) {
    console.error("Error al traer el detalle de la película:", error);
    return null;
  }
};

// ==========================================
// 3. SOLO ID DEL TRÁILER (Para hover de Home.jsx)
// ==========================================
export const obtenerTrailer = async (id) => {
  try {
    let resVideos = await fetch(`${BASE_URL}/movie/${id}/videos?api_key=${API_KEY}&language=es-ES`);
    let videos = await resVideos.json();
    
    // PLAN B: Si no hay videos en español, buscamos en inglés
    if (videos.results.length === 0) {
      resVideos = await fetch(`${BASE_URL}/movie/${id}/videos?api_key=${API_KEY}&language=en-US`);
      videos = await resVideos.json();
    }

    // Filtramos para encontrar Trailer, Teaser o cualquier clip oficial
    const trailer = videos.results.find(vid => vid.site === 'YouTube' && vid.type === 'Trailer') ||
                    videos.results.find(vid => vid.site === 'YouTube' && vid.type === 'Teaser') ||
                    videos.results.find(vid => vid.site === 'YouTube');

    // Retorna la clave del video, o nulo si definitivamente no hay nada
    return trailer ? trailer.key : null;
  } catch (error) {
    console.error("Error al traer el tráiler corto:", error);
    return null;
  }
};