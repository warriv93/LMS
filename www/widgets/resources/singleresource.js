app.directive('resourcesSingleresource', [
  "settings",
  "User",
  "$routeParams",
    "$location",
    "SessionService",
    "Course",
    "Resource",
  function(
    settings,
    User,
    $routeParams,
     $location,
    SessionService,
     Course,
     Resource
    ) {
    return {
      templateUrl: settings.widgets + 'resources/singleResource.html',
      link: function(scope, element, attrs) {


          var theLocation;
          var theLocationPath;
          var url;
          scope.course = "";
          scope.showAll = false;
          scope.title = "My resources";

          var setupTheResource = function() {
              scope.showAll = false;
              theLocationPath = $location.path();
              theLocation = theLocationPath.split("/");

              //check if resource view is global or assigned a course
              if(theLocation[1] === "resources") {
                  scope.showAll = true;
                  url = theLocation[1];
              } else {
                  //get the course url
                  for (var i = 0; i < theLocation.length; i++ ) {
                      if(theLocation[i] === "courses") {
                          url = theLocation[i+1];
                          break;
                      }
                  }
              }

              scope.theResource;
              //console.log(theLocation);
              Resource.get({url: theLocation.pop()}, function(resource) {
                  scope.theResource = resource[0];
                  
                  User.get({_id: scope.theResource.uploaded_by}, function(user) {
                      scope.theResource.uploaded_by = user[0].first_name + " " + user[0].last_name;
                  });
                  
                  $(".resourceContent").append(scope.theResource.content);

                  if (scope.theResource.filename) {
                    var file = scope.theResource.filename.split(".").pop();
                    var fileUrl = "uploads/" + scope.theResource.filename;
                  }
                  else {
                      var file = undefined;
                      var fileUrl = undefined;
                  }
                  
                  //check file type; stored as String in DB - update to check for filetype
                  if (file === "jpg" || file === "png" || file === "gif") {
                      var theFile = '<a target="_self" class="download--picture" href="' + fileUrl + '" download><img src="uploads/' + scope.theResource.filename+ '"></a>';
                       $('.resourceFile').empty().append(theFile + '<div class="resourceFileName">' + scope.theResource.filename + '</div>');
                  }
                  else if (file === "pdf") {
                      $('.resourceFile').empty().append('<iframe src="'+ fileUrl + '" frameborder="0"></iframe>');
                      $('.resourceFile').removeClass("col-md-12 col-md-offset-6").addClass("col-md-24");
                  }
                  else if (file === "mp4" || file === "ogg" || file === "m4v") {
                      console.log("video");
                      $('.resourceFile').empty().append('<video controls><source src="' + fileUrl + '" type="video/mp4"><source src="' + scope.theResource.filename + '" type="video/ogg"></video>');                    
                  } 
                  else if ( file === undefined) {
                      //print nothing, content is good enought
                  }
                  else {
                    $('.resourceFile').empty().append('<a target="_self" href="uploads/' + scope.theResource.filename + '" download>' + scope.theResource.filename + '</a>');
                  }

              });
          }

        setupTheResource();

        scope.updateLocation = function(resourceUrl) {
            $location.path(theLocationPath + resourceUrl);
        }
        
        //show hide modal update resources
        scope.updateResourceModalShown = false;
        scope.toggleUpdateResourceModal = function() {
            scope.updateResourceModalShown = !scope.updateResourceModalShown;
        };

      } //link
    };
  }
]);
