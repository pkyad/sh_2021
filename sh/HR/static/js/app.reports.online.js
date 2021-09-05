app.controller('projectManagement.reports.online', function($scope, $http, $aside, $state, Flash, $users, $filter, $permissions, $stateParams, $timeout) {
  console.log('online reports ctrllllllllll');

  $scope.fetchLDDStatus = function() {
    $http({method : 'GET' , url : '/api/projects/LDDAssignment/?updated__gt=2019-08-08'}).
    then(function(response) {
      $scope.lddInProgress = response.data;
    })
  }

  $scope.fetchLDDStatus();


  $scope.openData = []
  $scope.onlineData = []
  $scope.getData = function(page){
    $http({
      method: 'GET',
      url: '/api/projects/getOnlineReports/'
    }).
    then((function(page) {
      return function(response) {
        $scope.onlineData = response.data

        for (var i = 0; i < $scope.onlineData.length; i++) {
          if ($scope.openData.indexOf($scope.onlineData[i].pk)>-1) {
            $scope.onlineData[i].showData=true
          }else {
            $scope.onlineData[i].showData=false
          }
        }
      }
    })(page))
  }
  $scope.page = 0
  $scope.getData($scope.page)

  $scope.more = function() {
    $scope.page += 1
    $scope.getData($scope.page)
  }

  $timeout(function(){
    $scope.getData('all')
    $scope.fetchLDDStatus();
  },40000)

  $scope.openDetails = function(obj){
    obj.showData=!obj.showData
    if (obj.showData) {
      if ($scope.openData.indexOf(obj.pk)==-1) {
        $scope.openData.push(obj.pk)
      }
    }else {
      var index = $scope.openData.indexOf(obj.pk);
      if (index > -1) {
        $scope.openData.splice(index, 1);
      }
    }
  }

  $scope.download =  function(typ,projPk){
    console.log(typ,projPk);
    if (typ=='all') {
      window.open('/api/projects/getOnlineReports/?typ='+typ, '_blank')
    }else {
      window.open('/api/projects/getOnlineReports/?typ='+typ+'&projPk='+projPk, '_blank')
    }
  }
})
