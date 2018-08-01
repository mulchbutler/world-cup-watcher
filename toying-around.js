const rp = require('request-promise');
const util = require('util');


const FIFA_URL = 'https://api.fifa.com/api/v1'
const NOW_URL = '/live/football/now'
const ALL_URL = '/calendar/matches?idseason=254645&idcompetition=17&language=en-US'
const MATCH_EVENTS_URL = '/timelines/%s/%s/%s/%s?language=en-US' // IdCompetition/IdSeason/IdStage/IdMatch
const MATCH_URL = '/live/football/%s/%s/%s/%s?language=en-US' // IdCompetition/IdSeason/IdStage/IdMatch


const Period = {
  FIRST_PERIOD: 3,
  SECOND_PERIOD: 5,
  PENALTY_SHOOTOUT: 11
}

const EventType = {
  GOAL_SCORED: 0,
  UNKNOWN_1: 1,
  YELLOW_CARD: 2,
  RED_CARD: 3,
  DOUBLE_YELLOW: 4,
  SUBSTITUTION: 5,
  IGNORE: 6,
  MATCH_START: 7,
  HALF_END: 8,
  BLOCKED_SHOT: 12,
  FOUL: 14,
  UNKNOWN_13: 13, // goalie catch?
  OFFSIDE: 15,
  CORNER_KICK: 16,
  BLOCKED_SHOT_2: 17,
  FOUL_AGAINST_PLAYER: 18,
  UNKNOWN_19: 19,
  UNKNOWN_20: 20, //player tripped?
  UNKNOWN_22: 22,
  UNKNOWN_23: 23,
  THROW_IN: 24,
  MATCH_END: 26,
  UNKNOWN_27: 27, //Penalty kick?
  UNKNOWN_29: 29,
  UNKNOWN_30: 30,
  CROSSBAR: 32,
  CROSSBAR_2: 33,
  OWN_GOAL: 34,
  HAND_BALL: 37,
  FREE_KICK_GOAL: 39,
  PENALTY_GOAL: 41,
  FREE_KICK_CROSSBAR: 44,
  UNKNOWN_51: 51,
  PENALTY_MISSED: 60,
  UNKNOWN_71: 71,
  VAR_PENALTY: 72,
  UNKNOWN: 9999
}

