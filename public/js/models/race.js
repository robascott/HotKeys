angular
  .module('hotkeys')
  .factory('Race', Race);

Race.$inject = ['$resource', 'API'];
function Race($resource, API){

  return $resource(
    API+'/races/:id', {id: '@id'},
    { 'get':       { method: 'GET' },
      'save':      { method: 'POST' },
      'query':     { method: 'GET', isArray: true},
      'remove':    { method: 'DELETE' },
      'delete':    { method: 'DELETE' }
    }
  );
}
