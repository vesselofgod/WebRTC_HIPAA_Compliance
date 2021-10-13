// message js
$('#send-message').on('submit', function (event) {
    event.preventDefault();
    var message = $('.messages-me').first().clone();
    message.find('p').text($('#input-me').val());
    $('#input-me').val('');
    message.prependTo('.messages-list');
    message.find('.minutes').text("0");
});