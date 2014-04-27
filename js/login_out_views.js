var LoginView = Backbone.View.extend({
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
      url: "http://quiet-bayou-3531.herokuapp.com/http://recruiting-api.nextcapital.com/users/sign_in",
      data: data,
      dataType: 'json'
    }).fail(self.raiseAlert)
      .done(self.redirectTodos);
  },

  raiseAlert: function(response){
    alert(response.responseJSON.message);
  },

  redirectTodos: function(response){
    localStorage.user_id = response.id;
    localStorage.api_token = response.api_token;
    window.location.href = '#/users/' + response.id + '/todos';
  }
});

var LogoutView = Backbone.View.extend({
  template: _.template("<button id='logout_button'>Logout</button>"),

  initialize: function(container){
    this.$container = container;
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
    $.ajax({
      type: 'DELETE',
      url: "http://quiet-bayou-3531.herokuapp.com/http://recruiting-api.nextcapital.com/users/sign_out",
      data: {api_token: localStorage.api_token, user_id: localStorage.user_id},
      dataType: 'json'
    }).always(function(){window.location.href = '#'});
    localStorage.clear();
  }
});