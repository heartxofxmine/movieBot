require('dotenv').config();
var builder = require('botbuilder');
var restify = require('restify');
var apiHelper = require('./apiHelper.js');

var moviedetails;

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
    appId: process.env.MICROSOFT_APP_ID ? process.env.MICROSOFT_APP_ID : '', //process.env.MICROSOFT_APP_ID, 
    appPassword: process.env.MICROSOFT_APP_PASSWORD ? process.env.MICROSOFT_APP_PASSWORD : '' //process.env.MICROSOFT_APP_PASSWORD
});
server.post('/api/messages', connector.listen());
var bot = new builder.UniversalBot(connector);

//Dialog
bot.dialog('/', function (session) {
    session.send('Hi there! I\'m FlickPick, a movie suggestion bot - here to \
            help you pick a movie to watch without wasting time searching \
            to choose one! With time I can learn your preferences and will \
            broaden searches!');

    apiHelper.getRandomMovie().then(function (moviedetails) {
        session.beginDialog("/Suggestion", moviedetails);
    });
});

bot.dialog('/Suggestion',
    function (session, args) {
        if (args.libraryName === "*") {
            apiHelper.getRandomMovie().then(function (moviedetails) {
                session.beginDialog("/Suggestion", moviedetails);
            });
        }
        //the Else makes sure that if there are no movie details, get some, and if there are some
        //then run else. But only run else if the IF is false, being there are no moviedetails
        else {
            moviedetails = args;
            session.send('May I suggest ' + moviedetails.Title + '?');
            var dynamicButtons =
                [
                    builder.CardAction.dialogAction(session, "/ActorsinMovie", null, "Who\'s in it?"),
                    builder.CardAction.openUrl(session, moviedetails.Trailer, "Watch the trailer"),
                    builder.CardAction.dialogAction(session, "/Yes", null, "Sure, where can I watch it?"),
                    builder.CardAction.dialogAction(session, "/Another", null, "No thanks, suggest another")
                ];
            if (moviedetails.searchedBy === "actor") {
                dynamicButtons.push(builder.CardAction.dialogAction(session, "/ActorSearch", moviedetails.searchValue, "Give me another with " + moviedetails.searchValue));
            }
            if (moviedetails.searchedBy === "year") {
                dynamicButtons.push(builder.CardAction.dialogAction(session, "/YearSearch", moviedetails.searchValue, "Give me another from " + moviedetails.searchValue));
            }
            if (moviedetails.searchedBy === "genre") {
                dynamicButtons.push(builder.CardAction.dialogAction(session, "/GenreSearch", moviedetails.searchValue, "Give me another " + moviedetails.searchValue + " movie"));
            }
            var suggest = new builder.Message(session)
                .attachments([
                    //You can't make a hero card itself, it needs to be as part of an attachment
                    new builder.ThumbnailCard(session)
                        .title(moviedetails.Title)
                        .subtitle(moviedetails.Year + ' | ' + moviedetails.Genres + ' | ' + moviedetails.Rating + '/10')
                        .text(moviedetails.Plot)
                        .images([
                            builder.CardImage.create(session, moviedetails.Poster)
                ])
                .buttons(dynamicButtons)
            ]);
        }
        session.send(suggest);
    }
);

bot.dialog('/Yes',
    function (session, args) {
        if (Object.keys(moviedetails.StreamSources).length == 0 && Object.keys(moviedetails.PaidSources).length == 0) {
            session.send("This movie actually isn't available to stream at the moment! Sorry for being such a tease!");
            //session.beginDialog('/Suggestion');
        } else {
            //This code applicable for demo-purposes to just a single partner
            /*if ("FandangoNOW" in moviedetails.PaidSources) {
                var suggest = new builder.Message(session)
                    .attachments([
                        new builder.ThumbnailCard(session)
                            .text("You can PURCHASE to watch the movie here")
                            .buttons([
                                builder.CardAction.openUrl(session, moviedetails.PaidSources["FandangoNOW"], "FandangoNOW")
                            ])
                    ]);
                session.send(suggest);
            }
            if (!("FandangoNOW" in moviedetails.PaidSources)) {
                var suggest = new builder.Message(session)
                    .attachments([
                        //You can't make a hero card itself, it needs to be as part of an attachment
                        new builder.ThumbnailCard(session)
                            .text("You can stream the movie here")
                            .buttons([
                                builder.CardAction.openUrl(session, "http://www.fandango.com", "FandangoNOW")
                            ])
                    ]);
                session.send(suggest);
            }*/

            //moviedetails.Sources isn't null because it's always an element in a full object, 
            //so have to find its data this way
            if (Object.keys(moviedetails.StreamSources).length > 0) {
                var StreamButtons = [];
                Object.keys(moviedetails.StreamSources).forEach(function (source) {
                    StreamButtons.push(builder.CardAction.openUrl(session, moviedetails.StreamSources[source], source));
                });
                var suggest = new builder.Message(session)
                    .attachments([
                        new builder.ThumbnailCard(session)
                            .title("You can stream the movie here:")
                            .buttons(StreamButtons)
                    ]);
                session.send(suggest);
            }
            if (Object.keys(moviedetails.PaidSources).length > 0) {
                var PaidButtons = [];
                Object.keys(moviedetails.PaidSources).forEach(function (source) {
                    PaidButtons.push(builder.CardAction.openUrl(session, moviedetails.PaidSources[source], source));
                });
                var suggest = new builder.Message(session)
                    .attachments([
                        new builder.ThumbnailCard(session)
                            .title("You can rent/buy the movie here")
                            .buttons(PaidButtons)
                    ]);
                session.send(suggest);
            }
        }
    }
);

