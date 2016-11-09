var lastUsers = [];
var permuteTeams = {};

var users = [];
var selectedTeams = [];

var tempData = {
    teams: [],
    users: []
}


// console.log(matches);
var vm = new Vue({
    el: "#contents",
    data: {
        "session_key": "",
        "matches": {},
        "playersMatchCount": {},
        "defaultTeams": defaultTeams,
        "selectedTeams": selectedTeams,
        "players": {},
        "shownItemNumber": 0,
        "histories": {},
    },
    created: function(){
        if(this.session_key == "")
            this.session_key = new Date().getTime();

        this.histories = storageController.getHistory();
    },
    computed:{
        teams: function(){
            var self = this;
            return this.defaultTeams.filter( function(el) {
                if( self.selectedTeams.indexOf(el.name) != -1 ) return true;
                return false;
            })
        },
        playersCount: function(){
            return Object.size(this.players);
        },
        playersByPoints: function(){
            var playersByPoints = {};
            for(playerIndex in this.players){
                var currentPlayer = this.players[playerIndex];
                if ( !(parseInt(currentPlayer.points) >= 0) ) continue;
                if( ! (currentPlayer.points in playersByPoints) ){
                    playersByPoints[currentPlayer.points] = [];
                }                    
                playersByPoints[currentPlayer.points].push(currentPlayer);
            }
            return playersByPoints;
        },
        firstThreePlace: function(){
            var players = this.playersByPoints;
            var points = Object.keys(players);
            var firstThreePlayers = {};

            var trial = 3;
            var i = 0;
            while ( trial > 0 && points.length > 0 ) {
                var max = Math.max.apply(null, points);
                firstThreePlayers[i++] = players[max];
                points.splice( points.indexOf(max), 1);
                trial--;
            }
            // console.log(firstThreePlayers);
            return firstThreePlayers;
        },
        playerGroupsCount: function(){
            var playerGroupsCount = {};
            for( matchKey in this.matches ) {
                var currentMatch = this.matches[matchKey];
                var leftKey = currentMatch.left.players[0].name + " & " + currentMatch.left.players[1].name;
                var leftID = String(currentMatch.left.players[0].id + currentMatch.left.players[1].id);
                var rightKey = currentMatch.right.players[0].name + " & " + currentMatch.right.players[1].name;
                var rightID = String(currentMatch.right.players[0].id + currentMatch.right.players[1].id);

                if( !(leftID in playerGroupsCount))
                    playerGroupsCount[leftID] = {
                        count: 0,
                        name: leftKey
                    };
                if( !(rightID in playerGroupsCount))
                    playerGroupsCount[rightID] = {
                        count: 0,
                        name: rightKey
                    };

                playerGroupsCount[leftID].count += 1;
                playerGroupsCount[rightID].count += 1;
            }
            return playerGroupsCount;
        }
    },
    methods:{
        getLength: function (objArrMixed, optionalKey) {
            var len = 0;
            // self.debug("\n\ngetLength", arguments);
            if(objArrMixed){
                if(optionalKey){
                    if( optionalKey in objArrMixed){
                        len = Object.keys(objArrMixed[optionalKey]).length;
                    }
                }
                else{
                    len = Object.keys(objArrMixed).length;
                }
            }
            // self.debug("\n\ngetLength Returns", objArrMixed, optionalKey, len);
            return len;
        },
        updatePoints: function(match, side){
            var sideStatus = match[side].status;

            var anotherSide = (side == 'left'?'right':'left');
            // var anotherSideStatus = match[anotherSide].status;
            // var updatedSidePoints = parseInt(match[side].points);
            // console.log("updatedSidePoints", updatedSidePoints);
            var updateValue;
            // switch(updatedSidePoints){
            switch(sideStatus){
                case "NA":
                    match[anotherSide].status = "NA";
                    match[side].points = "";
                    match[anotherSide].points = "";
                break;
                case "Won":
                    match[side].points = 3;

                    match[anotherSide].status = "Lost";
                    match[anotherSide].points = 0;
                break;
                case "Draw":
                    match[side].points = 1;
                    
                    match[anotherSide].status = "Draw";
                    match[anotherSide].points = 1;
                break;
                case "Lost":
                    match[side].points = 0;
                    
                    match[anotherSide].status = "Won";
                    match[anotherSide].points = 3;
                break;
            }
            
            for (playerIndex in match[side].players){
                var player = match[side].players[playerIndex];
                match[side]['playerPoints'][player.name] = match[side].points;
            }
            for (playerIndex in match[anotherSide].players){
                var player = match[anotherSide].players[playerIndex];
                match[anotherSide]['playerPoints'][player.name] = match[anotherSide].points;
            }


            //Re-calculating everybody
            for(playerKey in this.players){
                var currentPlayer = this.players[playerKey];
                currentPlayer.points = 0;
            }

            for( matchKey in this.matches){
                var currentMatch = this.matches[matchKey];
                if( currentMatch.left.status == "NA" || currentMatch.right.status == "NA" ) 
                    continue;
                for( playerIndex in currentMatch.left.players){
                    var currentPlayer = currentMatch.left.players[playerIndex];
                    var currentPoint = currentMatch.left.playerPoints[currentPlayer.name];
                    currentPlayer.points += parseInt(currentPoint);
                }
                for( playerIndex in currentMatch.right.players){
                    var currentPlayer = currentMatch.right.players[playerIndex];
                    var currentPoint = currentMatch.right.playerPoints[currentPlayer.name];
                    currentPlayer.points += parseInt(currentPoint);
                }
            }
        },
    },
    components: {
        'result-component':{
            template: '#result-component-id',
            props: ['first_three_place'],
            computed:{
                firstThreePlace: function(){
                    return this.$parent.firstThreePlace;
                }
            },
            methods: {
                getLength: function (objArrMixed, optionalKey) {
                    return this.$parent.$options.methods.getLength(objArrMixed, optionalKey);
                }
            }
        },
        'history-component':{
            template: '#history-component-id',
            props: ['histories'],
            // data: function() {
            //     var self = this;
            //     var obj = {
            //         histories: self.$parent.histories
            //     };
            //     return obj;
            // },
            computed:{
                
            },
            methods:{
                formatDate: function(date){
                    return moment(parseInt(date)).format('MMMM Do YYYY, HH:mm');
                },
                numberOfPlayers: function (history) {
                    return Object.size(history.players);
                },
                numberOfTeams: function (history) {
                    return Object.size(history.selectedTeams);
                },
                numberOfMatches: function (history) {
                    return Object.size(history.matches);
                },
                loadHistory: function (timestamp) {
                    var history = storageController.getSession(parseInt(timestamp));
                    console.log("loadHistory", history);
                    this.$parent.session_key = parseInt(timestamp);
                    this.$parent.selectedTeams = history.selectedTeams;
                    this.$parent.players = history.players;
                    setDefaultPlayers(Object.keys(history.players).join(", "));
                    this.$parent.matches = history.matches;
                    setDefaultNumberOfGames(Object.size(history.matches));
                    this.$parent.shownItemNumber = history.shownItemNumber;
                },
                deleteHistory: function (timestamp) {
                    storageController.deleteSession(parseInt(timestamp));
                    this.$parent.session_key = new Date().getTime();
                    this.$parent.histories = storageController.getHistory();
                    setDefaultSelectedTeams();
                    setDefaultPlayers();
                    this.$parent.matches = {};
                    this.$parent.shownItemNumber = 0;
                }
            }
        }
    },
    watch:{
        players: function(){
            if(Object.size(this.matches) > 0){
                storageController.setSession(this.session_key, {
                    selectedTeams: JSON.parse(JSON.stringify(this.selectedTeams)),
                    players: JSON.parse(JSON.stringify(this.players)),
                    matches: JSON.parse(JSON.stringify(this.matches)),
                    shownItemNumber: this.shownItemNumber,
                });
                this.histories = storageController.getHistory();
            }
        },
        selectedTeams: function(){
            if(Object.size(this.matches) > 0){
                storageController.setSession(this.session_key, {
                    selectedTeams: JSON.parse(JSON.stringify(this.selectedTeams)),
                    players: JSON.parse(JSON.stringify(this.players)),
                    matches: JSON.parse(JSON.stringify(this.matches)),
                    shownItemNumber: this.shownItemNumber,
                });
                this.histories = storageController.getHistory();
            }
        },
        shownItemNumber: function(){
            if(Object.size(this.matches) > 0){
                storageController.setSession(this.session_key, {
                    selectedTeams: JSON.parse(JSON.stringify(this.selectedTeams)),
                    players: JSON.parse(JSON.stringify(this.players)),
                    matches: JSON.parse(JSON.stringify(this.matches)),
                    shownItemNumber: this.shownItemNumber,
                });
            }
            this.histories = storageController.getHistory();
        },
    }
});
Vue.config.devtools = true;
vm.$watch('matches', 
    function(){
        if(Object.size(this.matches) > 0){
            storageController.setSession(this.session_key, {
                selectedTeams: JSON.parse(JSON.stringify(this.selectedTeams)),
                players: JSON.parse(JSON.stringify(this.players)),
                matches: JSON.parse(JSON.stringify(this.matches)),
                shownItemNumber: this.shownItemNumber,
            });
            this.histories = storageController.getHistory();
        }
    },
    {deep: true}
)

