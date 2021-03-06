app.directive('modelanythingModelanythingstart', [
  "settings",
  "User",
  "SessionService",
  function(
    settings,
    User,
    SessionService
  ) {

    return {
      templateUrl: settings.widgets + 'modelanything/modelanythingstart.html',
      link: function(scope, element, attrs) {

        var user;

        var loadPlugs = function() {
  			  scope.html = "";
  			  // console.log(user);

         // console.log(user.plugs.length);
           var nr = 0;
           var left = "";
           var right = "";

           SessionService.getSession().success(function(response){

            user = response.user;

            SessionService.updateSession(user.email).success(function(session) {
              user = session;

              if(user.plugs === undefined){
                return;
              }

      			  for(var i = 0; i < user.plugs.length; i++) {
      				  if(user.plugs[i].isActive == true){
      					  // Adds html to all plugins
      					     var plug = user.plugs[i].name;
      					     var id = user.plugs[i]._id;

                     if((i % 2) === 0){
                      left += "<div class='plugin_container'> <button id='deletePlug' class='btn' ng-click='deletePlug(" + '"' + id + '"' + ")'>   <i class='fa fa-times' aria-hidden='true'></i> </button> <" + "modelanything-plugins-" + plug + "/></div>";
                     }else{
                        right += "<div class='plugin_container'> <button id='deletePlug' class='btn' ng-click='deletePlug(" + '"' + id + '"' + ")'>   <i class='fa fa-times' aria-hidden='true'></i> </button> <" + "modelanything-plugins-" + plug + "/></div>";

                     }
                  }
      			  }
               scope.html = "<div class='col-md-12 col-left'>" + left+ "</div><div class='col-md-12 col-right'>"+right+"</div>";
            });
          });
  		      //scope.html = '<div class="col-xs-12" form-base>';
	      }

        loadPlugs();

        scope.$root.$on('refreshPlugList', function() {
            loadPlugs();
        });

        scope.deletePlug = function(id){
          console.log(id);
          console.log(user);

          User.update({
            _id:user._id
          },{
            $pull: {
                plugs : { _id: id }
            }
          });
          loadPlugs();

        }

	      // User.onQueueDone (loadPlugs);
  	      // console.log(kk);
      }
    };
  }
]);
