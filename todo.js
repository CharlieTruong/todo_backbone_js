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
  },

  events: {
    'click #login_button': 'login'
  },

  render: function(){
    this.$el.html(this.template);
    this.$container.append(this.el);
    return this;
  },     

  login: function(){
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
      url: 'http://recruiting­api.nextcapital.com/users/sign_in',
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
      sessionStorage.api_token = response.api_token;
      window.location.href = '#/users/' + response.id + '/todos';
    }
  }
});


