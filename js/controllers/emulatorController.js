/**
 * Created by Sushindhran and Shwetank.
 */
angular.module("emulator").controller('EmulatorController',function ($scope, $route, gameDataFactory) {
    /*-----------------------------------
    * View Setup Logic
     -----------------------------------*/
    var iframeArray = [];
    // Emulator Reload button handler
    $scope.reload = function(){
        reset();
        $route.reload();
        //$location.path('emulate');
    }

    // Fetch game data from the factory
    var params = gameDataFactory.getGameSetupParameters();

    $scope.gameUrl = params.gameUrl;
    $scope.numberOfPlayers = params.numberOfPlayers;
    $scope.isSingleWindowMode = params.isSingleWindowMode;
    $scope.isViewerEnabled = params.isViewerEnabled;

    /*
    * function to generate player Ids from the number of players data retrieved from factory
     */
    var createPlayersInfo = function (num) {
        var list = [];
        var i = 0, playerId = 42;
        for(i=0; i< num; i++) {
            playerId += i;
            list.push({"playerId":playerId.toString()});
        }
        return list;
    };

    // Generate playersInfo
    $scope.playersInfo = createPlayersInfo($scope.numberOfPlayers);

    // Save playersInfo in factory
    gameDataFactory.setgameDataProperty('playersInfo',$scope.playersInfo);

    // Tab switching function
    $scope.switchTabs = function (index) {
        // Browse through frames
        for(var i = 0 ; i < iframeArray.length; i++) {
            iframeArray[i].setAttribute("hidden","true");
        }
        //if the user clicked on the viewer tab, which is always the last iframe
        if(index==='viewer'){
            iframeArray[iframeArray.length-1].removeAttribute("hidden")
        }else{
            iframeArray[index].removeAttribute("hidden");
        }

    };


    // This function adds an event listener grabs the contentwindow object of the iframes and puts them into an array
    $scope.init = function () {
        // Setup the listener from game
        window.parent.addEventListener('message', listener, false);

        var frames = {length:0};
        var expectedFrames = 0;
        if($scope.isSingleWindowMode){
            expectedFrames++;
        }else{
            expectedFrames = $scope.numberOfPlayers;
        }
        if($scope.isViewerEnabled){
            expectedFrames++;
        }

        var timer = setInterval(function() {
            frames = $('.frame');
            if(frames.length === expectedFrames) {
                clearInterval(timer);
                for(var i = 0 ; i<frames.length; i++){
                    iframeArray.push(frames[i].getElementsByTagName('iframe')[0]);
                }
                $scope.switchTabs(0);
            }
        },50)

    }

    var reset = function() {
        window.parent.removeEventListener("message",listener);
        gameDataFactory.setgameDataProperty("playersInfo","");
    }

    /*--------------------------
    * Emulation Logic
     -------------------------*/


    // Send message
    var send = function(source, message){
        gameConsole("Sending to Game: \n"+ message);
        source.postMessage(message,"*");
    };

    // Function that shuffles the keys and returns the shuffled set
    var shuffle =  function(keys){
        var keysCopy = keys.slice(0);
        var result = [];
        while(!(keysCopy.length<1)){
            var index = Math.floor(Math.random()*keysCopy.length);
            var removed = keysCopy.splice(index,1);
            result.push(removed);
        }
        return result;
    };


    // Function to copy a state object
    var clone = function(obj) {
        var str = JSON.stringify(obj);
        var copy = JSON.parse(str);
        return copy;
    };

    // Function to write to the console
    var gameConsole = function(message){
        $("#game-console")[0].value += message + "\n\n";
    };

    // Function to find message source
    var findMessageSource = function(source) {
        for(var i = 0 ; i < iframeArray.length; i++) {
            if (source === iframeArray[i].contentWindow || source.parent === iframeArray[i].contentWindow){
                return i;
            }
        }
        return -1;
    };



    // Function to listen to events from game
    var listener = function (event) {
        var msg = event.data;
        console.log("got here");
        var senderIndex = findMessageSource(event.source);

        gameConsole("Sender index" + senderIndex +": Receiving from "+$scope.playersInfo[senderIndex].playerId + msg.type);

        processMessage(msg,senderIndex)
    };

    /*
    Globals needed to process state
     */


    // Function to process messages
    var processMessage = function(msg, senderIndex) {
        if(msg.type == "GameReady"){
            // Send update ui as soon as you receive a game ready.
            //var gameState = gameDataFactory.getGameDataProperty('gameState');

            //if($scope.isViewerEnabled() && senderindex == iframeArray.length-1){
            //    sendUpdateUi(iframeArray[index].contentWindow, sharedProperties.getViewerId());
            //}else {
            sendUpdateUi(iframeArray[senderIndex].contentWindow, $scope.playersInfo[senderIndex].playerId);

        }else if(msg.type == "MakeMove"){

            //gameDataFactory.setgameDataProperty('lastMovePlayer',playerId);
            var gameState = gameDataFactory.getGameDataProperty('gameState');
            var visibleTo = gameDataFactory.getGameDataProperty('visibleTo');
            var operations =  msg.operations;

            var lastGameState = clone($scope.gameState);
            var lastVisibleTo = clone($scope.visibleTo);
            var lastMove = clone(operations);
            var lastMovePlayerId = $scope.playersInfo[senderIndex].playerId;

            //$scope.console(JSON.stringify(lastGameState));
            for (var i = 0; i < operations.length; i++) {
                var operation;
                operation = operations[i];
                //Check for all types of Operations
                if(operation.type === "SetTurn"){
                    gameConsole("SetTurn");
                    var currentPlayer = operation.playerId;
                    gameDataFactory.setgameDataProperty('turnOfPlayer',currentPlayer);
                    /*timerCount = 0;
                    if(operation.numberOfSecondsForTurn != 0){
                        gameConsole("Setting Time Per Turn to "+operation.numberOfSecondsForTurn);
                        timePerTurn = operation.numberOfSecondsForTurn;
                    }
                    if(!startTimer){
                        if(timePerTurn==0){
                            document.getElementById("timerLabel").setAttribute("hidden",true);
                        }else{
                            document.getElementById("timerLabel").removeAttribute("hidden");
                            interval = setInterval(function(){$scope.startTimer()},1000);
                        }
                        startTimer = true;
                    }*/
                    /*end the game*/
                }else if (operation.type === "Set") {
                    gameState[operation.key] = operation.value;
                    visibleTo[operation.key] = operation.visibleToPlayerIds;
                }else if(operation.type == "SetRandomInteger"){
                    var from = operation.from;
                    var to  = operation.to;
                    //Random number is the value
                    var value = Math.floor((Math.random()*(to-from))+from);
                    gameState[operation.key] =  value;
                    visibleTo = "ALL";
                }else if(operation.type == "SetVisibility"){
                    visibleTo[operation.key] = operation.visibleToPlayerIds;
                }else if(operation.type == "Delete"){
                    var key = operation.key;
                    //Remove from the gameState array
                    delete gameState[key];
                    //Remove from visibleTo array
                    delete visibleTo[key];
                }else if(operation.type == "Shuffle"){
                    var keys = operation.keys;
                    var shuffledKeys = shuffle(keys);
                    var oldGameState = clone(gameState);
                    var oldVisibleTo = clone(visibleTo);
                    for(var j=0;j<shuffledKeys.length;j++){
                        var fromKey = keys[j];
                        var toKey = shuffledKeys[j];
                        gameState[toKey] = oldGameState[fromKey];
                        visibleTo[toKey] = oldVisibleTo[fromKey];
                    }
                }else if(operation.type === "AttemptChangeTokens"){
                    var playerIdToNoOfTokensInPot = {};
                    var p = operation.playerIdToNumberOfTokensInPot;
                    for( var j = 0; j < $scope.numberOfPlayers; j++){
                        var id;
                        id = $scope.playersInfo[j].playerId.toString();
                        if(! playerIdToNoOfTokensInPot.hasOwnProperty(id) ) {
                            playerIdToNoOfTokensInPot[id] = p[id];
                        } else if (playerIdToNoOfTokensInPot[id] == 0) {
                            playerIdToNoOfTokensInPot[id] = p[id];
                        }
                    }
                }else if(operation.type == "EndGame"){
                    $scope.console("End Game" + JSON.stringify(msg.data));
                }
            }
            gameDataFactory.setgameDataProperty('lastGameState',lastGameState);
            gameDataFactory.setgameDataProperty('lastVisibleTo',lastVisibleTo);
            gameDataFactory.setgameDataProperty('lastMove',lastMove);
            gameDataFactory.setgameDataProperty('lastMovePlayerId',lastMovePlayerId);
            gameDataFactory.setgameDataProperty('gameState',gameState);
            gameDataFactory.setgameDataProperty('visibleTo',visibleTo);
            gameDataFactory.setgameDataProperty('playerIdToNoOfTokensInPot',playerIdToNoOfTokensInPot);

            //We are not sending verify moves right now
            // Send update UI to everyone

            for(var k = 0; k< $scope.numberOfPlayers; k++){
                sendUpdateUi(iframeArray[k].contentWindow,playersInfo[k].playerId);
            }


        }
    };

    // Function to create updateUI object according to a playerId
    var sendUpdateUi = function(source, yourPlayerId){

        var updateUIMessage = JSON.stringify({'type': 'UpdateUI', 'yourPlayerId': yourPlayerId.toString(),
            'playersInfo': JSON.stringify($scope.playersInfo),
            'state': getStateforPlayerId(yourPlayerId, gameDataFactory.getGameDataProperty('gameState'), gameDataFactory.getGameDataProperty('visibleTo')),
            'lastState':gameDataFactory.getGameDataProperty('lastGameState'),
            'lastMove':gameDataFactory.getGameDataProperty('lastMove'),
            'lastMovePlayerId': gameDataFactory.getGameDataProperty('lastMovePlayerId'),
            'playerIdToNumberOfTokensInPot':gameDataFactory.getGameDataProperty('playerIdToNoOfTokensInPot')
        });

        send(source,updateUIMessage);
    }

    var getStateforPlayerId = function(playerId, state, visibleTo) {
        var result = {};
        var keys = getKeys(state);
        for(var k=0;k<keys.length;k++){
            var visibleToPlayers = visibleTo[keys[k]];
            var value = null;
            if(visibleToPlayers=="ALL"){
                value = state[keys[k]];
            }
            if(visibleToPlayers.indexOf(playerId)>-1){
                value = state[keys[k]];
            }
            result[keys[k]] = value;
        }
        return result;
    };//Function to get the keys from a JSON object

    var getKeys = function(object){
        var keys = [];

        for(var key in object){
            if(object.hasOwnProperty(key)) {
                keys.push(key);
            }
        }
        return keys;
    };

    //Function to get the keys from a JSON object
    var getKeys = function( object ) {
        var keys = [];

        for(var key in object){
            if(object.hasOwnProperty(key)) {
                keys.push(key);
            }
        }
        return keys;
    };






});