var Todo = Backbone.Model.extend({
  defaults: {
    'is_complete': false
  },

  urlRoot: function(){
    return 'http://quiet-bayou-3531.herokuapp.com/http://recruiting-api.nextcapital.com/users/' + localStorage.user_id + '/todos/'
  },

  toJSON: function() {
    return {api_token: localStorage.api_token, todo: _.clone( this.attributes ) }
  }
});

var TodoList = Backbone.Collection.extend({
  model: Todo,
  
  url: function(){
    return 'http://quiet-bayou-3531.herokuapp.com/http://recruiting-api.nextcapital.com/users/' + localStorage.user_id + '/todos'
  },

  comparator: function(a, b) {
    if(this.sort_key){
      a = a.get(this.sort_key).toLowerCase();
      b = b.get(this.sort_key).toLowerCase();
      return a > b ?  1
           : a < b ? -1
           :          0;
    }
  }, 

  sortByDescription: function() {
      this.sort_key = 'description';
      this.sort();
  }      
});