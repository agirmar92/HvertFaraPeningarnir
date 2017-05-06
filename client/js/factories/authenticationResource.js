/**
 * Created by Darri on 4/19/16.
 */
hfpApp.factory('authenticationResource', function($rootScope, $firebaseAuth, $firebaseObject, $location, FIREBASE_URL) {
    var factory = {};
    $rootScope.alerts = [];
    $rootScope.currentUser = {
        email: '',
        token: ''
    };

    var auth = $firebaseAuth();

    auth.$onAuthStateChanged(function(authUser) {
        if (authUser) {
            factory.setToken(authUser.Yd);
            factory.setEmail(authUser.email);
            $location.path('admin');
        } else {
            factory.setToken('');
            factory.setEmail('');
            $location.path('login');
        }
    });

    factory.setToken = function(token) {
        $rootScope.currentUser.token = token;
    };

    factory.setEmail = function(email) {
        $rootScope.currentUser.email = email;
    };

    factory.getToken = function() {
        return $rootScope.currentUser.token;
    };

    factory.getEmail = function() {
        return $rootScope.currentUser.email;
    };

    factory.login = function(user) {
        auth.$signInWithEmailAndPassword(user.email, user.password).then(function(authData) {
            console.log("Logged in");
        }).catch(function(error) {
            console.log(error);
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
            $rootScope.loggingIn = false;
        });
    };
    
    factory.logout = function() {
        return auth.$signOut();
    };

    factory.requireAuth = function() {
        return auth.$requireSignIn();
    };

    return factory;
});
