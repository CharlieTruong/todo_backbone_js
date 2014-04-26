function setUpHTMLFixture() {
  setFixtures("<div id='container'></div>");
}

describe('LoginView', function(){
  var loginView;

  beforeEach(function(){
    setUpHTMLFixture();
    loginView = new LoginView($('#container'));
  });

  describe('el', function(){
    it("contains an email input field", function(){
      expect($(loginView.el).find('input[type=email]').length).toEqual(1);
    });

    it("contains a password input field", function(){
      expect($(loginView.el).find('input[type=password]').length).toEqual(1);
    });

    it("contains a submit button", function(){
      expect($(loginView.el).find('input[type=submit]').length).toEqual(1);
    });
  });

  describe('initialize', function(){
    it('appends the el to a page\'s container div', function(){
      expect($('#container').find('#login_view')).toEqual($(loginView.el));
    });
  });

  describe('login', function(){
    it('prevents log-in attempt if all fields are not filled', function(){
      var spy = spyOn(window,'alert');
      $('#login_view input[type=submit]').trigger('click');
      expect(spy).toHaveBeenCalled();
    });

    describe('success', function(){
      var server;

      beforeEach(function(){
        server = sinon.fakeServer.create();
        server.respondWith("POST", "http://quiet-bayou-3531.herokuapp.com/http://recruiting-api.nextcapital.com/users/sign_in", [200, {"Content-Type": "application/json"},
          '{"api_token":"123","email":"user@gmail.com", "id": "1"}']);
        $(loginView.el).find('input[type=email]').val('user@gmail.com');
        $(loginView.el).find('input[type=password]').val('password');
        $('#login_view input[type=submit]').trigger('click'); 
        server.respond();
      });

      afterEach(function(){
        server.restore();
        localStorage.clear();
      });

      it('redirects to the user\'s todo list', function(){
        expect(window.location.href.split('#')[1]).toEqual('/users/1/todos')
      });

      it('saves user_id and api_token to localStorage', function(){
        expect(localStorage.user_id).toEqual('1');
        expect(localStorage.api_token).toEqual('123');
      });
    }); 

    describe('failure', function(){
      it('raises an alert', function(){
        server = sinon.fakeServer.create();
        server.respondWith("POST", "http://quiet-bayou-3531.herokuapp.com/http://recruiting-api.nextcapital.com/users/sign_in", [200, {"Content-Type": "application/json"},
          '{"message": "error"}']);
        var spy = spyOn(window,'alert');
        $(loginView.el).find('input[type=email]').val('user@gmail.com');
        $(loginView.el).find('input[type=password]').val('badPassword');
        $('#login_view input[type=submit]').trigger('click'); 
        server.respond();
        expect(spy).toHaveBeenCalled();
        server.restore();
      });
    });
  });
});

describe('LogoutView', function(){
  var logoutView;

  beforeEach(function(){
    setUpHTMLFixture();
    logoutView = new LogoutView($('#container'));
  });

  it('contains a button', function(){
    expect(logoutView.$el.find('button').length).toEqual(1);
  });

  it('appends the view to a given container on initialize', function(){
    expect($('#container').find('button').length).toEqual(1);
  })

  describe('logout button click', function(){
    var server;

    beforeEach(function(){
      server = sinon.fakeServer.create();
      server.respondWith("DELETE", "http://quiet-bayou-3531.herokuapp.com/http://recruiting-api.nextcapital.com/users/sign_out", [200, {"Content-Type": "application/json"},
        ""]);
      localStorage.user_id = 1;
      localStorage.api_token=123;
    });

    afterEach(function(){
      server.restore();
    });

    it('clears the localStorage', function(){
      logoutView.$el.find('#logout_button').trigger('click');
      server.respond();
      expect(localStorage.user_id).toEqual(undefined);
      expect(localStorage.api_token).toEqual(undefined);
    });

    it('redirects the user to the root page', function(){
      window.location.href = '#elsewhere';
      logoutView.$el.find('#logout_button').trigger('click');
      server.respond();
      expect(window.location.href.split('#')[1]).toEqual('')
    });
  });
});

describe('Todo', function(){
  var todo;

  beforeEach(function(){
    todo = new Todo({description: 'test todo'});
    todo.set({id: 1});
    localStorage.user_id = 1;
    localStorage.api_token = '123';
  });

  afterEach(function(){
    localStorage.clear();
  });

  it('is_complete is false by default', function(){
    expect(todo.get('is_complete')).toEqual(false);
  });

  it('it has the correct url', function(){
    expect(todo.url()).toEqual('http://quiet-bayou-3531.herokuapp.com/http://recruiting-api.nextcapital.com/users/1/todos/1')
  });

  it('toJSON includes the api_token and is in the appropriate format', function(){
    expect(todo.toJSON()).toEqual({api_token: '123', todo: {id: 1, description: 'test todo', is_complete: false}})
  });
});

