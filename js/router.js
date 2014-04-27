var AppRouter = Backbone.Router.extend({

  routes: {
    "users/:id/todos": "getUserTodos",
    "": "login"
  },

  initialize: function(container){
    this.$container = container;
  },
  
  login: function() {
    if(localStorage.user_id){
     window.location.href = '#/users/' + localStorage.user_id + '/todos'; 
    }
    else{
      this.removeCurrentView();
      var session = new Session();
      var loginView = new LoginView(this.$container, session);
      this.currentViews = [loginView];
    }
  },

  getUserTodos: function(id){
    this.removeCurrentView();
    if(localStorage.user_id === undefined || localStorage.user_id != id){
      window.location.href = '#';
    }
    else{
      var session = new Session({api_token: localStorage.api_token, user_id: localStorage.user_id, id: localStorage.user_id})
      var logoutView = new LogoutView(this.$container, session);
      var todoList = new TodoList();
      var todoListView = new TodoListView({$container: this.$container, collection: todoList});
      this.currentViews = [logoutView, todoListView];
    }
  },

  removeCurrentView: function(){
    if(this.currentViews && this.currentViews.length > 0){
      for(index in this.currentViews){
        this.currentViews[index].remove();
      }
    }
  }
});