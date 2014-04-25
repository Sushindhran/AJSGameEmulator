/**
 * Created by Shwetank and Sushindhran
 */

angular.module('emulator').factory('gameDataFactory',function () {
    var factory = {};

    var defaultSetupParameters = {
        gameUrl : "",
        width : "800",
        height : "600",
        timePerTurn : 0,
        isViewerEnabled : false,
        isSingleWindowMode : false,
        numberOfPlayers : 2,
        playerTokenAmount: 1000
    }

    var gameSetupParameters = {
        gameUrl : "",
        width : "",
        height : "",
        timePerTurn : "",
        isViewerEnabled : "",
        isSingleWindowMode : "",
        numberOfPlayers : "",
        playerTokens : ""
    };

    var gameData = {
        /*
        * Data needed to emulate
         */
        absoluteState : '',
        iframeArray : '',
        playersInfo : ''

    };

    var constants = {
        aiPlayerId : 0,
        viewerId : -1
    }

    factory.setUpGameParameters = function(gameUrl, numberOfPlayers, width, height, timePerTurn, isViewerEnabled, isSingleWindowMode, playerTokens ) {
        gameSetupParameters.gameUrl = gameUrl;
        gameSetupParameters.numberOfPlayers = numberOfPlayers;
        gameSetupParameters.width = width;
        gameSetupParameters.height = height;
        gameSetupParameters.timePerTurn = timePerTurn;
        gameSetupParameters.isViewerEnabled = isViewerEnabled;
        gameSetupParameters.isSingleWindowMode = isSingleWindowMode;
        gameSetupParameters.playerTokens = playerTokens;
    };

    factory.getGameSetupParameters = function () {
        return gameSetupParameters;
    }

    factory.getDefaultSetupParameters = function() {
        return defaultSetupParameters;
    }

    return factory;
})