module.exports = {
    Label: 'Nope',
    Dialog: [
        // Destination
        function (session) {
            session.send('No problem! Let me know when I can help!');
            session.endDialog();
        }]
};