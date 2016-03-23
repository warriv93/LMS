app.directive('adminList', [
  "settings",
  "user",
  "Item",
  function(
    settings,
    user,
    Item
  ) {

    return {
      templateUrl: settings.widgets + 'item/list.html',
      link: function(scope, element, attrs) {

        
        Item.create({
          title: "testTitle",
          content: "testContent"
        });
        
        scope.items = Item.index();

        // "synthetic" event subscriber
        scope.$on('newItem', function() {
          scope.items = Item.index();
        });
      }
    };
  }
]);