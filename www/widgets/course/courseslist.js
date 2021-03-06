app.directive('courseCourseslist', [
  "settings",
  "$location",
  "SessionService",
  "User",
  "Course",
  "Assignment",
  function(
    settings,
    $location,
    SessionService,
    User,
    Course,
    Assignment
  ) {
    return {
      templateUrl: settings.widgets + 'course/courseslist.html',
      link: function(scope, element, attrs) {

        var session_user;

          scope.currentDate = new Date(); //used to filter assignments in the pinned course box

        var getCourse = function(course){
          Course.get({_id: course._id}, function(course) {
            return course[0];
          });
        }

        var refresh = function(){
          SessionService.getSession().success(function(response) {
            User.get({_id: response.user._id, _populate:"courses"}, function(user1){

              User.get({_id: response.user._id, _populate:"assignments"}, function(user){
                user1[0].assignments = user[0].assignments;

                session_user = user1;

              if(session_user[0].role == "admin"){
                scope.heading = "All courses";
              } else if((session_user[0].role == "student") || (session_user[0].role == "teacher")) {
                scope.heading = "My courses";
              }

              scope.pinnedCourses = [];

              if(user[0].courses_pinned.length != 0) {
                var allPinnedCourses = [];

                for (i = 0; i < user[0].courses_pinned.length; i++) {
                  currentObj = session_user[0].courses_pinned[i];
                  if(currentObj.pinned) {
                    Course.get({_id: currentObj.course, _populate:"resources"}, function(course1) {


                        Course.get({_id: course1[0]._id, _populate:"assignments"}, function(course) {

                          course[0].resources = course1[0].resources;

                         if(course[0].assignments !== undefined) {
                             var filteredAssignments = [];
                             for (var i = 0; i < course[0].assignments.length; i++) {
                                 if (new Date(course[0].assignments[i].due_date) > scope.currentDate) {
                                     filteredAssignments.push(course[0].assignments[i]);
                                    };
                             }
                             course[0].assignments = filteredAssignments;
                         }

                          scope.pinnedCourses.push(course[0]);
                          if(session_user[0].role == "admin") {
                            scope.courses = Course.get();
                          } else if((session_user[0].role == "student") || (session_user[0].role == "teacher")) {
                            scope.courses = session_user[0].courses;
                          }
                        });
                    });

                  } else {
                    if(session_user[0].role == "admin") {
                      scope.courses = Course.get();
                    } else if((session_user[0].role == "student") || (session_user[0].role == "teacher")) {
                      scope.courses = session_user[0].courses;
                    }
                  }
                }
              }
             if(user[0].courses_pinned.length == 0) {
               if(session_user[0].role === "admin")
               {
                 scope.courses = Course.get();
               }
               else if((session_user[0].role == "student") || (session_user[0].role == "teacher")) {

                 scope.courses = session_user[0].courses;

               }
             }
           });
           });
         });

       }

        //Runs on page update
        refresh();

        function findWithAttr(array, attr, value) {
          for(var i = 0; i < array.length; i += 1) {
            if(array[i][attr] === value) {
                return i;
            }
          }
        }

        //pins course in database
        scope.pinCourse = function(course){

          course.pin = "hej";
          // Updates session

          SessionService.updateSession(session_user[0].email).success(function(session) {
            session_user[0] = session;
          });
          SessionService.getSession().success(function(response) {
            User.get({_id: response.user._id, _populate:"courses"}, function(user){
              var tempCourses = [];
              var tempCourses = user[0].courses;
              var courseid = course._id;

              var obj = user[0].courses_pinned.filter(function ( obj ) {
                return obj.course === courseid;
              })[0];

              if(obj == undefined) {
                  User.update({
                      _id: user[0]._id
                  },{ $push: { courses_pinned:{
                          course: course._id,
                          pinned: true
                        }}}, function(res){
                          // scope.pinnedCourses.push(course);
                  });
              } else {
                // Set pinned to false
                User.update({ _id: user[0]._id,
                    courses_pinned: {$elemMatch: {course: course._id} }
                  },{ "courses_pinned.$.pinned" : !obj.pinned }, function(res) {


                });
              }
            });
          });
          refresh();
        }

        scope.class = "assignClass"

        scope.courseLocation = function(obj) {
          $location.path("courses/" + obj.currentTarget.attributes.dataLocation.value);
        };
        scope.$root.$on('addedCourse', function() {
          refresh();
        });
      }
    }
  }
]);