setDefaultSelectedTeams = function(){
    $("#teams").html("");
    for( key in defaultTeams ){
        var currentTeam = defaultTeams[key];
        $("<option>",{
            "html": currentTeam.name,
            "selected": currentTeam.selected,
            "logo-data": currentTeam.logo,
        }).appendTo("#teams");
        if( currentTeam.selected != false ){
            selectedTeams.push(currentTeam.name);
            Vue.set(vm, "selectedTeams", selectedTeams); 
        }
    }
}
setDefaultPlayers = function(val){
    if( !val )
        val = "Tevfik, Amara, Bruce, Jordy, Chris, Alvaro, Andre";
    $(".players").val(val).trigger("blur");
}
setDefaultNumberOfGames = function(val){
    if( !val )
        val = 12;
    $(".numberOfGames").val(val);
}

//loading the teams into multi-select
$(function(){
    // console.log("defaultTeams", defaultTeams);
    setDefaultSelectedTeams();
    setDefaultPlayers();
    setDefaultNumberOfGames();
});

function getRandomUser(){
    if (tempData.users.length == 0) tempData.users = users.slice(0);
    var index = Math.floor(Math.random() * tempData.users.length-1);

    // var nextUser = tempData.users[index];
    // console.log("index", index);
    var nextUser = tempData.users.splice(index, 1)[0];
    // console.log("nextUser", nextUser);

    // console.log("in lastUsers?", lastUsers.slice(-(tempData.users.length-1)).indexOf(nextUser) != -1, lastUsers.slice(-(tempData.users.length-1)));
    
    if( lastUsers.slice(-(tempData.users.length-1)).indexOf(nextUser) != -1 )
        return getRandomUser();
    
    // console.log("getRandomUser nextUser", nextUser);
    lastUsers.push(nextUser);
    // console.log("tempData.users", tempData.users);

    return getFromVuePlayers(nextUser);
}