describe('TodoView', function(){
  var todoView;
  var todo;

  beforeEach(function(){
    todo = new Backbone.Model({is_complete: false, description: 'test'});
    spyOn(todo, 'toJSON').and.returnValue({todo: {description: 'test'}});
    todoView = new TodoView({model: todo});
    setUpHTMLFixture();
  });

  it('it has a tagName of li', function(){
    expect(todoView.tagName).toEqual('li');
  });

  it('contains a check box for is_complete', function(){
    expect(todoView.$el.find('input[type=checkbox]').length).toEqual(1);
  });

  describe('is_complete checkbox', function(){
    var saveSpy;
    
    beforeEach(function(){
      localStorage.user_id = 1;
      saveSpy = spyOn(todo, 'save');
      todo.set({id: 1, is_complete: false});
      $('#container').append(todoView.el);
    });

    afterEach(function(){
      localStorage.clear();
    });

    it('reflects whether the todo is complete', function(){
      todo.set({is_complete: true});
      expect(todoView.$el.find('input[type=checkbox]').attr('checked')).toEqual('checked');
    });

    it('clicking the checkbox updates the todo is_complete status', function(){
      todoView.$el.find('input[type=checkbox]').trigger('click');
      expect(todoView.model.get('is_complete')).toEqual(true);
    });

    it('saves the todo is_complete status to the server', function(){
      todoView.$el.find('input[type=checkbox]').trigger('click');
      expect(saveSpy).toHaveBeenCalled();
    });

    it('adds the class complete to the view element if is_complete true', function(){      
      todoView.$el.find('input[type=checkbox]').trigger('click');
      expect(todoView.$el.attr('class')).toEqual('complete');
    });
  });
});

describe('TodoList', function(){
  var todoList;

  beforeEach(function(){
    var Todo = Backbone.Model.extend({});
    todoList = new TodoList();
  });

  afterEach(function(){
    localStorage.clear();
  });

  it('is a collection for todo model', function(){
    todoList.add({description: 'test'});
    expect(Todo.prototype.isPrototypeOf(todoList.models[0])).toEqual(true);
  });

  it('has the correct url', function(){
    localStorage.user_id = 1;
    expect(todoList.url()).toEqual('http://quiet-bayou-3531.herokuapp.com/http://recruiting-api.nextcapital.com/users/1/todos')
  });
});

describe('TodoListView', function(){
  var todoListView;
  var server;

  beforeEach(function(){
    setUpHTMLFixture();
    TodoView = Backbone.View.extend({el: '<li class="model"></li>'});
    todoList = new Backbone.Collection();
    todoList.url = function(){return "http://quiet-bayou-3531.herokuapp.com/http://recruiting-api.nextcapital.com/users/1/todos"};
    localStorage.api_token = 123;
    server = sinon.fakeServer.create();
    server.respondWith("GET", "http://quiet-bayou-3531.herokuapp.com/http://recruiting-api.nextcapital.com/users/1/todos?api_token=123", [200, {"Content-Type": "application/json"},
      '[{"id": 1, "description": "todo", "is_complete": false}, {"id": 2, "description": "todo", "is_complete": true}]']);
    todoListView = new TodoListView({collection: todoList});
    server.respond();
  });

  afterEach(function(){
    server.restore();
    localStorage.clear();
  });

  it('fetches and adds user\'s todos to the view', function(){
    expect(todoListView.$el.find('.model').length).toEqual(2);
  });

  describe('add todo form', function(){
    var server;

    beforeEach(function(){
      server = sinon.fakeServer.create();
      server.respondWith("POST", "http://quiet-bayou-3531.herokuapp.com/http://recruiting-api.nextcapital.com/users/1/todos", [200, {"Content-Type": "application/json"},
        '{"id": 3, "description": "todo test create", "is_complete": false}']);
    });

    afterEach(function(){
      server.restore();
    });

    it('contains an input text field for new todos', function(){
      expect(todoListView.$el.find('input[name=description]').length).toEqual(1);
    });  

    it('posts a new todo to the server and appends it to the view', function(){
      $('.container').append(todoListView.el);
      var spyTodoCreate = spyOn(todoList, 'create').and.callThrough();
      todoListView.$el.find('input[name=description]').val('todo test create');
      todoListView.$el.find('input[type=submit]').trigger('click'); 
      server.respond();
      expect(spyTodoCreate).toHaveBeenCalled();
      expect(todoListView.$el.find('.model').length).toEqual(3);
    });

    it('clears the input field after a todo is created', function(){
      todoListView.$el.find('input[name=description]').val('todo test create');
      todoListView.$el.find('input[type=submit]').trigger('click');
      server.respond();
      expect(todoListView.$el.find('input[name=description]').val()).toEqual(''); 
    });

    it('prevents the todo input from being blank', function(){
      var spyAlert = spyOn(window,'alert');
      todoListView.$el.find('input[type=submit]').trigger('click'); 
      expect(spyAlert).toHaveBeenCalled();
    });  
  })
});


// describe("AppRouter", function() {
//   var router;

//   beforeEach(function() {
//     router = new AppRouter();
//     try {
//       Backbone.history.start();
//     } catch(e) {}
//     window.location.href = '#elsewhere';
//   });

//   describe("/", function(){
//     it('creates a LoginView', function(){
//       var loginSpy = spyOn(window, 'LoginView');
//       window.location.href = '#';
//       expect(loginSpy).toHaveBeenCalled();
//     });
//   });
// });