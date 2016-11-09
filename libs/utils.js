var storageController = {
    customKey: "FIFA-Match-Generator-History",
    getHistory: function(){
        return localStorage.getItem(this.customKey) ? JSON.parse(localStorage.getItem(this.customKey)) : {};
    },
    getSession: function(session_id){
        if (session_id == "") return;
        var history = this.getHistory();
        returnValue = session_id in history ? history[session_id] : undefined;
        this.justForDebug();
        return returnValue;
    },
    setSession: function(session_id, value){
        if (session_id == "" || value == "") return;
        var history = this.getHistory();
        history[session_id] = value;
        localStorage.setItem(this.customKey, JSON.stringify(history));
        this.justForDebug();
    },
    deleteSession: function(session_id){
        if (session_id == "") return;
        var history = this.getHistory();
        history[session_id] = 1;
        delete history[session_id];
        localStorage.setItem(this.customKey, JSON.stringify(history));
        this.justForDebug();
    },
    justForDebug: function () {
        console.log("storageController HISTORY:", this.getHistory());
    }
};

Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

function hideSteps(parentRow) {
	$(parentRow).find(".step1, .step2, .step3").css("opacity", 0);
	$(parentRow).find(".step2-card").css("border-color", "white");
	$(parentRow).removeClass("visibility", "visible");
}

function nextMatchButton(status){
	switch(status){
		case 'enable':
			$("#nextMatch").removeClass("disabled").removeAttr("disabled");
		break;
		case 'disable':
			$("#nextMatch").addClass("disabled").attr("disabled");
		break;
	}
}

function q(start) {
    var rest = [].splice.call(arguments, 1),
        promise = $.Deferred();

    if (start) {
        $.when(start()).then(function () {
            q.apply(window, rest);
        });
    } else {
        promise.resolve();
    }
    return promise;
}




var animationDurationsDefault = {
    addPlayer: 1000,
    movePlayersToLocations: 1500,
    showTeamDelay: 2000,
    showTeam: 500,
    showControllersBordersAndClearUp: 500,
};
var animationDurations = {
    addPlayer: animationDurationsDefault.addPlayer,
    movePlayersToLocations: animationDurationsDefault.movePlayersToLocations,
    showTeamDelay: animationDurationsDefault.showTeamDelay,
    showTeam: animationDurationsDefault.showTeam,
    showControllersBordersAndClearUp: animationDurationsDefault.showControllersBordersAndClearUp,
};
var animationDurations = {};
function setDefaultDurations( divider ){
    if (!divider) divider = 1;
    animationDurations = {
        addPlayer: animationDurationsDefault.addPlayer/divider,
        movePlayersToLocations: animationDurationsDefault.movePlayersToLocations/divider,
        showTeamDelay: animationDurationsDefault.showTeamDelay/divider,
        showTeam: animationDurationsDefault.showTeam/divider,
        showControllersBordersAndClearUp: animationDurationsDefault.showControllersBordersAndClearUp/divider,
    };
    // console.log("setDefaultDurations animationDurations", animationDurations);
}
setDefaultDurations();
$(document).delegate('.animation-speed', "change", function (event) {
    var speed = $(this).val();
    switch( speed ){
        case 'fast':
            setDefaultDurations(2);
        break;
        case 'faster':
            setDefaultDurations(10);
        break;
        case 'fastest':
            setDefaultDurations(500);
        break;
        default:
            setDefaultDurations(1);
        break;
    }
});

