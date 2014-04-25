// Initialize the angular module
var app = angular.module('emulator',['ngRoute']);

app.config(['$routeProvider',function($routeProvider) {
    $routeProvider
        .when('/',
        {
            controller: 'FormController',
            templateUrl:'/views/inputForm.html'
        })
        .when('/emulate',
        {
            controller: 'EmulatorController',
            templateUrl: '/views/emulate.html'
        })
        .otherwise({redirectTo: '/'});
} ]);

/*
* Filter used for ng-repeat ing N number of times
 */
app.filter('range', function() {
    return function(val, range) {
        range = parseInt(range);
        for (var i=0; i<range; i++)
            val.push(i);
        return val;
    };
});