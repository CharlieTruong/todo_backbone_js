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
      var loginView = new LoginView(this.$container);
      this.currentViews = [loginView];
    }
  },

  getUserTodos: function(id){
    this.removeCurrentView();
    if(localStorage.user_id === undefined || localStorage.user_id != id){
      window.location.href = '#';
    }
    else{
      var logoutView = new LogoutView(this.$container);
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