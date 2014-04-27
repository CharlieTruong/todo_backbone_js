$(document).ready(function(){
  var app = new AppRouter($('#container'));
  Backbone.history.start();
});