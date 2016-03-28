angular
  .module('hotkeys')
  .directive("regExpRequire", function() {

      var regexp;
      return {
          require: 'ngModel',
          restrict: "A",
          link: function(scope, elem, attrs, modelCtrl) {

            modelCtrl.$parsers.push(function (inputValue) {

             var transformedInput = inputValue.toLowerCase().replace(/[^a-zA-Z0-9]+/g,''); 

             if (transformedInput!=inputValue) {
               modelCtrl.$setViewValue(transformedInput);
               modelCtrl.$render();
             }         

             return transformedInput;         
            });

            // regexp = eval(attrs.regExpRequire);
            // var char;
            // elem.on("keypress", function(event) {
            //     if (event.which != 8) {
            //       char = String.fromCharCode(event.which);
            //       if(!regexp.test(elem.val() + char))
            //           event.preventDefault();
            //     }
            // });
          }
      }

  })