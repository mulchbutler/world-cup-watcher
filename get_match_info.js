const rp = require('request-promise');
const util = require('util');
const eventLine = require('./ReadEvents');
const discord = require('./discord');


const FIFA_URL = 'https://api.fifa.com/api/v1'
const NOW_URL = '/live/football/now'
const ALL_URL = '/calendar/matches?idseason=254645&idcompetition=17&language=en-US'
const MATCH_EVENTS_URL = '/timelines/%s/%s/%s/%s?language=en-US' // IdCompetition/IdSeason/IdStage/IdMatch
const MATCH_URL = '/live/football/%s/%s/%s/%s?language=en-US' // IdCompetition/IdSeason/IdStage/IdMatch



rp({
    uri: util.format(FIFA_URL + MATCH_URL, 17, 254645, 275073, 300340183), // IdCompetition/IdSeason/IdStage/IdMatch
    rejectUnauthorized: false,
    json: true
}).then(match => {
    if (match.IdCompetition == 17) {
        players = {}
        match.HomeTeam.Players.forEach(player => {
            players[player.IdPlayer] = player.ShortName[0].Description
        })
        match.AwayTeam.Players.forEach(player => {
            players[player.IdPlayer] = player.ShortName[0].Description
        })
        rp({
            uri: util.format(FIFA_URL + MATCH_EVENTS_URL, match.IdCompetition, match.IdSeason, match.IdStage, match.IdMatch),
            rejectUnauthorized: false,
            json: true
        }).then(matchInfo => {
            //matchInfo.Event.forEach(event => {
            var i = 0
            var seconds = 1,
                the_interval = seconds * 1000;
            setInterval(function () {
                var event = matchInfo.Event[i]
                message = eventLine(match, players, event, false)
                if (message != '') {
                    console.log(message)
                    discord(message)
                }
                i++

            }, the_interval);
            //})
        })

    }
})