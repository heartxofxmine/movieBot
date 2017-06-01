var mdb = require('moviedb')('15c8e7b002396f54915987483a51d4ca');
var omdb = require("./lib/omdbMovieInfo.js")
var guidebox = require('guidebox')('d241315991efd76cc031c05b4cd0eacf64fa4c64')
var r = require('request');

//Globals
var base_image_uri = 'https://image.tmdb.org/t/p/w185_and_h278_bestv2';
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


// getRandomMovie generates a ## to randomly select a movie ID
// to then grab movieDetails from movieDB and OMDB
function getRandomMovie(done) {
    mdb.miscTopRatedMovies(function (err, res) {
        var TopMoviesPgs = res.total_pages;
        var randPg = Math.floor(Math.random() * (TopMoviesPgs - 0) + 0);
        var randId = Math.floor(Math.random() * (19 - 0) + 0);
        //Embedding because the movie_pages in res changes, so want to make sure the RandPg is always in scope
        mdb.miscTopRatedMovies({ page: randPg }, function (err, res) {
            console.log(res.results[randId]);
            var movie = res.results[randId];
            mdb.movieVideos({ id: movie.id }, function (err, res) {
                var trailerKey = null;
                if (res.results.length > 0) {
                    trailerKey = res.results[0].key;
                }
                
                var movieDetails = {
                    Title: movie.title,
                    Poster: base_image_uri + movie.poster_path,
                    Plot: movie.overview,
                    //if trailerKey is not null, do first statement, otherwise fill with null 
                    Trailer: trailerKey !== null ? ('http://youtu.be/' + trailerKey) : null
                }

                var query = {
                    "t": movieDetails.Title,
                    "r": "json"
                };
                var opts = {
                    url: "http://www.omdbapi.com/?apikey=8d49dcc6&",
                    qs: query
                }
                r(opts, function (err, resp, body) {
                    if (err) { console.log(err); return; }
                    var bodyObject = JSON.parse(resp.body);

                    movieDetails.Director = bodyObject.Director;
                    movieDetails.Year = bodyObject.Year;
                    movieDetails.Actors = bodyObject.Actors;
                    movieDetails.imdbID = bodyObject.imdbID;
                    movieDetails.Rating = bodyObject.imdbRating;
                    movieDetails.Genres = bodyObject.Genre;

                    console.log(movieDetails);
                    done(movieDetails);
                });
            })
        })
    })
};

// generate movieDetails if you have a movieID
function movieDetails(movieID, done) {
    mdb.movieInfo({ id: movieID }, function (data, res) {
        var movie = res;
        mdb.movieVideos({ id: movieID }, function (err, res) {
                var trailerKey = null;
                //needed to make a check for if a movie doesn't have a trailer
                if (res.results.length > 0) {
                    trailerKey = res.results[0].key;
                }
                
                var movieDetails = {
                    Title: movie.title,
                    Poster: base_image_uri + movie.poster_path,
                    Plot: movie.overview,
                    //if trailerKey is not null, do first statement, otherwise fill with null 
                    Trailer: trailerKey !== null ? ('http://youtu.be/' + trailerKey) : null
                }

                var query = {
                    "t": movieDetails.Title,
                    "r": "json"
                };
                var opts = {
                    url: "http://www.omdbapi.com/",
                    qs: query
                }
                r(opts, function (err, resp, body) {
                    if (err) { console.log(err); return; }
                    var bodyObject = JSON.parse(resp.body);

                    movieDetails.Director = bodyObject.Director;
                    movieDetails.Year = bodyObject.Year;
                    movieDetails.Actors = bodyObject.Actors;
                    movieDetails.imdbID = bodyObject.imdbID;
                    movieDetails.Rating = bodyObject.imdbRating;
                    movieDetails.Genres = bodyObject.Genre;

                    done(movieDetails);
                });
        })
    })
};

function getIDforActor(actorName, done) {
    mdb.searchPerson({ query: actorName }, function (data, res) {
        //console.log(res.results);
        if (res.results.length !== 0) {
            var actorID = res.results[0].id;
            var actorPhotoPath = res.results[0].profile_path;
            var actorDetails = {
                ID: res.results[0].id,
                Photo: base_image_uri + actorPhotoPath,
            }
            //console.log(base_image_uri + actorPhotoPath);
            done(actorDetails);
        }
        else { done(null); }
    });
};

function getMovieByActor(actorName, done) {
    getIDforActor(actorName, function (actorDetails) {
        mdb.personMovieCredits({ id: actorDetails.ID }, function (err, results) {
            if (results !== null && results.cast.length !== 0) {
                var randMovie = Math.floor(Math.random() * (results.cast.length - 0) + 0);
                var movieID = results.cast[randMovie].id;
                /*            var newMovie = results.cast[randMovie].title;
                            console.log(results.cast);
                            console.log(results.cast.length);
                            console.log('Another movie is ' + newMovie);*/
                movieDetails(movieID, function (movieDetails) {
                    movieDetails.searchedBy = "actor";
                    movieDetails.searchValue = actorName;
                    done(movieDetails);
                });
            }
            else { done(null); }
        });
    });
};


function getMoviebyYear(userYear, done) {
    mdb.discoverMovie({year: userYear}, function(err, res){
        var year = userYear;
        console.log(res.results);
        
        if (results !== null && results.cast.length !== 0) {
                var randMovie = Math.floor(Math.random() * (results.cast.length - 0) + 0);
                var movieID = results.cast[randMovie].id;
                /*            var newMovie = results.cast[randMovie].title;
                            console.log(results.cast);
                            console.log(results.cast.length);
                            console.log('Another movie is ' + newMovie);*/
                movieDetails(movieID, function (movieDetails) {
                    movieDetails.searchedBy = "actor";
                    movieDetails.searchValue = actorName;
                    done(movieDetails);
                });
            }
            else { done(null); }
    });
}

exports.getRandomMovie = getRandomMovie;
exports.getMovieByActor = getMovieByActor;
exports.getIDforActor = getIDforActor;
exports.getMoviebyYear = getMoviebyYear;
