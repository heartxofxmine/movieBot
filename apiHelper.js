var mdb = require('moviedb')('15c8e7b002396f54915987483a51d4ca');
var omdb = require("./lib/omdbMovieInfo.js")
var guidebox = require('guidebox')(process.env.MOVIE_API_KEY)
var request = require('request');

//Globals
var genresList = {
    "Action/Adventure": [28, 12],
    "Family/Animation/Music": [10751, 16, 10402],
    "Comedy": [35],
    "Documentary": [99],
    "Drama": [18],
    "History/War": [36, 10752],
    "Romance": [10749],
    "Sci-Fi/Fantasy": [878, 14],
    "Thriller/Crime/Mystery/Horror": [53, 80, 9648, 27],
    "Western": [37],
}
var selectedGenre = genresList["Action/Adventure"];
var rand = selectedGenre[Math.floor(Math.random() * selectedGenre.length)];


function movieDetails(movie, searchedBy, searchValue) {
    var trailerLink = null;
    if (movie.trailers.web.length > 0) {
        trailerLink = movie.trailers.web[0].link;
    }

    var Actors = [];
    movie.cast.forEach(function(actor){
        Actors.push(actor.name);
    })
    /*for (var i = 0; i<movie.cast.length; i++){
        Actors.push(movie.cast[i].name);
    };*/

    var movieDetails = {
        Title: movie.title,
        Poster: movie.poster_120x171,
        Plot: movie.overview,
        Trailer: trailerLink,
        Director: movie.directors[0].name,
        Year: movie.release_year,
        Actors: Actors.join(", "),
        imdbID: movie.imdb,
        Rating: movie.rating,
        Genres: "Action",

        searchedBy: searchedBy,
        searchValue: searchValue
    }
    return movieDetails;
}

function getRandomMovie() {
    //new API gets query for top 70k+ movies
    var totalResults;
    return guidebox.movies.list({ limit: 1 })
        .then(function (data) {
            totalResults = data.total_results / 2;
            //get the total_results, and randomly generate a number for the offset
            var randOffset = Math.floor(Math.random() * (totalResults - 0) + 0);
            //get that specific movie out of the main list
            //This is resolving the "then" promise to the value I just specified
            return randOffset;
        }).then(function (randOffset) {
            return guidebox.movies.list({ limit: 1, offset: randOffset });
        }).then(function (data) {
            var movie = data.results[0];
            var randMovieID = movie.id;
            return guidebox.movies.retrieve(randMovieID);
        }).then(function (movie) {
            return movieDetails(movie);
        });
};

function getMovieByActor(actorName) {
    //first need to get actor's ID by calling search.person
    return guidebox.search.person({ query: actorName })
        .then(function (data) {
            var actorID = data.results[0].id;
            //Use ID to pull up person.credits
            return guidebox.person.credits(actorID, { role: 'cast' });
        }).then(function (actorCredits) {
            var res = actorCredits.results;
            //Randomly generate a movie from their credits
            var item = res[Math.floor(Math.random() * res.length)];
            return guidebox.movies.retrieve(item.id);
        }).then(function (movie) {
            return movieDetails(movie, "actor", actorName);
        })
};






//A way to make the API call without using the packaging that exists
const getMovies = (callback) => {
    request('http://api-public.guidebox.com/v2/movies?api_key=' + process.env.MOVIE_API_KEY, function (error, response, body) {
        callback(error, response);
    });
}

exports.getMovies = getMovies;
exports.getRandomMovie = getRandomMovie;
exports.getMovieByActor = getMovieByActor;
/*exports.getIDforActor = getIDforActor;
exports.getMoviebyYear = getMoviebyYear;*/
