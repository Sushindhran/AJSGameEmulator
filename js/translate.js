/**
 * Created by Shwetnak and Sushindhran on 4/29/14.
 */
angular.module('ajsEmulator').config(['$translateProvider', function ($translateProvider) {
    $translateProvider.translations('en', {
        'TITLE': 'AngularJS Emulator',
        'FOO': 'This is a paragraph'
    });

    $translateProvider.translations('de', {
        'TITLE': 'AngularJS Emulatore',
        'FOO': 'Dies ist ein Paragraph'
    });

    $translateProvider.preferredLanguage('en');
}]);