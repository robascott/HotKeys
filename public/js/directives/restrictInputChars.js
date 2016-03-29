angular
  .module('hotkeys')
  .directive("regExpRequire", function() {

      var regexp;
      return {
          require: 'ngModel',
          restrict: "A",
          link: function(scope, elem, attrs, modelCtrl) {

            // Prevent spaces
            elem.on("keypress", function(event) {
              if (event.which == 32) {
                event.preventDefault();
              }
            });

            // Remove non-alphanumeric characters
            modelCtrl.$parsers.push(function (inputValue) {
              var transformedInput = inputValue.toLowerCase().replace(/[^a-zA-Z0-9]+/g,''); 

              if (transformedInput!=inputValue) {
                modelCtrl.$setViewValue(transformedInput);
                modelCtrl.$render();
              }         

              return transformedInput;         
            });
            
          }
      }

  })