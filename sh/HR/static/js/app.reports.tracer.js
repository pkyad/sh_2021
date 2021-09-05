String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

app.controller('projectManagement.reports.tracer', function($scope, $http, $aside, $state, Flash, $users, $filter, $permissions, $stateParams) {

  $scope.form = {project : "", data : [] , fields : [] , fileName : '' , user : null }
  $scope.page = 0

  $scope.projectSearch = function(query) {
    return $http.get('/api/projects/projectSearch/?limit=10&title__icontains=' + query).
    then(function(response) {
      $scope.append = false;
      return response.data.results;
    })
  };
  $scope.reset = function() {
    $scope.form = {project : "", data : [] , fields : [] , fileName : '' , user : null }
  }

  $scope.next = function() {
    $scope.page += 1;
    $scope.fetchFiles();
  }
  $scope.prev = function() {
    $scope.page -=1;
    $scope.fetchFiles();
  }

  $scope.fetchFiles = function() {
    $scope.form.userValMap = [];
    $scope.form.data = [];
    $scope.form.fields = [];

    if (typeof $scope.form.project != 'object' ) {
      Flash.create('warning' , 'Please select a project')
      return;
    }

    $http({method : 'GET' , url : '/api/projects/projectfield/?project=' + $scope.form.project.pk  }).
    then(function(response) {
      $scope.form.fields = response.data;

      var url = '/api/projects/fileUploadTracer/?limit=10&project=' + $scope.form.project.pk + '&offset=' + 10*$scope.page   +'&path__icontains=' + $scope.form.fileName;

      if (typeof $scope.form.user == 'object') {
        url += '&user=' + $scope.form.user.pk
      }

      $http({method : 'GET' , url : url}).
      then(function(response) {

        $scope.form.data = response.data.results;

        $scope.append = false;

        for (var i = 0; i < $scope.form.data.length; i++) {

          $scope.form.data[i].userValMap = []

          var colCount = 0
          $scope.form.data[i].userValMap.push([])
          for (var k = 0; k < $scope.form.data[i].history.length; k++) {
            if ( $scope.form.data[i].history[k].saveCount > colCount) {
              colCount = $scope.form.data[i].history[k].saveCount
              $scope.form.data[i].userValMap.push([])
            }
          }

          console.log(colCount);
          console.log($scope.form.data[i].userValMap);

          for (var k = 0; k < $scope.form.data[i].history.length; k++) {
            $scope.form.data[i].history[k].created = new Date($scope.form.data[i].history[k].created);
            $scope.form.data[i].userValMap[ $scope.form.data[i].history[k].saveCount].push($scope.form.data[i].history[k])
          }

        }


      })
    })

  }



})
