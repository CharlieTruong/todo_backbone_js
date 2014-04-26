LoginView = Backbone.View.extend({
  id: 'login_view',

  template: _.template("<form id='login_form'>"
                        +"<input type='email' placeholder='email' name='email'/>"
                        +"<input type='password' placeholder='password'name='password'/>"
                        +"<input type='Submit' id='login_button' value='Login'/>"
                      +"</form>",{}),
  
  initialize: function(container){
    this.$container = container;
    this.render();
  },

  events: {
    "submit #login_form" : "login"
  },

  render: function(){
    this.$el.html(this.template);
    this.$container.append(this.el);
    return this;
  },     

  login: function(e){
    e.preventDefault();
    data = this.getInput();
    if(this.formComplete(data)){
      this.submitForm(data);
    }
    else{
      alert('You must fill out all fields.');
    }     
  },

  getInput: function(){
    var email = this.$el.find('input[name=email]').val();
    var password = this.$el.find('input[name=password]').val();
    return {email: email, password: password};
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
      url: 'http://quiet-bayou-3531.herokuapp.com/http://recruiting­-api.nextcapital.com/users/sign_in',
      data: data,
      dataType: 'json'
    }).done(self.handleResponse);
  },

  handleResponse: function(response){
    if(response.message){
      alert(response.message);
    }
    else{
      localStorage.user_id = response.id;
      localStorage.api_token = response.api_token;
      window.location.href = '#/users/' + response.id + '/todos';
    }
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
    if(localStorage.user_id === undefined || localStorage.user_id != id){
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
    return 'http://quiet-bayou-3531.herokuapp.com/http://recruiting-api.nextcapital.com/users/' + localStorage.user_id + '/todos/'
  },

  toJSON: function() {
    return {api_token: localStorage.api_token, todo: _.clone( this.attributes ) }
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
    return 'http://quiet-bayou-3531.herokuapp.com/http://recruiting-api.nextcapital.com/users/' + localStorage.user_id + '/todos'
  }
});

var TodoListView = Backbone.View.extend({

  template: _.template("<form id='todo_form'>"
                        +"<input type='text' placeholder='New Todo' name='description'/>"
                        +"<input type='Submit' id='todo_button' value='Add Todo'/>"
                      +"</form><ul></ul>",{}),

  initialize: function(){
    this.$el.append(this.template);
    $('#container').append(this.el);
    this.$el.find('ul').sortable();
    var self = this;
    this.collection.fetch({data: {api_token: localStorage.api_token}, success: function(){self.render();}});
  },

  events: {
    "submit #todo_form" : "submitNewTodo"
  },

  render: function(){
    var self = this;
    self.collection.each(function(model){
      self.addTodoView(model);
    });
  }, 

  submitNewTodo: function(e){
    e.preventDefault();
    var self = this;
    var newTodo = self.$el.find('input[name=description]').val();
    if(newTodo != ''){
      self.collection.create({description: newTodo}, {success: function(){self.addNewTodo();}});
    }
    else{
      alert('New todo cannot be blank.');
    }
  },

  addNewTodo: function(response){
    var lastIndex = this.collection.models.length - 1;
    var lastModel = this.collection.models[lastIndex];
    this.addTodoView(lastModel);
  },

  addTodoView: function(model){
    var todoView = new TodoView({model: model});
    this.$el.find('ul').append(todoView.render().el);  
    this.$el.find('input[name=description]').val('');  
  }
});



$(document).ready(function(){
  var app = new AppRouter();
  Backbone.history.start();
});