var LoginView = Backbone.View.extend({
  id: 'login_view',

  template: _.template("<form id='login_form'>"
                        +"<input type='email' placeholder='email' name='email'/>"
                        +"<input type='password' placeholder='password'name='password'/>"
                        +"<input type='Submit' id='login_button' value='Login'/>"
                      +"</form>",{}),
  
  initialize: function(container, model){
    this.$container = container;
    this.model = model;
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
    var self = this;
    data = this.getInput();
    if(this.formComplete(data)){
      this.model.save(data, {success: self.redirectTodos, error: self.raiseAlert})
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

  raiseAlert: function(model, response){
    alert(response.responseJSON.message);
  },

  redirectTodos: function(model, response){
    localStorage.user_id = response.id;
    localStorage.api_token = response.api_token;
    window.location.href = '#/users/' + response.id + '/todos';
  },

  close: function(){
    this.remove();
  }
});

var LogoutView = Backbone.View.extend({
  template: _.template("<button id='logout_button'>Logout</button>"),

  initialize: function(container, model){
    this.$container = container;
    this.model = model;
    this.render();
  },

  events: {
    'click #logout_button': 'logout' 
  },

  render: function(){
    this.$el.html(this.template);
    this.$container.append(this.el);
    return this;
  },

  logout: function(){
    var self = this;
    this.model.destroy({data: {api_token: localStorage.api_token, user_id: localStorage.user_id}, processData: true})
      .always(function(){
        localStorage.clear();
        window.location.href = '#';  
      });
  },

  close: function(){
    this.remove();
  }
});