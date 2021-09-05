app.controller("controller.home.feedback", function($scope, $state, $users, $stateParams, $http, Flash, $uibModal) {


  $http({
    method: 'GET',
    url: '/api/performance/feedback/'
  }).
  then(function(response) {
    $scope.feedsDash = response.data.length
    console.log($scope.feedsDash,'feeeeeeeeeee');
  })

  $http({
    method: 'GET',
    url: '/api/employees/complaints/?status=resolved'
  }).
  then(function(response) {
    $scope.complaintsDash = response.data.length
    console.log($scope.complaintsDash,'comppppppppppp');
  })

  $http({
    method: 'GET',
    url: '/api/HR/appraisal/'
  }).
  then(function(response) {
    $scope.appraisalDash = response.data.length
    console.log($scope.appraisalDash,'appppprrrrr');
  })

  $scope.me = $users.get('mySelf');
  $http({
    method: 'GET',
    url: '/api/performance/feedback/'
  }).
  then(function(response) {
    $scope.feeds = response.data
  })

  $http({
    method: 'GET',
    url: '/api/employees/complaints/'
  }).
  then(function(response) {
    $scope.complaints = response.data
  })


  $scope.limit = 6;
  $scope.climit = 8
  $scope.hideit = false;
  $scope.hidecbtn = false;
  $scope.loadMore = function(lim, typ) {
    console.log('loooooooooooo', lim, $scope.feeds.length, typ);
    if (typ == 'feed') {
      if (lim == $scope.feeds.length) {
        $scope.hideit = true;
      }
      $scope.increamented = $scope.limit + 4;
      $scope.limit = $scope.increamented > $scope.feeds.length ? $scope.feeds.length : $scope.increamented;
    } else {
      if (lim == $scope.complaints.length) {
        $scope.hidecbtn = true;
      }
      $scope.increamented = $scope.climit + 4;
      $scope.climit = $scope.increamented > $scope.complaints.length ? $scope.complaints.length : $scope.increamented;
    }

  };

  $scope.resolve = function(pk) {
    var toSend = {
      status: 'resolved'
    }
    $http({
      method: 'PATCH',
      url: '/api/employees/complaints/' + pk + '/',
      data: toSend,
    }).
    then(function(response) {
    })
  }


})
