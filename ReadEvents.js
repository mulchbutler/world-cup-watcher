const util = require('util');
const {
    exec
} = require('child_process');

const Period = {
    FIRST_PERIOD: 3,
    SECOND_PERIOD: 5,
    FIRST_EXTRA_TIME: 7,
    SECOND_EXTRA_TIME: 9,
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
    UNKNOWN_13: 13,
    OFFSIDE: 15,
    CORNER_KICK: 16,
    BLOCKED_SHOT_2: 17,
    FOUL_AGAINST_PLAYER: 18,
    UNKNOWN_19: 19, // Coin Flip
    UNKNOWN_20: 20,
    UNKNOWN_22: 22,
    UNKNOWN_23: 23,
    OUT_OF_BOUNDS: 24, //Goalie catches? or out of bounds/throw?// out of bounds?
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

    if (event.IdTeam == current_match.HomeTeam.IdTeam) {
        active_team = current_match.HomeTeam.TeamName[0].Description
        sub_team = current_match.AwayTeam.TeamName[0].Description
    } else {
        active_team = current_match.AwayTeam.TeamName[0].Description
        sub_team = current_match.HomeTeam.TeamName[0].Description
    }
    if (event.Type == EventType.GOAL_SCORED || event.Type == EventType.FREE_KICK_GOAL ||
        event.Type == EventType.FREE_KICK_GOAL) {
        event_message = util.format('%s GOOOOAL! %s %s:%s %s', event.MatchMinute, current_match.HomeTeam.TeamName[0].Description, event.HomeGoals, event.AwayGoals, current_match.AwayTeam.TeamName[0].Description)
        extraInfo = true
        exec('say ' + active_team + ' GOOOOOOOOOOOOOOOAL', (err, stdout, stderr) => {});
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
            exec('say y rueda la pelota', () => {});
        } else if (event.Period == Period.SECOND_PERIOD) {
            event_message = util.format('The second half of the match between %s && %s has begun!', current_match.HomeTeam.TeamName[0].Description, current_match.AwayTeam.TeamName[0].Description)
            exec('say y rueda la pelota', () => {});
        } else if (event.Period == Period.FIRST_EXTRA_TIME) {
            event_message = util.format('The first half of extra time between %s && %s has begun!', current_match.HomeTeam.TeamName[0].Description, current_match.AwayTeam.TeamName[0].Description)
            exec('say y rueda la pelota', () => {});
        } else if (event.Period == Period.SECOND_EXTRA_TIME) {
            event_message = util.format('The second half of extra time between %s && %s has begun!', current_match.HomeTeam.TeamName[0].Description, current_match.AwayTeam.TeamName[0].Description)
            exec('say y rueda la pelota', () => {});
        } else if (event.Period == Period.PENALTY_SHOOTOUT)
            event_message = util.format('The penalty shootout is starting between %s && %s!', current_match.HomeTeam.TeamName[0].Description, current_match.AwayTeam.TeamName[0].Description)
        else
            event_message = util.format('The match between %s && %s is starting again! %s', current_match.HomeTeam.TeamName[0].Description, current_match.AwayTeam.TeamName[0].Description,event.Period)
    } else if (event.Type == EventType.HALF_END) {
        period = ""
        if (event.Period == Period.FIRST_PERIOD)
            period = 'first half'
        else if (event.Period == Period.SECOND_PERIOD)
            period = 'second half'
        else if (event.Period == Period.FIRST_EXTRA_TIME)
            period = 'first extra time half'
        else if (event.Period == Period.SECOND_EXTRA_TIME)
            period = 'second extra time half'
        else if (event.Period == Period.PENALTY_SHOOTOUT)
            period = 'penalty shootout'
        else
            period = util.format('invalid (%s)',event.Period)
        event_message = util.format('End of the half. %s %s:%s %s.', current_match.HomeTeam.TeamName[0].Description, event.HomeGoals, event.AwayGoals, current_match.AwayTeam.TeamName[0].Description)
        if (period != null)
            event_message = util.format('End of the %s. %s %s:%s %s.', period, current_match.HomeTeam.TeamName[0].Description, event.HomeGoals, event.AwayGoals, current_match.AwayTeam.TeamName[0].Description)
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
        exec('say ' + say, (err, stdout, stderr) => {});

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
        if (!sub_player)
            event_message += '\n> but they miss!'
    } else if (event.Type == EventType.BLOCKED_SHOT_2 && !onlyVitalMessages) {
        event_message = util.format('> but %s (%s) pulls off the save!', player, active_team)
    } else if (event.Type == EventType.CORNER_KICK && !onlyVitalMessages) {
        event_message = util.format('%s %s (%s) takes a corner kick', event.MatchMinute, player, active_team)
    } else if(event.Type == EventType.OUT_OF_BOUNDS) {
        event_message = util.format('%s Out of bounds, %s gets the ball', event.MatchMinute, active_team)
        if (player && sub_player)
            event_message += util.format('\n> %s <- Player : Sub -> %s.', player, sub_player)
        else if (player)
            event_message += util.format('\n> %s <- Plsyer.', player)
        else if (sub_player)
            event_message += util.format('\n> %s <-Sub', sub_player)
    } else {
        event_message = ""
        event_message = `Unknown event ${event.Type}`
        event_message += `\n> min: ${event.MatchMinute} player: ${player} active_team: ${active_team} sub_player: ${sub_player} sub_team: ${sub_team}`
    }


    //BLOCKED_SHOT
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

module.exports = getEventLine