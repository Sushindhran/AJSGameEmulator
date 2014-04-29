/**
 * Created by Sushindhran and Shwetank.
 */
angular.module("emulator").controller('EmulatorController',function ($scope, $route, gameDataFactory) {
    /*-----------------------------------
    * View Setup Logic
     -----------------------------------*/
    var iframeArray = [];

    // Used to synchronize the gameReady message
    var sourceArray = [];

    // Variable to keep track of expected number of iframes in the view
    var expectedFrames = 0;

    // Fetch game data from the factory done in init
    var params = {};

    var calculateExpectedframes = function(params) {
        var num = 0;
        if($scope.isSingleWindowMode){
            num++;
        }else{
            num = params.numberOfPlayers;
        }
        if(params.isViewerEnabled){
            num++;
        }
        return num;
    }

    /*
     * function to generate player Ids from the number of players data retrieved from factory
     */
    var createPlayersInfo = function (num) {
        var list = [];
        var i = 0, playerId = 42;
        for(i=0; i< num; i++) {
            playerId += i;
            list = list.concat({"playerId":playerId.toString()});
        }
        // Save playersInfo in factory
        gameDataFactory.setgameDataProperty('playersInfo',list);
    };

    var init = function () {
        // Setup the listener from game
        window.parent.addEventListener('message', listener, false);

        params = gameDataFactory.getGameSetupParameters();
        expectedFrames = calculateExpectedframes(params);
        // Generate playersInfo
        createPlayersInfo(params.numberOfPlayers);
        $scope.playersInfo = gameDataFactory.getGameDataProperty('playersInfo');
        $scope.gameUrl = params.gameUrl;
        $scope.isSingleWindowMode = params.isSingleWindowMode;
        $scope.isViewerEnabled = params.isViewerEnabled;
        $scope.numberOfPlayers = params.numberOfPlayers;


    }


    // Emulator Reload button handler
    $scope.reload = function(){
        reset();
        $route.reload();
        //$location.path('emulate');
    }


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

    var calculateExpectedframes = function(params) {
        var num = 0;
        if($scope.isSingleWindowMode){
            num++;
        }else{
            num = params.numberOfPlayers;
        }
        if(params.isViewerEnabled){
            num++;
        }
        return num;
    }

    // This function adds an event listener grabs the contentwindow object of the iframes and puts them into an array
    $scope.framesInit = function () {

        // Call init
        init();

        var frames = {length:0};


        var timer = setInterval(function() {
            frames = $('.frame');
            if(frames.length === expectedFrames) {
                clearInterval(timer);
                for(var i = 0 ; i<frames.length; i++){
                    iframeArray.push(frames[i].getElementsByTagName('iframe')[0]);
                    console.log(iframeArray[i]);
                }

                $scope.switchTabs(0);
            }
        },5)

    };

    var reset = function() {
        window.parent.removeEventListener("message",listener);
        gameDataFactory.setgameDataProperty("playersInfo","");
    }

    /*--------------------------
    * Emulation Logic
     -------------------------*/


    // Send message
    var send = function(source, message){
        gameConsole("Sending to Game: \n"+ JSON.stringify(message));
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
        gameConsole("Recieved from game:");
        gameConsole(JSON.stringify(msg));
        var senderIndex;
        if(msg.type == "GameReady"){
            sourceArray.push(event.source);
            if(sourceArray.length === expectedFrames){
                for(var i = 0; i < expectedFrames; i++){
                    senderIndex = findMessageSource(sourceArray[i]);
                    sendUpdateUi(iframeArray[senderIndex].contentWindow, $scope.playersInfo[senderIndex].playerId);
                }
            }

        }else {


            senderIndex = findMessageSource(event.source);

            gameConsole("Sender index" + senderIndex);
            gameConsole(" Receiving from " + $scope.playersInfo[senderIndex].playerId + msg.type);

            processMessage(msg, senderIndex)
        }
    };

    /*
    Globals needed to process state
     */


    // Function to process messages
    var processMessage = function(msg, senderIndex) {
        if(msg.type == "MakeMove"){

            //gameDataFactory.setgameDataProperty('lastMovePlayer',playerId);
            var gameState = gameDataFactory.getGameDataProperty('gameState');
            var visibleTo = gameDataFactory.getGameDataProperty('visibleTo');
            var operations =  msg.operations;

            var lastGameState = clone(gameState);
            var lastVisibleTo = clone(visibleTo);
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
                    gameConsole("End Game" + JSON.stringify(msg.data));
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
                sendUpdateUi(iframeArray[k].contentWindow,$scope.playersInfo[k].playerId);
            }


        }
    };

    // Function to create updateUI object according to a playerId
    var sendUpdateUi = function(source, yourPlayerId){

        var updateUIMessage = {'type': 'UpdateUI', 'yourPlayerId': yourPlayerId.toString(),
            'playersInfo': $scope.playersInfo,
            'state': getStateforPlayerId(yourPlayerId, gameDataFactory.getGameDataProperty('gameState'), gameDataFactory.getGameDataProperty('visibleTo')),
            'lastState':gameDataFactory.getGameDataProperty('lastGameState'),
            'lastMove':gameDataFactory.getGameDataProperty('lastMove'),
            'lastMovePlayerId': gameDataFactory.getGameDataProperty('lastMovePlayerId'),
            'playerIdToNumberOfTokensInPot':gameDataFactory.getGameDataProperty('playerIdToNoOfTokensInPot')
        };

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