app.config(function($stateProvider) {

  $stateProvider
    .state('home.reports', {
      url: "/reports",
      views: {
        "": {
          templateUrl: '/static/ngTemplates/app.reports.html',
        },
        "menu@home.reports": {
          templateUrl: '/static/ngTemplates/app.reports.menu.html',
          controller: 'projectManagement.reports.menu',
        },
        "@home.reports": {
          templateUrl: '/static/ngTemplates/app.reports.default.html',
          controller: 'projectManagement.reports.default',
        }
      }
    })
    .state('home.reports.users', {
      url: "/users",
      templateUrl: '/static/ngTemplates/app.reports.users.html',
      controller: 'projectManagement.reports.users'
    })
    .state('home.reports.projects', {
      url: "/projects",
      templateUrl: '/static/ngTemplates/app.reports.projects.html',
      controller: 'projectManagement.reports.projects'
    })
    .state('home.reports.online', {
      url: "/online",
      templateUrl: '/static/ngTemplates/app.reports.online.html',
      controller: 'projectManagement.reports.online'
    })
    .state('home.reports.tracer', {
      url: "/tracer",
      templateUrl: '/static/ngTemplates/app.reports.tracer.html',
      controller: 'projectManagement.reports.tracer'
    })



});


app.controller('projectManagement.reports.menu', function($scope, $http, $aside, $state, Flash, $users, $filter, $permissions) {
  // settings main page controller
  var getState = function(input) {
    var parts = input.name.split('.');
    return input.name.replace('app', 'home')
  }
  $scope.apps = [];
  $scope.buildMenu = function(apps) {
    for (var i = 0; i < apps.length; i++) {
      var a = apps[i];
      var parts = a.name.split('.');
      if (a.module != 1 || parts.length != 3 || parts[1] != 'reports') {
        continue;
      }
      a.state = getState(a)
      a.dispName = parts[parts.length - 1];
      $scope.apps.push(a);
    }
  }
  var as = $permissions.apps();
  if (typeof as.success == 'undefined') {
    $scope.buildMenu(as);
  } else {
    as.success(function(response) {
      $scope.buildMenu(response);
    });
  };
  $scope.isActive = function(index) {
    var app = $scope.apps[index]
    if (angular.isDefined($state.params.app)) {
      return $state.params.app == app.name.split('.')[2]
    } else {
      return $state.is(app.name.replace('app', 'home'))
    }
  }
});

app.controller('projectManagement.reports.default', function($scope, $http, $aside, $state, Flash, $users, $filter, $permissions) {
  console.log('Reports Default Page');
  $state.go('home.reports.users')

});
