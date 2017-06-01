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
    appId: '', //process.env.MICROSOFT_APP_ID, 
    appPassword: '' //process.env.MICROSOFT_APP_PASSWORD
});
server.post('/api/messages', connector.listen());
var bot = new builder.UniversalBot(connector);

//Dialog
bot.dialog('/', function (session) {
    //console.log(moviedetails);
    session.send('Hi there! I\'m a movie suggestion bot - here to \
            help you pick a movie to watch without wasting time searching \
            to choose one! With time I can learn your preferences and will \
            broaden searches!');
    apiHelper.getRandomMovie(function (moviedetails) {
        session.beginDialog("/Suggestion", moviedetails);
    });
});

bot.dialog('/Suggestion',
    function (session, args) {
        if (args.libraryName === "*") {
            apiHelper.getRandomMovie(function (moviedetails) {
                session.replaceDialog("/Suggestion", moviedetails);
            });
        };
        moviedetails = args;
        session.send('May I suggest ' + moviedetails.Title + '?');
        var dynamicButtons =
            [
                builder.CardAction.dialogAction(session, "/Yes", null, "Sure, where can I watch it? "),
                builder.CardAction.dialogAction(session, "/Another", null, "No thanks, suggest another "),
                builder.CardAction.dialogAction(session, "/ActorsinMovie", null, "Who\'s in it?"),
                builder.CardAction.openUrl(session, moviedetails.Trailer, 'Watch the trailer')
            ];
        if (moviedetails.searchedBy === "actor") {
            dynamicButtons.push(builder.CardAction.dialogAction(session, "/ActorSearch", moviedetails.searchValue, "Give me another with " + moviedetails.searchValue));
        }
        if (moviedetails.searchedBy === "year") {
            dynamicButtons.push(builder.CardAction.dialogAction(session, "/YearSearch", moviedetails.searchValue, "Give me another from " + moviedetails.searchValue));
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
        session.send(suggest);
    });

bot.dialog('/Yes',
    function (session, args) {
        session.send("On Netflix only right now");
    }
);

bot.dialog('/Another',
    function (session, args) {
        //session.send("Sure, can I narrow down another suggestion by anything for you?");
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
    //but skip first step in waterfall. still need to keep the query though, 
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
        apiHelper.getMovieByActor(actorName, function (movie) {
            if (movie !== null) {
                session.replaceDialog("/Suggestion", movie);
            }
            else {
                session.send("Please remove your gloves, type again ;-)")
                session.replaceDialog("/ActorSearch");
            }
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
            
            goNext = function(data) {
                next({ response: args.data });
            }
            
            var genreButtons =
            [
                builder.CardAction.dialogAction(session, "/", "actionadventure", "Acton/Adventure"),
                builder.CardAction.dialogAction(session, "/", null, "Family/Animation/Music"),
                builder.CardAction.dialogAction(session, "/", null, "Comedy"),
                builder.CardAction.dialogAction(session, "/", null, "Documentary"),
                builder.CardAction.dialogAction(session, "/", null, "Drama"),
                builder.CardAction.dialogAction(session, "/", null, "History/War"),
                builder.CardAction.dialogAction(session, "/", null, "Romance"),
                builder.CardAction.dialogAction(session, "/", null, "Sci-Fi/Fantasy"),
                builder.CardAction.dialogAction(session, "/", null, "Thriller/Crime/Mystery/Horror"),
                builder.CardAction.dialogAction(session, "/", null, "Western"),     
            ];
            var suggest = new builder.Message(session)
                .attachments([
                    //You can't make a hero card itself, it needs to be as part of an attachment
                    new builder.ThumbnailCard(session)
                        .buttons(genreButtons)
                ]);
                session.send(suggest);
        }
    },
    function (session, results) {
        let movieYear = results.response;
        apiHelper.getMovieByActor(movieYear, function (movie) {
            /*if (movie !== null) {*/
                session.replaceDialog("/Suggestion", movie);
            /*}
            else {
                session.send("Please make sure to give a 4-number year ;-)")
                session.replaceDialog("/YearSearch");
            }*/
        });
    }]
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
        console.log(movieYear);
        apiHelper.getMoviebyYear(movieYear, function (movie) {
            if (movie !== null) {
                session.replaceDialog("/Suggestion", movie);
            }
            else {
                session.send("Please make sure to give a 4-number year ;-)")
                session.replaceDialog("/YearSearch");
            }
        });
    }]
);

var buildActorHeroList = function (session, myActors, done) {
    var count = 0;
    var list = [];
    for (var i = 0; i < myActors.length; i++) {
        let currActor = myActors[i];
        apiHelper.getIDforActor(currActor, function (actorDetails) {
            //session.send(actorDetails.Photo + " " + currActor);
            list.push(
                new builder.HeroCard(session)
                    .title(currActor)
                    .images([
                        builder.CardImage.create(session, actorDetails.Photo)
                    ])
                    .buttons([
                        builder.CardAction.dialogAction(session, "/ActorSearch", currActor, "Give me a movie with " + currActor)])
            );
            count++;
            if (count >= myActors.length) {
                done(list);
            }
        });
    }
}

bot.dialog('/ActorsinMovie',
    function (session, args) {
        var myActors = moviedetails.Actors.split(", ");
        buildActorHeroList(session, myActors, function (actorHeroCardList) {

            var actors = new builder.Message(session)
                //For some reason this line keeps breaking other code, wait to use Adaptive Cards
                //.text("These are the main actors for " + moviedetails.Title)
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
                    //You can't make a hero card itself, it needs to be as part of an attachment
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
