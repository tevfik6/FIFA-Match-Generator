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
	$(parentRow).css("visibility", "visible");
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

