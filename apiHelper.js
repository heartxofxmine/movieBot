var mdb = require('moviedb')(process.env.MDB_API_KEY);
var guidebox = require('guidebox')(process.env.GUIDEBOX_API_KEY)
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

function movieDetails(movie, searchedBy, searchValue) {
    var trailerLink = null;
    if (movie.trailers.web.length > 0) {
        trailerLink = movie.trailers.web[0].link;
    }
    //Take an object and make it a list
    var Actors = [];
    movie.cast.forEach(function (actor) {
        Actors.push(actor.name);
    })
    var Genres = [];
    movie.genres.forEach(function (genre) {
        Genres.push(genre.title);
    })
    //Dictionaries of Streams
    var StreamSources = {};
    if (movie.subscription_web_sources.length > 0) {
        movie.subscription_web_sources.forEach(function (stream) {
            StreamSources[stream.display_name] = stream.link;
        })
    }
    var PaidSources = {};
    if (movie.purchase_web_sources.length > 0) {
        movie.purchase_web_sources.forEach(function (stream) {
            PaidSources[stream.display_name] = stream.link;
        })
    }

    var movieDetails = {
        Title: movie.title,
        Poster: movie.poster_120x171,
        Plot: movie.overview,
        Trailer: trailerLink,
        Director: movie.directors[0].name,
        Year: movie.release_year,
        Actors: Actors, //could do .join(", ") if wanted a string instead
        imdbID: movie.imdb,
        Rating: movie.rating,
        Genres: Genres.join(", "),
        StreamSources: StreamSources,
        PaidSources: PaidSources,

        searchedBy: searchedBy,
        searchValue: searchValue
    }
    return movieDetails;
}

function getRandomMovie() {
    //Guidebox API gets query for top 70k+ movies
    var totalResults;
    return guidebox.movies.list({ limit: 1 })
        .then(function (data) {
            totalResults = data.total_results / 10;
            //Get the total_results, randomly generate a number for the offset
            var randOffset = Math.floor(Math.random() * (totalResults - 0) + 0);
            //Get that specific movie out of the main list
            //This is resolving the "then" promise to the value just specified
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

function getActorByName(actorName) {
    return guidebox.search.person({ query: actorName })
        .then(function (data) {
            var actorDetails = {
                ID: data.results[0].id,
                Photo: data.results[0].images && data.results[0].images.small && data.results[0].images.small.url,
            }
            return actorDetails;
        })
        //data is the error message
        .catch(function(data){
            return null;
        })
};

//wraps the callback from MDB into a promise
function mdbDiscoverMovie(query) {
    return new Promise(function (resolve, reject) {
        mdb.discoverMovie(query, function (err, res) {
            if (err != null) {
                reject(err);
            } else { resolve(res); }
        })
    })
};

function getMoviebyGenre(userGenre) {
    var selectedGenre = genresList[userGenre];
    var rand = selectedGenre[Math.floor(Math.random() * selectedGenre.length)];
    //IDs in guidebox don't seem as expanise as MovieDB IDs, so limiting to first 10 pages
    var randPg = Math.floor(Math.random() * (10 - 0) + 0);
    return mdbDiscoverMovie({ with_genres: rand, page: randPg })
        .then(function (res) {
            var randId = Math.floor(Math.random() * (19 - 0) + 0);
            var movieID = res.results[randId].id;
            return guidebox.search.movies({ field: 'id', id_type: 'themoviedb', query: movieID });
        }).then(function (movie) {
            var movieID = movie.id;
            return guidebox.movies.retrieve(movieID);
        }).then(function (movie) {
            return movieDetails(movie, "genre", userGenre);
        })
}
//Function works, even if the MDB API isn't good at making a yearSearch
function getMoviebyYear(userYear) {
    return mdbDiscoverMovie({ year: userYear })
        .then(function (res) {
            var randId = Math.floor(Math.random() * (19 - 0) + 0);
            var movieID = res.results[randId].id;
            return guidebox.search.movies({ field: 'id', id_type: 'themoviedb', query: movieID });
        }).then(function (movie) {
            var movieID = movie.id;
            return guidebox.movies.retrieve(movieID);
        }).then(function (movie) {
            return movieDetails(movie, "year", userYear);
        })
}

exports.getRandomMovie = getRandomMovie;
exports.getMovieByActor = getMovieByActor;
exports.getActorByName = getActorByName;
exports.getMoviebyYear = getMoviebyYear;
exports.getMoviebyGenre = getMoviebyGenre;
exports.genresList = genresList;
