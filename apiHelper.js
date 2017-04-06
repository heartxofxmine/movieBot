var mdb = require('moviedb')('15c8e7b002396f54915987483a51d4ca');
var omdb = require("./lib/omdbMovieInfo.js")
var r = require('request');

//Globals
var base_image_uri = 'https://image.tmdb.org/t/p/w185_and_h278_bestv2';

function getRandomMovie(done) {
    mdb.miscTopRatedMovies(function (err, res) {
        var TopMoviesPgs = res.total_pages;
        var randPg = Math.floor(Math.random() * (TopMoviesPgs - 0) + 0);
        var randId = Math.floor(Math.random() * (19 - 0) + 0);
        //Embedding because the movie_pages in res changes, so want to make sure the RandPg is always in scope
        mdb.miscTopRatedMovies({ page: randPg }, function (err, res) {
            var movie = res.results[randId];
            var movieDetails = {
                Title: movie.title,
                Poster: base_image_uri + movie.poster_path,
                Plot: movie.overview
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

function movieDetails(movieID, done) {
    mdb.movieInfo({ id: movieID }, function (data, res) {
        var movieDetails = {
            Title: res.title,
            Poster: base_image_uri + res.poster_path,
            Plot: res.overview,
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
};

function getIDforActor(actorName, done) {
    mdb.searchPerson({ query: actorName }, function (data, res) {
        console.log(res.results);
        var actorID = res.results[0].id;
        var actorPhotoPath = res.results[0].profile_path;
        var actorDetails = {
            ID: res.results[0].id,
            Photo: base_image_uri + res.results[0].profile_path,
        }
        //console.log(base_image_uri + actorPhotoPath);
        done(actorID);
    });
};

function getMovieByActor(actorName, done) {
    getIDforActor(actorName, function (actorID) {
        mdb.personMovieCredits({ id: actorID }, function (err, results) {
            var randMovie = Math.floor(Math.random() * (results.cast.length - 0) + 0);
            var movieID = results.cast[randMovie].id;
/*            var newMovie = results.cast[randMovie].title;
            console.log(results.cast);
            console.log(results.cast.length);
            console.log('Another movie is ' + newMovie);*/
            movieDetails(movieID, function(movieDetails){
                done(movieDetails);
            });
        });
    });
};


function getMoviebyYear() {
            mdb.discoverMovie
        }

exports.getRandomMovie = getRandomMovie;
exports.getMovieByActor = getMovieByActor;
