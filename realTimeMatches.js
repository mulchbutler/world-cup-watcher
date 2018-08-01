const rp = require('request-promise');
const util = require('util');
const eventLine = require('./ReadEvents');


const FIFA_URL = 'https://api.fifa.com/api/v1'
const NOW_URL = '/live/football/now'
const ALL_URL = '/calendar/matches?idseason=254645&idcompetition=17&language=en-US'
const MATCH_EVENTS_URL = '/timelines/%s/%s/%s/%s?language=en-US' // IdCompetition/IdSeason/IdStage/IdMatch
const MATCH_URL = '/live/football/%s/%s/%s/%s?language=en-US' // IdCompetition/IdSeason/IdStage/IdMatch

matches = []
events = []
players = {}
var seconds = 1,
    event_interval = 10 * seconds * 1000,
    match_interval = 60 * seconds * 1000;

var getMatches = function () {
    rp({
            uri: FIFA_URL + NOW_URL,
            rejectUnauthorized: false,
            json: true
        })
        .then(response => {
            response.Results.forEach(match => {
                if (match.IdCompetition == 17 && matches.indexOf(match) == -1) {
                    matches.push(match)
                }
            })
        }).catch(err =>{
            console.error('Glitch getting current matches')
        });
}

getMatches()

setInterval(getMatches, match_interval);

setInterval(function () {
    matches.forEach(match => {
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
            matchInfo.Event.forEach(event => {
                if (events.indexOf(event.EventId) == -1) {
                    events.push(event.EventId)
                    mesage = eventLine(match, players, event, false)
                    if (mesage != '') {
                        console.log(mesage)
                    }
                }
            })
        }).catch(err =>{
            console.error('Glitch getting match info')
        });
    })
}, event_interval);