function getFromVuePlayers(userName) {
    var returnValue;
    for( key in vm.players){
        // console.log("You are looking at", key, vm.players[key], userName.trim());
        if(vm.players[key].name == userName.trim()){
            returnValue = vm.players[key];
            break;
        }
    }
    return returnValue;
}

function getRandom(key, notUnique) {
    switch (key) {
        case 'teams':
            if (tempData.teams.length === 0) tempData.teams = vm.teams.slice(0);
            break;
        case 'users':
            if (tempData.users.length === 0) tempData.users = vm.users.slice(0);
            break;
    }
    var index = Math.floor(Math.random() * tempData[key].length);
    var returnVal = tempData[key][index];
    if (key == 'users')
        console.log("returnVal", returnVal, "in", lastUsers.slice(-3).indexOf(returnVal) != -1, lastUsers.slice(-3));
    
    if( key == 'users' &&  lastUsers.slice(-3).indexOf(returnVal) != -1 ){
        return getRandom(key, notUnique);
    }

    if (!notUnique) {
        returnVal = tempData[key].splice(index, 1)[0];
    }
    if (key == 'users') lastUsers.push(returnVal);

    if (key == 'users') console.log("getRandom returns", returnVal);
    return returnVal;
}

function getOneMatch(){
    return {
        'team': getRandom('teams'),
        'players': [
            getRandomUser(),
            getRandomUser()
        ],
        'playerPoints': {

        },
        'points': "",
        'status': "NA",
    };
}

function makeMatches(gameCount){
    tempData = {
        teams: [],
        users: []
    };
    var matches = {};
    vm.shownItemNumber = 0;
    for (var i = 0; i < gameCount; i++) {
        var leftSide = getOneMatch();
        var rightSide = getOneMatch();

        matches[i] = {
            'left': leftSide,
            'right': rightSide
        };
        tryToClearLastUser(i+1);
    }
    matchTeams = overallTeamCount(matches);
    matchPlayers = overallPlayerCount(matches);
    // console.log("lastUsers", lastUsers);
    Vue.set(vm, "matches", matches);
    Vue.set(vm, "teams", matchTeams);
    Vue.set(vm, "playersMatchCount", matchPlayers);
}
// makeMatches(2);


