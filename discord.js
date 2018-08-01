const rp = require('request-promise');

var send = function(message) {
    var options = {
        method: 'POST',
        uri: '',
        body: {
            content: message
        },
        json: true
    }
    
    rp(options)
}

module.exports = send