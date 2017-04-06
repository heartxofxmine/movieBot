var builder = require('botbuilder');
var restify = require('restify');
var apiHelper = require('./apiHelper.js');

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
        if (args.libraryName == "*") {
            apiHelper.getRandomMovie(function (moviedetails) {
                session.beginDialog("/Suggestion", moviedetails);
            });
        };
        var moviedetails = args;
        session.send('May I suggest ' + moviedetails.Title + '?');
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
                    .buttons([
                        builder.CardAction.dialogAction(session, "/Yes", null, "Sure, where can I watch it? "),
                        builder.CardAction.dialogAction(session, "/Another", null, "No thanks, suggest another "),
                        builder.CardAction.dialogAction(session, "/ActorsinMovie", null, "Who\'s in it?"),
                        builder.CardAction.openUrl(session, 'https://docs.botframework.com/en-us/', 'Watch the trailer')
                    ])
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
    [function (session) {
        builder.Prompts.text(session, 'Sure, what actor should I search by?');
    },
    function (session, results) {
        let actorName = results.response;
        apiHelper.getMovieByActor(actorName, function (movie) {
            session.beginDialog("/Suggestion", movie);
        });
    }]
);

bot.dialog('/GenreSearch',
    function (session, args) {
        session.send("Buttonsssss");
    }
);

bot.dialog('/ActorsinMovie',
    function (session, args) {
        //session.send("Sure, can I narrow down another suggestion by anything for you?");
        var actors = new builder.Message(session)
            .attachmentLayout(builder.AttachmentLayout.carousel)
            .attachments([
                new builder.HeroCard(session)
                    .title("Ben Affleck")
                    .images([
                        builder.CardImage.create(session, 'https://image.tmdb.org/t/p/w185_and_h278_bestv2/pYiAYDn3ltw9Fq7izODuq7oWYwX.jpg')
                    ]),
                new builder.ThumbnailCard(session)
                    .title("Robin Williams")
                    .images([
                        builder.CardImage.create(session, 'https://image.tmdb.org/t/p/w185_and_h278_bestv2/pYiAYDn3ltw9Fq7izODuq7oWYwX.jpg')
                    ])
            ]);
        var suggest = new builder.Message(session)
            .attachments([
                new builder.ThumbnailCard(session)
                    .text("Would you like to watch this?")
                    .buttons([
                        builder.CardAction.dialogAction(session, "/Yes", null, "Sure, where can I watch it? "),
                        builder.CardAction.dialogAction(session, "/Another", null, "No thanks, suggest another "),
                        builder.CardAction.openUrl(session, 'https://docs.botframework.com/en-us/', 'Watch the trailer')
                    ])
            ]);
        session.send(actors);
        session.send(suggest);
    }
);


bot.beginDialogAction('/Yes', '/Yes');
bot.beginDialogAction('/Another', '/Another');
bot.beginDialogAction('/ActorSearch', '/ActorSearch');
bot.beginDialogAction('/GenreSearch', '/GenreSearch');
bot.beginDialogAction('/Suggestion', '/Suggestion');
bot.beginDialogAction('/ActorsinMovie', '/ActorsinMovie');
