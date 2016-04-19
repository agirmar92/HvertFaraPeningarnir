/**
 * Created by Darri on 4/19/16.
 */
hfpApp.factory('authenticationResource', function($rootScope, $firebaseAuth, $firebaseObject, $location, FIREBASE_URL) {
    var factory = {};
    $rootScope.alerts = [];
    var ref = new Firebase(FIREBASE_URL);
    var auth = $firebaseAuth(ref);

    auth.$onAuth(function(authUser) {
        if (authUser) {
            $rootScope.currentUser = authUser;
            $location.path('admin');
        } else {
            $rootScope.currentUser = '';
            $location.path('login');
        }
    });

    factory.login = function(user) {
        auth.$authWithPassword({
            email: user.email,
            password: user.password
        }).catch(function(error) {
            var errorMsg = 'Villa kom upp';
            if (error.code === 'INVALID_PASSWORD') {
                errorMsg = 'Vitlaust lykilorð';
            } else if (error.code === 'INVALID_USER') {
                errorMsg = 'Aðgangur ekki til';
            }
            $rootScope.alerts.push({
                type: 'danger',
                msg: errorMsg
            });
        });
    };
    
    factory.logout = function() {
        return auth.$unauth();
    };

    factory.requireAuth = function() {
        return auth.$requireAuth();
    };

    return factory;
});
