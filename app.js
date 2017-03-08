var builder = require('botbuilder');
var restify = require('restify');
var mdb = require('moviedb')('15c8e7b002396f54915987483a51d4ca');

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    function successCB(data) {
        console.log("Success callback: " + data);
    };

    function errorCB(data) {
        console.log("Error callback: " + data);
    };

    console.log('%s listening to %s', server.name, server.url);
});

// Create chat bot and listen to messages
var connector = new builder.ChatConnector({
    appId: '5a48ab3a-ed90-40f9-b8ff-03168d26658c', //process.env.MICROSOFT_APP_ID,
    appPassword: 'BAb8Tn6Ns9AMo8mdarj3Sgd', //process.env.MICROSOFT_APP_PASSWORD
});
server.post('/api/messages', connector.listen());
var bot = new builder.UniversalBot(connector);

// Dialogs
var Hotels = require('./hotels');
var Nope = require('./nope');
var Support = require('./support');

// Globals
var movies = [];
var base_image_uri = 'https://image.tmdb.org/t/p/w185_and_h278_bestv2';

// Setup dialogs
bot.dialog('nope', Nope.Dialog);
bot.dialog('hotels', Hotels.Dialog);
bot.dialog('support', Support.Dialog);

// Root dialog
bot.dialog('/', new builder.IntentDialog()
    .matchesAny([/help/i, /support/i, /problem/i], [
        function (session) {
            session.beginDialog('support');
        },
        function (session, result) {
            var tickerNumber = result.response;
            session.send('Thanks for contacting our support team. Your ticket number is %s.', tickerNumber);
            session.endDialog();
        }
    ])
    .onDefault([
        function (session) {
            //mdb.searchMovie({query: 'Pirates' }, function(data, res){
            var randId = Math.floor(Math.random() * (19 - 0) + 0);
            mdb.personMovieCredits({ id: 85 }, function (err, results) {
                var randMovie = Math.floor(Math.random() * (results.cast.length - 0) + 0);
                var newmovie = results.cast[randMovie].title;
                console.log(results.cast);
                console.log(results.cast.length);
                console.log('Another movie is ' + newmovie);
            });
            mdb.miscTopRatedMovies(function (err, res) {
                var TopMoviesPgs = res.total_pages;
                var randPg = Math.floor(Math.random() * (TopMoviesPgs - 0) + 0);
                //Embedding because the movie_pages in res changes, so want to make sure the RandPg is always in scope
                mdb.miscTopRatedMovies({ page: randPg }, function (err, res) {
                    console.log(res);
                    movies = res.results;
                    builder.Prompts.choice(
                        session,
                        'May I suggest ' + movies[randId].title + '?',
                        [Nope.Label, Hotels.Label],
                        {
                            maxRetries: 3,
                            retryPrompt: 'Not a valid option'
                        });
                        var moviePhotoPath = movies[randId].poster_path;
                        var msg = new builder.Message(session)
                            .attachments([{
                                contentType: "image/jpeg",
                                contentUrl: base_image_uri + moviePhotoPath
                            }]);
                        session.send(msg); 
                })
            });
            mdb.searchPerson({ query: 'Cate Blanchet' }, function (data, res) {
                console.log(res.results);
                console.log(res.results[0].id);
                var actorPhotoPath = res.results[0].profile_path;
                console.log(base_image_uri + actorPhotoPath);
            });
            // prompt for search option
            session.send('Hi there! I\'m a movie suggestion bot - here to \
            help you pick a movie to watch without wasting time searching \
            to choose one! With time I can learn your preferences and will \
            broaden searches!');
        },
        function (session, result) {
            if (!result.response) {
                // exhausted attemps and no selection, start over
                session.send('Seems I\'m having trouble understanding your request. I\'m handling that exception and you can try again!');
                return session.endDialog();
            }

            // on error, start over
            session.on('error', function (err) {
                session.send('Failed with message: %s', err.message);
                session.endDialog();
            });

            // continue on proper dialog
            var selection = result.response.entity;
            switch (selection) {
                case Nope.Label:
                    return session.beginDialog('nope');
                case Hotels.Label:
                    return session.beginDialog('hotels');
            }
        }
    ]));

