angular
  .module('hotkeys')
  .directive('focusOnCondition', ['$timeout',
    function ($timeout) {
        var checkDirectivePrerequisites = function (attrs) {
          if (!attrs.focusOnCondition && attrs.focusOnCondition != "") {
                throw "FocusOnCondition missing attribute to evaluate";
          }
        }

        return {            
            restrict: "A",
            link: function (scope, element, attrs, ctrls) {
                checkDirectivePrerequisites(attrs);

                scope.$watch(attrs.focusOnCondition, function (currentValue, lastValue) {
                    if(currentValue == true) {
                        $timeout(function () {                                                
                            element.focus();
                        });
                    }
                });
            }
        };
    }
]);