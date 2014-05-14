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
        gameState : {},
        visibleTo: {},
        playersInfo : [],
        lastGameState : {},
        lastMove : [],
        lastMovePlayerId:"0",
        playerIdToNumberOfTokensInPot:{}

    };

    var stateHistoryStack = [];

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

    factory.setgameDataProperty = function (key,value) {
        gameData[key] = value;
    }

    factory.getGameDataProperty = function(key) {
        return gameData[key];
    }

    factory.pushToStateHistoryStack = function(obj) {
        stateHistoryStack.push(obj);
    }

    factory.getStateHistoryStack = function() {
        return stateHistoryStack;
    }

    factory.setStateHistoryStack = function(stack) {
        stateHistoryStack = stack;
    }

    return factory;
})