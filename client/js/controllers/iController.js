hfpApp.controller('iController', function ($scope) {


    var classes = [ "#none", "#menu-toggle", "#calendar-toggle", "#download-toggle", "#instructions-toggle", "#panel-filters", "#hmm", "#type-button", "#hmm", "#hmm", "#mypie", "#hfp-breadcrumb", "#miniChartContainer", "#hfp-progress" ];
    var i = 0;
    var s = '#instr0';


    $scope.prevInstr = function() {
        $(s).toggleClass("hfp-hidden");
        if (i !== 4) {
            $(classes[i]).toggleClass("bring-to-front");
        }
        if (i < 2) {
            i = 14;
        } else {
            i--;
        }
        s = s.substring(0,6) + i;
        $(s).toggleClass("hfp-hidden");
        if (i !== 4) {
            $(classes[i]).toggleClass("bring-to-front");
        }
    };

    $scope.nextInstr = function () {
        $(s).toggleClass("hfp-hidden");
        if (i !== 4) {
            $(classes[i]).toggleClass("bring-to-front");
        }
        if (i === 14) {
            i = 1;
        } else {
            i++;
        }
        s = s.substring(0,6) + i;
        $(s).toggleClass("hfp-hidden");
        if (i !== 4) {
            $(classes[i]).toggleClass("bring-to-front");
        }
    };

    var checkKey = function(e) {
        e = e || window.event;
        if (e.keyCode === 37) {         // Left arrow
            $scope.prevInstr();
            e.preventDefault();
        }
        else if (e.keyCode === 39) {    // Right arrow
            $scope.nextInstr();
            e.preventDefault();
        } else if (e.keyCode === 27) {  // Escape button
            if (!$("#hfp-instructions").hasClass("hfp-hidden")) {
                $scope.toggleInstructions();
            }
            e.preventDefault();
        }
    };
    document.onkeydown = checkKey;
});