bot.dialog('/Another',
    function (session, args) {
        var suggest = new builder.Message(session)
            .attachments([
                new builder.ThumbnailCard(session)
                    .text("Sure, can I narrow down another suggestion by anything for you?")
                    .buttons([
                        builder.CardAction.dialogAction(session, "/ActorSearch", null, "Actor"),
                        builder.CardAction.dialogAction(session, "/GenreSearch", null, "Genre"),
                        builder.CardAction.dialogAction(session, "/YearSearch", null, "Year"),
                        builder.CardAction.dialogAction(session, "/Suggestion", null, "No, just suggest another")
                    ])
            ]);
        session.send(suggest);
    }
);

bot.dialog('/ActorSearch',
    //If the user wants another movie by same actor, route to here, 
    //but skip first step in waterfall. Still need to keep the query though, 
    //saving the response args.data
    [function (session, args, next) {
        if (args && args.data) {
            next({ response: args.data });
        }
        else {
            builder.Prompts.text(session, 'What actor should I search by?');
        }
    },
    function (session, results) {
        let actorName = results.response;
        apiHelper.getMovieByActor(actorName)
            .then(function (moviedetails) {
                session.beginDialog("/Suggestion", moviedetails);
            }).catch(function (reason) {
                session.send("Please remove your gloves, type again ;-)")
                session.replaceDialog("/ActorSearch");
            });
    }]
);

bot.dialog('/GenreSearch',
    [function (session, args, next) {
        if (args && args.data) {
            next({ response: args.data });
        }
        else {
            builder.Prompts.text(session, 'What type of movie can I suggest to you?');

            goNext = function (data) {
                next({ response: args.data });
            }

            var genreButtons = [];
            Object.keys(apiHelper.genresList).forEach(function (genre) {
                genreButtons.push(builder.CardAction.postBack(session, genre, genre));
            });

            var suggest = new builder.Message(session)
                .attachments([
                    new builder.ThumbnailCard(session)
                        .buttons(genreButtons)
                ]);
            session.send(suggest);
        }
    },
    function (session, results) {
        let genre = results.response;
        apiHelper.getMoviebyGenre(genre)
            .then(function (moviedetails) {
                session.beginDialog("/Suggestion", moviedetails);
            }).catch(function (reason) {
                session.send("Please only select one of the above genres")
                session.replaceDialog("/GenreSearch");
            });
    }
    ]
);

bot.dialog('/YearSearch',
    [function (session, args, next) {
        if (args && args.data) {
            next({ response: args.data });
        }
        else {
            builder.Prompts.text(session, 'From what year do you want to watch a movie?');
        }
    },
    function (session, results) {
        let movieYear = results.response;
        //console.log(movieYear);
        apiHelper.getMoviebyYear(movieYear)
            .then(function (moviedetails) {
                session.beginDialog("/Suggestion", moviedetails);
            }).catch(function (reason) {
                session.send("Please make sure to give a 4-number year ;-)")
                session.replaceDialog("/YearSearch");
            });

        /*       apiHelper.getMoviebyYear(movieYear, function (movie) {
                   if (movie !== null) {
                       session.replaceDialog("/Suggestion", movie);
                   }
                   else {
                       session.send("Please make sure to give a 4-number year ;-)")
                       session.replaceDialog("/YearSearch");
                   }
               });*/
    }]
);

var buildActorHeroList = function (session, myActors, done) {
    var count = 0;
    var list = [];
    for (var i = 0; i < myActors.length; i++) {
        let currActor = myActors[i];
        apiHelper.getActorByName(currActor)
            .then(function (actorDetails) {
                if (actorDetails) {
                    list.push(
                        new builder.HeroCard(session)
                            .title(currActor)
                            .images([
                                builder.CardImage.create(session, actorDetails.Photo)
                            ])
                            .buttons([
                                builder.CardAction.dialogAction(session, "/ActorSearch", currActor, "Give me a movie with " + currActor)])
                    );
                }
                else {
                    console.log("Unable to get info on " + currActor);
                }
                count++;
                if (count >= myActors.length) {
                    done(list);
                }
            });
    }
}

bot.dialog('/ActorsinMovie',
    function (session, args) {
        var myActors = moviedetails.Actors; //could do .split(", ")
        buildActorHeroList(session, myActors, function (actorHeroCardList) {

            var actors = new builder.Message(session)
                .attachmentLayout(builder.AttachmentLayout.carousel)
                .attachments(actorHeroCardList);

            var dynamicActorButtons =
                [
                    builder.CardAction.dialogAction(session, "/Yes", null, "Sure, where can I watch it? "),
                    builder.CardAction.dialogAction(session, "/Another", null, "No thanks, suggest another "),
                    builder.CardAction.openUrl(session, moviedetails.Trailer, 'Watch the trailer')
                ];
            if (moviedetails.searchedBy === "actor") {
                dynamicActorButtons.push(builder.CardAction.dialogAction(session, "/ActorSearch", moviedetails.searchValue, "Give me another with " + moviedetails.searchValue));
            }
            var suggest = new builder.Message(session)
                .attachments([
                    new builder.ThumbnailCard(session)
                        .text("Would you like to watch this?")
                        .buttons(dynamicActorButtons)

                ]);

            session.send(actors);
            session.send(suggest);
        });
    }
);


bot.beginDialogAction('/Suggestion', '/Suggestion');
bot.beginDialogAction('/Yes', '/Yes');
bot.beginDialogAction('/Another', '/Another');
bot.beginDialogAction('/ActorSearch', '/ActorSearch');
bot.beginDialogAction('/GenreSearch', '/GenreSearch');
bot.beginDialogAction('/YearSearch', '/YearSearch');
bot.beginDialogAction('/ActorsinMovie', '/ActorsinMovie');
