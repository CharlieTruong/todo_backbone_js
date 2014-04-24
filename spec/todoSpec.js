function setUpHTMLFixture() {
  setFixtures("<div id='container'></div>");
}

describe('LoginView', function(){
  var loginView;
  var server;

  beforeEach(function(){
    setUpHTMLFixture();
    loginView = new LoginView($('#container'));
    server = sinon.fakeServer.create();
  });

  afterEach(function() {
    server.restore();
  });

  describe('el', function(){
    it("contains a text input field", function(){
      expect($(loginView.el).find('input[type=text]').length).toEqual(1);
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
      beforeEach(function(){
        server.respondWith("POST", "http://recruiting­api.nextcapital.com/users/sign_in", [200, {"Content-Type": "application/json"},
          '{"api_token":"123","email":"user@gmail.com", "id": "1"}']);
        $(loginView.el).find('input[type=text]').val('user@gmail.com');
        $(loginView.el).find('input[type=password]').val('password');
        $('#login_view input[type=submit]').trigger('click'); 
        server.respond();
      });

      it('redirects to the user\'s todo list', function(){
        expect(window.location.href.split('#')[1]).toEqual('/users/1/todos')
      });

      it('sets the browser sessionStorage with the returned api token and user id', function(){
        expect(sessionStorage.user_id).toEqual('1');
        expect(sessionStorage.api_token).toEqual('123');
      });
    }); 

    describe('failure', function(){
      it('raises an alert', function(){
        server.respondWith("POST", "http://recruiting­api.nextcapital.com/users/sign_in", [200, {"Content-Type": "application/json"},
          '{"message": "error"}']);
        var spy = spyOn(window,'alert');
        $(loginView.el).find('input[type=text]').val('user@gmail.com');
        $(loginView.el).find('input[type=password]').val('badPassword');
        $('#login_view input[type=submit]').trigger('click'); 
        server.respond();
        expect(spy).toHaveBeenCalled();
      });
    });
  });
});