function tryToClearLastUser(currentMatchCount) {
    var numberOfUsers = users.length; 
    var totalPlayedPlayer = 4*currentMatchCount;
    // console.log("tryToClearLastUser numberOfUsers",numberOfUsers);
    // console.log("tryToClearLastUser currentMatchCount",currentMatchCount);
    // console.log("tryToClearLastUser totalPlayedPlayer",totalPlayedPlayer);
    // console.log("tryToClearLastUser  totalPlayedPlayer % numberOfUsers === 0", totalPlayedPlayer % numberOfUsers === 0);
    if( totalPlayedPlayer % numberOfUsers === 0){
        // console.log("%ctryToClearLastUser is emptying lastUsers and refreshing tempData.users", "color:blue; font-size:14px;");
        lastUsers = [];
        tempData.users = users.slice(0);
    }
}


function customCountSort(obj) {
    var sortable = [];
    var result = {};
    for (var key in obj) sortable.push([key, obj[key]])
        //   console.log("customCountSort", sortable);
    sortable.sort(function(a, b) {
        return b[1] - a[1]
    });
    for (var index in sortable) {
        var curr = sortable[index];
        result[curr[0]] = curr[1];
    }
    // console.log("customCountSort result", result);
    return result;
}

function teamCountSort(obj) {
    var sortable = [];
    var result = {};
    for (var key in obj) sortable.push([key, obj[key]])
        //   console.log("customCountSort", sortable);
    sortable.sort(function(a, b) {
        return b[1]['count'] - a[1]['count']
    });
    for (var index in sortable) {
        var curr = sortable[index];
        result[curr[0]] = curr[1];
    }
    // console.log("customCountSort result", result);
    return result;
}


function overallTeamCount(matches) {
    var teams = {};
    for (i = 0; i <  Object.size(matches); i++) {
        var currentMatch = matches[i];
        //     console.log("currentMatch", currentMatch);
        if (currentMatch.left.team.name in teams) {
            teams[currentMatch.left.team.name]["count"]++;
        } else {
            teams[currentMatch.left.team.name] = currentMatch.left.team;
            teams[currentMatch.left.team.name]["count"] = 1;
        }
        if (currentMatch.right.team.name in teams) {
            teams[currentMatch.left.team.name]["count"]++;
        } else {
        	teams[currentMatch.right.team.name] = currentMatch.right.team;
            teams[currentMatch.right.team.name]["count"] = 1;
        };
    }
    //   console.log(teams);
    //   console.log(customCountSort(teams));
    // return customCountSort(teams);
    return teamCountSort(teams);
    // return teams;
}

function overallPlayerCount(matches) {
    var players = {};
    // console.log("This is matches", matches);
    for (i = 0; i < Object.size(matches); i++) {
        var currentMatch = matches[i];
        //     console.log("currentMatch", currentMatch);
        if (currentMatch.left.players[0].name in players) players[currentMatch.left.players[0].name]++;
        else players[currentMatch.left.players[0].name] = 1;
        if (currentMatch.left.players[1].name in players) players[currentMatch.left.players[1].name]++;
        else players[currentMatch.left.players[1].name] = 1;
        if (currentMatch.right.players[0].name in players) players[currentMatch.right.players[0].name]++;
        else players[currentMatch.right.players[0].name] = 1;
        if (currentMatch.right.players[1].name in players) players[currentMatch.right.players[1].name]++;
        else players[currentMatch.right.players[1].name] = 1;
    }
    //   console.log(players);
    //   console.log(customCountSort(players));
    return customCountSort(players);
}

