app.directive('assignmentCreateassignment', [
    "settings",
    "$location",
    "$window",
    "Course",
    "User",
    "Assignment",
    "SessionService",
  function(
    settings,
    $location,
    $window,
    Course,
    User,
    Assignment,
    SessionService
  ) {
    return {
      templateUrl: settings.widgets + 'assignment/createassignment.html',
      link: function(scope, element, attrs, $location) {

		        //get session_user
		        scope.session_user;
		        SessionService.getSession().success(function(response){
		            scope.session_user = response.user;
		        });

		        // Updates the GUI according to edit/add-state
		        scope.isEditing = false;
		        scope.btnAddOrUpdate = 'Create assignment';

		        var stepFinishedIndex = 0;
		        scope.isCreating = 1;

		        var AvailableCourses = Course.get();
		        var AvailableAssignments, oldassignment, selectedAssignmentName;

		        var getAssignmentsFromCourse = function(){
			        var courseId;

			        Course.get({name: selectedCourseName}, function(course)
			        {
						courseId = course[0]._id;

						Assignment.get({course: courseId}, function(res){
							AvailableAssignments = res;

							scope.assignmentSelect = {
						  		repeatSelect: null,
						  		availableOptions: AvailableAssignments
							};
						});
			        });
		        }

		        var selectedCourseName = "";

		        scope.courseSelect = {
					repeatSelect: null,
					availableOptions: AvailableCourses
			   	}

		        scope.selectCourseChanged = function (){
			        if(scope.assignment === undefined){
				        scope.assignment = "";
			        }

					selectedCourseName = scope.courseSelect.repeatSelect;
					getAssignmentsFromCourse();
			    }

			   	scope.selectAssignmentChanged = function (){
					selectedAssignmentName = scope.assignmentSelect.repeatSelect;
			   	}


                //check dateRange for GUI feedback
                scope.invalidDateRange = true;
                scope.invalidDateRangeGUI = false;
                scope.isDateRangeValid = function() {

                    var result = AvailableCourses.filter(function( obj ) {
                        return obj.name == selectedCourseName;
                    });

                    scope.assignment.course = result[0]._id;
                    scope.assignment.added_on = (new Date()).toJSON();

                    if(new Date(scope.assignment.due_date) > new Date(result[0].start)){
				        // Assignment due date is before the course has ended
				        if(new Date(scope.assignment.due_date) < new Date(result[0].end)){
                            // Assignment due date is after the course has ended
                            scope.invalidDateRange = false;
                            scope.invalidDateRangeGUI = false;
                        }
                        else {
                            scope.invalidDateRange = true;
                            scope.invalidDateRangeGUI = true;
                        }
                    }
                    else {
                        scope.invalidDateRange = true;
                        scope.invalidDateRangeGUI = true;
                    }
                };


                var newAssignmentDescription = "";

		        //Gui function add course
		        scope.addOrUpdateAssignment = function(){
                    //submit file upload
                    scope.$$childTail.submit();

			        if (typeof selectedCourseName !== 'undefined'){
				        if (typeof scope.assignment.obligatory !== 'undefined'){
				        	//Do nothing
						} else {
							scope.assignment.obligatory = false;
						}

						if(typeof scope.assignment.name !== 'undefined'){
							if( typeof scope.assignment.due_date !== 'undefined'){

							    var result = AvailableCourses.filter(function( obj ) {
									return obj.name == selectedCourseName;
								});

								scope.assignment.course = result[0]._id;
								scope.assignment.added_on = (new Date()).toJSON();

						        if(scope.isEditing == 0)
						        {
							        // Assignment due date is after the course has started
							        if(new Date(scope.assignment.due_date) > new Date(result[0].start)){
									    // Assignment due date is before the course has ended
								        if(new Date(scope.assignment.due_date) < new Date(result[0].end)){
											scope.isEditing = 1;

											scope.btnAddOrUpdate = "Update assignment";

											scope.assignment.responsible_teacher = "";
											scope.assignment.responsible_teacher = scope.session_user._id;
                                            scope.assignment.description = $("#createAssignment").attr("value");
                                            newAssignmentDescription = scope.assignment.description;
                                            if(scope.$$childTail.file){
                                                scope.assignment.teacher_instruction_file = scope.$$childTail.file[0].name.replace(/[\n\t\r\x20]/g, "_");
                                            } 

							              	Assignment.create(scope.assignment, function(res) {
								          		Course.get({ _id: res[0].course}, function(x) {

								          			
								          			//Update Course and Continue
										  			Course.update({
										  				_relate:{items:x[0],assignments:res[0] },
										  			});
									  				Assignment.update({ 
									  					_relate:{ items:res[0], course:x[0]}
									  				}, function(newres){
                                                                                                                              
										  				Assignment.get({_id: res[0]._id}, function(newAssignment){
											  				oldassignment = JSON.parse(JSON.stringify(newAssignment[0]));
											  				scope.incrementStep();
										  				});
									  				});
					                    		});
								          	});
							        	}
							     	}
								} else if (scope.isEditing == 1){
							        // Assignment due date is after the course has started
							        if(new Date(scope.assignment.due_date) > new Date(result[0].start)){
									    // Assignment due date is before the course has ended
								        if(new Date(scope.assignment.due_date) < new Date(result[0].end)){

								        	oldassignment.due_date = new Date(oldassignment.due_date);
											Assignment.get({responsible_teacher: oldassignment.responsible_teacher, added_on: oldassignment.added_on, course: oldassignment.course},function(resAssignment){
												scope.assignment.added_on = undefined;
												var ass = scope.assignment;
                                                if(scope.$$childTail.file){
                                                    var strippedFileName = scope.$$childTail.file[0].name.replace(/[\n\t\r\x20]/g, "_");
                                                } else {
                                                    var strippedFileName = "undefined";
                                                }
												Assignment.update({_id: resAssignment[0]._id}, {
													name: scope.assignment.name,
													description: scope.assignment.description,
													obligatory: scope.assignment.obligatory,
													due_date: scope.assignment.due_date,
                                                    teacher_instruction_file: strippedFileName
                                                }, function(res){
													oldassignment = "";
													oldassignment = JSON.parse(JSON.stringify(scope.assignment));
													scope.incrementStep();
												});
											});
						        		}
						        	}
						        }
					    	} else {
						    	console.log("You need to specify a due date");
					    	}
					    } else {
						    console.log("Assignment name undefined");
					    }
		          	} else {
			         	alert("Please select a course before you add an assignment");
		        	}
		        }

		        scope.createsteps = [{
						name: "Create or copy",
						icon: "fa-file-text-o",
					},
					{
						name: "Details",
						icon: "fa-leaf",
					},
					{
						name: "Assignment",
						icon: "fa-i-cursor",
		          	},
					{
						name: "Preview",
						icon: "fa-eye",
					}];

		        scope.steps = [{
						name: "Create or copy",
						icon: "fa-file-text-o",
					},
					{
						name: "Details",
						icon: "fa-leaf",
					},
					{
						name: "Select assignment",
						icon: "fa-file-text-o",
					},
					{
						name: "Assignment",
						icon: "fa-i-cursor",
					},
					{
						name: "Preview",
						icon: "fa-eye",
					}];

		        //start out on step
		        scope.selection = scope.steps[0].name;

		        scope.getCurrentStepIndex = function(){
			        if(scope.isCreating){
			            // Find index of the current step by object name
			            for(var i = 0; i < scope.createsteps.length; i += 1) {
			                if(scope.createsteps[i].name === scope.selection) {
			                    return i;
			                }
			            }
		            } else {
			           	// Find index of the current step by object name
		            	for(var i = 0; i < scope.steps.length; i += 1) {
		                	if(scope.steps[i].name === scope.selection) {
		                    	return i;
		                	}
		            	}
		            }
		        }

		       	// Move to a defined step index
		        scope.goToStep = function(index) {
			        // If you are going backwards in the flow: No worries
			        if(scope.getCurrentStepIndex() > index){
			        	if(scope.isCreating){
							scope.selection = scope.createsteps[index].name;
						} else {
							scope.selection = scope.steps[index].name;
						}
					}
					// Going forwards in the flow
					else {
						// If you are going to a step that are finished
						if(stepFinishedIndex >= index)
						{
							if(scope.isCreating){
								scope.selection = scope.createsteps[index].name;
							} else {
								scope.selection = scope.steps[index].name;
							}
						}
					}
		      }

		        // Return true if step has next step, false if not
		        scope.hasNextStep = function() {
		            var stepIndex = scope.getCurrentStepIndex();
		            var nextStep = stepIndex + 1;

		            if(scope.steps[nextStep] == undefined) {
		                return false;
		            } else {
		                return true;
		            };
		        };

		        // Return true if step has previous step, false if not
		        scope.hasPreviousStep = function() {
		            var stepIndex = scope.getCurrentStepIndex();
		            var previousStep = stepIndex - 1;
		            if(scope.steps[previousStep] == undefined) {
		                return false
		            } else {
		                return true
		            };
		        };

		        scope.setCreate = function() {
			        scope.assignment = undefined;
			        scope.isEditing = 0;
			        scope.isCreating = 1;
			        scope.btnAddOrUpdate = "Create assignment";
			        scope.incrementStep();
			    }

			    scope.setCopy = function() {
				    scope.assignment = undefined;
				    scope.isEditing = 0;
			        scope.isCreating = 0;
			        scope.btnAddOrUpdate = "Create assignment";
			        scope.incrementStep();
			    }

		        scope.loadDetails = function(){
			        scope.incrementStep();

			        var obj = AvailableAssignments.filter(function(obj){
						return obj.name === selectedAssignmentName;
					})[0];

			        // var assignmentIndex = AvailableAssignments.indexOf(selectedAssignmentName);

			        obj.due_date = new Date(obj.due_date);
			        obj._id = undefined;
			        obj.added_on = undefined;

			       	scope.assignment = obj;
		        }

		        //move to next step
		        scope.incrementStep = function() {
		            if (scope.hasNextStep()){
						var stepIndex = scope.getCurrentStepIndex();
						var nextStep = stepIndex + 1;

						if(scope.isCreating){
							scope.selection = scope.createsteps[nextStep].name;
                            if(scope.createsteps[nextStep].name == "Preview") {
                                setTimeout(previewDescription,50);
                            }

						} else {
							scope.selection = scope.steps[nextStep].name;
						}

						if(stepIndex >= stepFinishedIndex) {
							stepFinishedIndex++;
						}
		            }
		        };

                var previewDescription = function() {
                    $(".assignmentDescription").append(scope.assignment.description);
                };

		        //move to previous step
		        scope.decrementStep = function() {
		            if(scope.hasPreviousStep()){
						var stepIndex = scope.getCurrentStepIndex();
						var previousStep = stepIndex - 1;

						if(scope.isCreating){
							scope.selection = scope.createsteps[previousStep].name;
						} else {
							scope.selection = scope.steps[previousStep].name;
						}
		            }
		        };

		        //roate location
		        scope.pathLocation = function() {
		            Assignment.get({name: scope.assignment.name, added_on: scope.assignment.added_on, responsible_teacher: scope.assignment.responsible_teacher, _populate:"course"}, function(fetchedAssignment){
						scope.$parent.hideModal();
						$window.location.href = '/courses/' + fetchedAssignment[0].course.url + "/assignments/" + fetchedAssignment[0]._id;
			       });
		        }


                scope.closeModalAssignmentSession = function() {
                    scope.isEditing = false;
                    scope.btnAddOrUpdate = 'Create assignment';
                    scope.assignment = undefined;
                    var stepFinishedIndex = 0;
                    scope.selection = scope.steps[0].name;
                    scope.$parent.hideModal();
                }
    		} //link
    	}
  	}
]);
