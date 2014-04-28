var TodoView = Backbone.View.extend({
  tagName: 'li',
  template: _.template("<div><input type='checkbox' name='is_complete'><%-todo.description%></div>"),
  
  initialize: function(){
    this.render();
  },

  events: {
    'click input[type=checkbox]':'updateComplete'
  },

  render: function(){
    this.$el.html(this.template(this.model.toJSON() ));
    this.$el.find('input[type=checkbox]').attr('checked', this.model.get('is_complete'));
    if(this.model.get('is_complete')){this.$el.addClass('complete')}
    return this;
  },

  updateComplete: function(){
    this.model.get('is_complete') ? this.model.set({is_complete: false}) : this.model.set({is_complete: true})
    this.model.get('is_complete') ? this.$el.addClass('complete') : this.$el.removeClass('complete');
    this.model.save();
  }
});

var TodoListView = Backbone.View.extend({

  template: _.template("<form id='todo_form'>"
                        +"<input type='text' placeholder='New Todo' name='description'/>"
                        +"<input type='Submit' id='todo_button' value='Add Todo'/>"
                      +"</form>"
                      +"<p>Check off your completed todo items</p>"
                      +"<ul></ul>",{}),

  initialize: function(attributes){
    this.$container = attributes.$container;
    this.$el.append(this.template);
    this.$container.append(this.el);
    this.$el.find('ul').sortable();
    this.subViews = new Array();
    var self = this;
    this.collection.fetch({data: {api_token: localStorage.api_token}, success: function(){self.render();}});
  },

  events: {
    "submit #todo_form" : "submitNewTodo"
  },

  render: function(){
    var self = this;
    self.collection.sortByDescription();
    self.collection.each(function(model){
      self.addTodoView(model);
    });
  }, 

  submitNewTodo: function(e){
    e.preventDefault();
    var self = this;
    var newTodo = self.$el.find('input[name=description]').val();
    if(newTodo != ''){
      self.collection.create({description: newTodo}, {success: function(response){self.addNewTodo(response.id);}});
    }
    else{
      alert('New todo cannot be blank.');
    }
  },

  addNewTodo: function(id){
    var lastModel = this.collection.get(id);
    this.addTodoView(lastModel);
  },

  addTodoView: function(model){
    var todoView = new TodoView({model: model});
    this.subViews.push(todoView);
    this.$el.find('ul').append(todoView.render().el);  
    this.$el.find('input[name=description]').val('');  
  },

  close: function(){
    for(index in this.subViews){
      this.subViews[index].remove();
    }
    this.remove();
  }
});