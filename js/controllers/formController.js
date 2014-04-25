/**
 * Created by Sushindhran and Shwetank .
 */
angular.module("emulator").controller('FormController',function ($scope, $location, gameDataFactory) {

    // Has the default parameters given in the factory
    var defaults = gameDataFactory.getDefaultSetupParameters();

    // This variable fills up the default value in the view
    $scope.numberOfPlayers = defaults.numberOfPlayers;

    // Initialize an empty array for holding player tokens
    $scope.playerTokens = [];

    /*
    * This function sets up the playerTokens array according to user input. This array is bound to text fields in view
     */
    $scope.playerTokenSetup = function(){
        $scope.playerTokens = [];
        if (typeof $scope.numberOfPlayers === "undefined"){
            return;
        }
        else {
            var num = parseInt($scope.numberOfPlayers)
            if (!isNaN(num)) {
                for (var i = 0; i < $scope.numberOfPlayers; i++) {
                    $scope.playerTokens.push(defaults.playerTokenAmount);
                }
            }
        }
    }

    // Invoke the above function for default number of players with default amount (this pre-fils the token fields in the view)
    $scope.playerTokenSetup();

    /*
    * Setup function invoked when user submits the form
     */
    $scope.setup = function () {
        // Check for default values
        if (typeof $scope.gameUrl === "undefined"){
            alert("GameUrl can't be left blank");
            return;
        }

        if (typeof $scope.numberOfPlayers === "undefined"){
            $scope.numberOfPlayers =defaults.numberOfPlayers;
        }

        if (typeof $scope.width === "undefined"){
            $scope.width = defaults.width;
        }

        if (typeof $scope.height === "undefined") {
            $scope.height = defaults.height;
        }

        if (typeof $scope.timePerTurn === "undefined") {
            $scope.timePerTurn = defaults.timePerTurn;
        }

        // Because sometimes the checkbox returns undefined instead of false
        if (typeof $scope.isSingleWindowMode === "undefined"){
            $scope.isSingleWindowMode = false;
        }
        if (typeof $scope.isViewerEnabled === "undefined"){
            $scope.isViewerEnabled = false;
        }
        // TODO: Add proper validations for all values

        // Iterate through player tokens and convert them to integer from string
        for(var i = 0 ; i < $scope.playerTokens.length; i++) {
            $scope.playerTokens[i] = parseInt($scope.playerTokens[i]);
        }

        gameDataFactory.setUpGameParameters($scope.gameUrl, parseInt($scope.numberOfPlayers),
            $scope.width, $scope.height, parseInt($scope.timePerTurn),
            $scope.isViewerEnabled, $scope.isSingleWindowMode, $scope.playerTokens);

        $location.path('/emulate');
    }

    /*
    *test code

    $scope.log = function () {
        var data = gameDataFactory.getGameSetupParameters();
        for (prop in data) {
            if (data.hasOwnProperty(prop)){
                console.log(prop + ":" + data[prop]);
            }
        }
    }
    */

})
