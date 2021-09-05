app.controller('projectManagement.reports.users', function($scope, $http, $aside, $state, Flash, $users, $filter, $permissions, $stateParams) {

  var views = [{
    name: 'table',
    icon: 'fa-bars',
    template: '/static/ngTemplates/genericTable/genericSearchList.html',
    itemTemplate: '/static/ngTemplates/app.reports.users.item.html'
  }, ];

  $scope.config = {
    url: '/api/HR/users/',
    views: views,
    itemsNumPerView: [20, 40, 80],
    searchField: 'username',
  };

  $scope.tabs = [];
  $scope.searchTabActive = true;
  $scope.data = {
    tableData: []
  };

  $scope.closeTab = function(index) {
    $scope.tabs.splice(index, 1)
  }

  $scope.addTab = function(input) {
    $scope.searchTabActive = false;
    alreadyOpen = false;
    for (var i = 0; i < $scope.tabs.length; i++) {
      if ($scope.tabs[i].app == input.app) {
        if ((typeof $scope.tabs[i].data.url != 'undefined' && $scope.tabs[i].data.url == input.data.url) || (typeof $scope.tabs[i].data.pk != 'undefined' && $scope.tabs[i].data.pk == input.data.pk)) {
          $scope.tabs[i].active = true;
          alreadyOpen = true;
        }
      } else {
        $scope.tabs[i].active = false;
      }
    }
    if (!alreadyOpen) {
      $scope.tabs.push(input)
    }
  }

  $scope.tableAction = function(target, action, mode) {
    if (action == 'viewUserReports') {
      for (var i = 0; i < $scope.data.tableData.length; i++) {
        if ($scope.data.tableData[i].pk == target) {
          $scope.addTab({
            title: 'User : ' +$scope.data.tableData[i].pk,
            cancel: true,
            app: 'userReports',
            data: {
              pk: target,
              userData: $scope.data.tableData[i]
            },
            active: true
          })
        }
      }

    }
  }

});


app.controller('reports.userReport.details', function($scope, $http, $aside, $state, Flash, $users, $filter, $permissions, $stateParams) {
  $scope.userDetails = $scope.tab.data.userData
  $http({
    method: 'GET',
    url: '/api/projects/project/?userProjectsOnly&userPk='+$scope.userDetails.pk
  }).
  then(function(response) {
    $scope.projectsDetails = [{title:'All','pk':0}].concat(response.data)
  })

  $scope.changeType = function(typ,pj){
    if (pj) {
      var project = pj
    }else {
      var project = $scope.pendingForm.project
    }
    var today = new Date()
    $scope.pendingForm = {typ:typ,stDate:new Date(today.setDate(today.getDate() - 1)),edDate:new Date(),project:project}
  }
  $scope.changeType('days',"0")
  $scope.fetchData = function(){
    if ($scope.pendingForm.edDate-$scope.pendingForm.stDate<0) {
      Flash.create('warning','Ending Should Be Less Than Starting')
      return
    }
    $http({
      method: 'GET',
      url: '/api/projects/userReports/?project='+parseInt($scope.pendingForm.project)+'&userPk='+$scope.userDetails.pk+'&typ='+$scope.pendingForm.typ+'&stDate='+$scope.pendingForm.stDate.toJSON()+ '&edDate=' + $scope.pendingForm.edDate.toJSON()
    }).
    then(function(response) {
      $scope.userStats = response.data
    })
  }
  $scope.fetchData()
})
