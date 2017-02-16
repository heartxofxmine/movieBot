var builder = require('botbuilder');
var restify = require('restify');

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log('%s listening to %s', server.name, server.url);
});

// Create chat bot and listen to messages
var connector = new builder.ChatConnector({
    appId: '', //process.env.MICROSOFT_APP_ID,
    appPassword: '', //process.env.MICROSOFT_APP_PASSWORD
});
server.post('/api/messages', connector.listen());
var bot = new builder.UniversalBot(connector);

// Dialogs
var Hotels = require('./hotels');
var Nope = require('./nope');
var Support = require('./support');

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
            // prompt for search option
            builder.Prompts.choice(
                session,
                'Can I help you pick a movie?',
                [Nope.Label, Hotels.Label],
                {
                    maxRetries: 3,
                    retryPrompt: 'Not a valid option'
                });
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

