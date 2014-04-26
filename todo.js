LoginView = Backbone.View.extend({
  id: 'login_view',

  template: _.template("<form id='login_form'>"
                        +"<input type='text' placeholder='email' name='email'/>"
                        +"<input type='password' placeholder='password'name='password'/>"
                        +"<input type='Submit' id='login_button' value='Login'/>"
                      +"</form>",{}),
  
  initialize: function(container){
    this.$container = container;
    this.render();
    this.overrideSubmit();
  },

  render: function(){
    this.$el.html(this.template);
    this.$container.append(this.el);
    return this;
  },     

  overrideSubmit: function(){
    var self = this;

    $(this.el).find('form').submit(function(e){
      e.preventDefault();
      data = self.convertFormDataToJSON();
      if(self.formComplete(data)){
        self.submitForm(data);
      }
      else{
        alert('You must fill out all fields.');
      }     
    });
  },

  convertFormDataToJSON: function (){
      var array = $(this.el).find('form').serializeArray();
      var json = {};
      jQuery.each(array, function() {
          json[this.name] = this.value || '';
      });
      return json;
  },

  formComplete: function(data){
    var status = true;
    for(dataEl in data){
      if(data[dataEl] === ''){status = false;}
    }
    return status;
  },

  submitForm: function(data){
    var self = this;

    $.ajax({
      type: 'POST',
      url: 'http://recruiting­-api.nextcapital.com/users/sign_in',
      data: data,
      dataType: 'json'
    }).done(self.handleResponse);
  },

  handleResponse: function(response){
    if(response.message){
      alert(response.message);
    }
    else{
      sessionStorage.user_id = response.id;
      this.setToken(response.api_token);
      window.location.href = '#/users/' + response.id + '/todos';
    }
  },

  setToken: function(token){
    $.ajaxSend(function(event, request) {
        request.setRequestHeader("api_token", token);
      }
    );
  }
});


var AppRouter = Backbone.Router.extend({

  routes: {
    "": "login",
    "/users/:id/todos": "getUserTodos"
  },
  
  login: function() {
    var loginView = new LoginView($('#container'));
  },

  getUserTodos: function(id){
    if(sessionStorage.user_id === undefined || sessionStorage.user_id != id){
      this.navigate('');
    }
    else{
      var todoList = new TodoList(id);
      var todoListView = new TodoListView({
           collection: todoList
      });
      todoList.fetch(); 
    }
  }
});

var Todo = Backbone.Model.extend({
  defaults: {
    'is_complete': false
  },

  urlRoot: function(){
    return 'http://quiet-bayou-3531.herokuapp.com/http://recruiting-api.nextcapital.com/users/' + sessionStorage.user_id + '/todos/'
  },

  toJSON: function() {
    return {api_token: sessionStorage.api_token, todo: _.clone( this.attributes ) }
  }
});

var TodoView = Backbone.View.extend({
  tagName: 'li',
  template: _.template("<div><input type='checkbox' name='is_complete'><%-todo.description%></div>"),
  
  initialize: function(){
    this.render();
    this.listenTo(this.model, 'change', this.render);
  },

  events: {
    'click input[type=checkbox]':'updateComplete'
  },

  render: function(){
    this.$el.html(this.template(this.model.toJSON() ));
    this.$el.find('input[type=checkbox]').attr('checked', this.model.get('is_complete'));
    return this;
  },

  updateComplete: function(){
    this.model.get('is_complete') ? this.model.set({is_complete: false}) : this.model.set({is_complete: true})
    this.$el.addClass('complete');
    this.model.save();
  }
});

var TodoList = Backbone.Collection.extend({
  model: Todo,
  url: function(){
    return 'http://quiet-bayou-3531.herokuapp.com/http://recruiting-api.nextcapital.com/users/' + sessionStorage.user_id + '/todos'
  }
});

var TodoListView = Backbone.View.extend({
  tagName: 'ul',

  template: _.template("<li><form id='todo_form'>"
                        +"<input type='text' placeholder='New Todo' name='description'/>"
                        +"<input type='Submit' id='todo_button' value='Add Todo'/>"
                      +"</form></li>",{}),

  initialize: function(){
    this.$el.append(this.template);
    $('#container').append(this.el);
    var self = this;
    this.collection.fetch({data: {api_token: sessionStorage.api_token}, success: function(){self.render();}});
  },

  events: {
    "submit form" : "submitNewTodo"
  },

  render: function(){
    var self = this;
    self.collection.each(function(model){
      var view = new TodoView({model: model});
      self.$el.append(view.el);
    });
  }, 

  submitNewTodo: function(e){
    e.preventDefault();
    var newTodo = this.$el.find('input[name=description]').val();
    var self = this;
    if(newTodo != ''){
      this.collection.create({description: newTodo}, {success: function(response){self.addTodoView(response);}});
    }
    else{
      alert('New todo cannot be blank.');
    }
  },

  addTodoView: function(response){
    var todo = new Todo(response);
    var todoView = new TodoView({model: todo});
    this.$el.append(todoView.render().el);  
    this.$el.find('input[name=description]').val('');  
  }
});

$(document).ready(function(){
  var app = new AppRouter();
  Backbone.history.start();
});