var getEventLine = function (current_match, player_list, event, onlyVitalMessages = true) {
  extraInfo = false
  player = player_list[event.IdPlayer]
  sub_player = player_list[event.IdSubPlayer]

  if (event.IdTeam == current_match.HomeTeam.IdTeam)
    active_team = current_match.HomeTeam.TeamName[0].Description
  else
    active_team = current_match.AwayTeam.TeamName[0].Description

  if (event.Type == EventType.GOAL_SCORED || event.Type == EventType.FREE_KICK_GOAL ||
    event.Type == EventType.FREE_KICK_GOAL) {
    event_message = util.format('%s GOOOOAL! %s %s:%s %s', event.MatchMinute, current_match.HomeTeam.TeamName[0].Description, event.HomeGoals, event.AwayGoals, current_match.AwayTeam.TeamName[0].Description)
    extraInfo = true
  } else if (event.Type == EventType.YELLOW_CARD) {
    event_message = util.format('%s Yellow card.', event.MatchMinute)
    extraInfo = true
  } else if (event.Type == EventType.RED_CARD) {
    event_message = util.format('%s Red card.', event.MatchMinute)
    extraInfo = true
  } else if (event.Type == EventType.DOUBLE_YELLOW) {
    event_message = util.format('%s Second yellow card.', event.MatchMinute)
    extraInfo = true
  } else if (event.Type == EventType.SUBSTITUTION) {
    event_message = util.format('%s Substitution for %s.', event.MatchMinute, active_team)
    if (player && sub_player)
      event_message += util.format('\n> %s comes on for %s.', player, sub_player)
  } else if (event.Type == EventType.MATCH_START) {
    period = ""
    if (event.Period == Period.FIRST_PERIOD) {
      event_message = util.format('The match between %s && %s has begun!', current_match.HomeTeam.TeamName[0].Description, current_match.AwayTeam.TeamName[0].Description)
      exec('say y rueda la pelota', (err, stdout, stderr) => {});
    } else if (event.Period == Period.SECOND_PERIOD)
      event_message = util.format('The second half of the match between %s && %s has begun!', current_match.HomeTeam.TeamName[0].Description, current_match.AwayTeam.TeamName[0].Description)
    else if (event.Period == Period.PENALTY_SHOOTOUT)
      event_message = util.format('The penalty shootout is starting between %s && %s!', current_match.HomeTeam.TeamName[0].Description, current_match.AwayTeam.TeamName[0].Description)
    else
      event_message = util.format('The match between %s && %s is starting again!', current_match.HomeTeam.TeamName[0].Description, current_match.AwayTeam.TeamName[0].Description)
  } else if (event.Type == EventType.HALF_END) {
    period = ""
    if (event.Period == Period.FIRST_PERIOD)
      period = 'first'
    else if (event.Period == Period.SECOND_PERIOD)
      period = 'second'
    else if (event.Period == Period.PENALTY_SHOOTOUT)
      event_message = 'The penalty shootout is over.'
    else
      period = 'invalid'
    event_message = util.format('End of the half. %s %s:%s %s.', current_match.HomeTeam.TeamName[0].Description, event.HomeGoals, event.AwayGoals, current_match.AwayTeam.TeamName[0].Description)
    if (period != null)
      event_message = util.format('End of the %s half. %s %s:%s %s.', period, current_match.HomeTeam.TeamName[0].Description, event.HomeGoals, event.AwayGoals, current_match.AwayTeam.TeamName[0].Description)
  } else if (event.Type == EventType.MATCH_END) {
    event_message = util.format('The match between %s && %s has ended. %s %s:%s %s.', current_match.HomeTeam.TeamName[0].Description, current_match.AwayTeam.TeamName[0].Description,
      current_match.HomeTeam.TeamName[0].Description, event.HomeGoals, event.AwayGoals, current_match.AwayTeam.TeamName[0].Description)
    say = ''
    if (event.HomeGoals > event.AwayGoals) {
      say = current_match.HomeTeam.TeamName[0].Description + ' wins the game!'
    } else if (event.HomeGoals < event.AwayGoals) {
      say = current_match.AwayTeam.TeamName[0].Description + ' wins the game!'
    } else {
      say = 'The game ends in a tie!'
    }

  } else if (event.Type == EventType.OWN_GOAL) {
    event_message = util.format(' %s Own Goal! %s %s:%s %s', event.MatchMinute, current_match.HomeTeam.TeamName[0].Description, event.HomeGoals, event.AwayGoals, current_match.AwayTeam.TeamName[0].Description)
    extraInfo = true
  } else if (event.Type == EventType.PENALTY_GOAL) {
    if (event.Period == Period.PENALTY_SHOOTOUT)
      event_message = util.format(' Penalty goal! %s *%s (%s):%s (%s)* %s', current_match.HomeTeam.TeamName[0].Description, event.HomeGoals, event['home_pgoals'], event.AwayGoals, event['away_pgoals'], current_match.AwayTeam.TeamName[0].Description)
    else
      event_message = util.format(' %s Penalty goal! %s %s:%s %s', event.MatchMinute, current_match.HomeTeam.TeamName[0].Description, event.HomeGoals, event.AwayGoals, current_match.AwayTeam.TeamName[0].Description)
    extraInfo = true
  } else if (event.Type == EventType.PENALTY_MISSED) {
    if (event.Period == Period.PENALTY_SHOOTOUT)
      event_message = util.format(' Penalty missed! %s *%s (%s):%s ()%s* %s', current_match.HomeTeam.TeamName[0].Description, event.HomeGoals, event['home_pgoals'], event.AwayGoals, event['away_pgoals'], current_match.AwayTeam.TeamName[0].Description)
    else
      event_message = util.format(' %s Penalty missed!', event.MatchMinute)
    extraInfo = true
  } else if ((event.Type == EventType.FOUL_AGAINST_PLAYER || event.Type == EventType.FOUL) && !onlyVitalMessages) {
    event_message = util.format('%s Foul for %s.', event.MatchMinute, active_team)
    if (player && sub_player)
      event_message += util.format('\n> %s fouled against %s.', player, sub_player)
    else if (player)
      event_message += util.format('\n> %s fouled.', player)
    else if (sub_player)
      event_message += util.format('\n> %s fouled.', sub_player)
  } else if (event.Type == EventType.BLOCKED_SHOT && !onlyVitalMessages) {
    event_message = util.format('%s %s (%s) takes a shot...', event.MatchMinute, player, active_team)
    if (sub_player)
      event_message += util.format('\n> but %s manages to block it!', sub_player)
    else
      event_message += '\n> but they miss!'
  } else if (event.Type == EventType.BLOCKED_SHOT_2) {
    event_message = util.format('%s %s (%s) blocks a shot!', event.MatchMinute, player, active_team)
  } else if (event.Type == EventType.CORNER_KICK && !onlyVitalMessages) {
    event_message = util.format('%s %s (%s) takes a corner kick', event.MatchMinute, player, active_team)
  } else if (event.Type == EventType.THROW_IN && !onlyVitalMessages) {
    event_message = util.format('%s %s throws the ball back in', event.MatchMinute, active_team)
  } else if (event.Type == EventType.OFFSIDE && !onlyVitalMessages) {
    event_message = util.format('%s %s (%s) was ruled offside', event.MatchMinute, player, active_team)
  } else if (event.Type == EventType.UNKNOWN_13 && !onlyVitalMessages) {
    event_message = util.format('%s\' Type:%s, Player:%s, Sub_Player:%s, Team:%s guess goalie catch?', event.MatchMinute, event.Type, player, sub_player, active_team)
  } else
    event_message = util.format('%s\' Type:%s, Player:%s, Sub_Player:%s, Team:%s', event.MatchMinute, event.Type, player, sub_player, active_team)

  if (extraInfo)
    if (player && active_team)
      event_message += util.format('\n> %s (%s)', player, active_team)
  else if (active_team)
    event_message += util.format('\n> %s', active_team)

  if (event_message) {
    return event_message
  } else
    return '' // event.Type + ' -> ' + event.MatchMinute
}



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
        if (match.IdCompetition == 17 && matches.indexOf(match) == -1 && match.IdMatch == '300331519') {
          matches.push(match)
        }
      })
    }).catch(err => {
      console.error('Glitch getting current matches')
    });
}

getMatches()

//setInterval(getMatches, match_interval);

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
          mesage = getEventLine(match, players, event, false)
          if (mesage != '') {
            console.log(mesage)
          }
        }
      })
    }).catch(err => {
      console.error('Glitch getting match info')
    });
  })
}, event_interval);