function nextMatch(){
    nextMatchButton('disable');
    var parentRow = $("#match-list .row").last();
    // console.log("parentRow", parentRow);
    hideSteps(parentRow)
    var clonedPlayerNames = $(parentRow).find(".player-names").clone();
    $(clonedPlayerNames).css({"font-size":"35px", "margin-right":"15px", "opacity":0});
    var cloneWrapper = $("<div>",{"class":"player-names-wrapper"});
    parentRow.before(cloneWrapper);

    function addPlayer(){
        var nextPlayerElement = clonedPlayerNames.splice(Math.floor(Math.random() * clonedPlayerNames.length), 1)[0];
        $(nextPlayerElement).css("opacity", 0);
        cloneWrapper.append($(nextPlayerElement));
        return $(nextPlayerElement).animate({opacity: 1}, animationDurations.addPlayer);
    }
    function movePlayersToLocations(){
        var wrapper = $(".player-names-wrapper").first();
        // console.log("wrapper", wrapper);
        var wrapperOffset = wrapper.offset();
        var nextRow = wrapper.next('.row');

        var playerNames = wrapper.find(".player-names:not(.animated)");
        // console.log("playerNames",playerNames);

        var nextPlayer = $(playerNames.splice(Math.floor(Math.random() * playerNames.length), 1)[0]);
        // console.log(nextPlayer);
        var ani2 = nextPlayer.addClass("animated").css({ "opacity":0});
        var left_pos = ani2.position().left;

        var cloneAni2 = ani2.clone(true);
        cloneAni2.css({"position":"absolute", "opacity":1, "left":left_pos+12});
        cloneAni2.appendTo(".player-names-wrapper");

        var card_player =  nextRow.find( "."+ nextPlayer.attr("animation-class") );
        var animateValues = {
            width: card_player.width(),
            "line-height": card_player.css("line-height"),
            "font-size": card_player.css("font-size"),
            "top":card_player.offset().top - wrapperOffset.top - 3,
            "left":card_player.offset().left - wrapperOffset.left,
        };
        // console.log( "animateValues for", nextPlayer.attr("animation-class"),  animateValues);
        return $(cloneAni2).animate(animateValues, animationDurations.movePlayersToLocations);
    }

    function showTeam(){
        if ( $(parentRow).find(".step3-1:not(.animated)").length > 0 )
            return $(parentRow).find(".step3-1").addClass("animated").delay(animationDurations.showTeamDelay).animate({opacity: 1}, animationDurations.showTeam);
        else
            return $(parentRow).find(".step3-2").delay(animationDurations.showTeamDelay).animate({opacity: 1}, animationDurations.showTeam);
    }

    function showControllersBordersAndClearUp(){
        return $(parentRow).find(".step2").animate({opacity: 1}, animationDurations.showControllersBordersAndClearUp, function(){
            $(parentRow).find(".step2-card").css("border-color", "rgba(0,0,0,.125)");
            $(parentRow).find(".step1").animate({opacity: 1}, animationDurations.showControllersBordersAndClearUp, function(){
                nextMatchButton('enable');
                $(".player-names-wrapper").remove();
            });
        });
    }
   
    q(  
        //adding the players
        addPlayer, addPlayer, addPlayer, addPlayer,
        //moving them to location
        movePlayersToLocations, movePlayersToLocations, movePlayersToLocations, movePlayersToLocations,
        // showing teams
        showTeam, showTeam,
        //show controllers, borders and clear things up
        showControllersBordersAndClearUp
    );
}

$(document).delegate('.nextMatch', "click", function (event) {
    if (Object.size(vm.matches) >= vm.shownItemNumber+1){
        vm.shownItemNumber+=1;
        setTimeout(function(){
            nextMatch();
        }, 100);
    }        
});



$(document).delegate('.generateMatches', "click", function (event) {
    var games = $(".numberOfGames").val();
    if( games/parseInt(games) == 1 && games > 0 ){
        makeMatches(games);
    }
    $(".nav-link").removeAttr("disabled");
    $('a[href="#match-list"]').trigger("click");
})

// $(document).delegate('.numberOfGames', "blur", function (event) {
//     var games = $(this).val();
//     makeMatches(games);
//     // var combValue = combination(users.length, 4);
//     // var userCount = users.length; 
//     // var minGame = games/userCount;

//     // multiplyer = 1;
//     // if ( minGame !== parseInt(minGame) )
//     //     minGame*=2;
//     // else
//     //     multiplyer = games;
//     // $(".numberOfMatchInfoText").html("There are "+users.length+" players. It's better to set \"Number of games\" base of "+ minGame +". Ie; "+minGame*multiplyer+", "+minGame*multiplyer*2+", "+minGame*multiplyer*3+",...");
//     // $(".numberOfMatchInfoText").html("There are "+users.length+" players. It's better to set \"Number of games\" base of "+ combValue +". Ie; "+combValue+", "+combValue*2+", "+combValue*3+",...");
// })
// $(".numberOfGames").trigger("blur");

$(document).delegate('.players', "blur", function (event) {
    var value = $(this).val();
    var _players = {};
    var players = [];
    if( value.trim() != ""){
        var players = value.split(',');
        var i = 0;
        while(i < players.length){
            if( players[i] == "" ){
                players.slice(i, 1);
            }
            else{
                players[i] = players[i].trim();
                _players[players[i]] = {
                    "name": players[i],
                    "points": "",
                    "id": Math.pow(10, (i+1))
                };

                i++;
            }
        }
    }
    users = players;
    // console.log("users", users);
    // Vue.set(vm, "users", players);
    Vue.set(vm, "players", _players);
});