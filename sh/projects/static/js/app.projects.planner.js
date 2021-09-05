app.controller('projectManagement.projects.planner', function($scope, $http, $aside, $state, Flash, $users, $filter, $permissions , $uibModal) {

  $scope.offset = 0;
  $scope.form = {location : 'All' , teamLead : 'All' , customer : 'All'}
  $scope.next = function() {
    $scope.offset -= 6;
    $scope.refresh()
  }

  $scope.download = function() {
    $scope.pkValues = ''
    for (var i = 0; i < $scope.projects.length; i++) {
          for (var j = 0; j < $scope.projects[i].length; j++) {
            $scope.pkValues = $scope.pkValues+$scope.projects[i][j].pk+',';
      }
    }
    window.open('/api/projects/downloadPlanner/?values='+$scope.pkValues, '_blank');
  }

  $scope.deletePlan = function(pk) {

    $http({method : 'DELETE' , url : '/api/projects/plannerItem/' + pk +'/' }).
    then(function(response) {
      Flash.create('success' , 'Deleted');
      $scope.refresh();
    })


  }

  $scope.me = $users.get('mySelf');

  $scope.reset = function() {
    $scope.offset = 0;
    $scope.form.location = 'All';
    $scope.form.customer = 'All';
    $scope.form.teamLead = 'All';
    $scope.refresh()
  }
  $scope.prev = function() {
    $scope.offset += 6;
    $scope.refresh()
  }

  $http({method : 'GET' , url : '/api/ERP/serviceSearch/'}).
  then(function(response) {
    $scope.customerList = response.data;
  })

  $http({method : 'GET' , url : '/api/HR/userSearch/'}).
  then(function(response) {
    $scope.teamLeads = response.data;
  })

  $scope.add = function() {

    $uibModal.open({
      templateUrl: '/static/ngTemplates/app.projects.planner.new.html',
      size: 'md',
      backdrop: true,
      controller: function($scope, $http, $uibModalInstance) {
        $scope.form = {name : "" , location : "Bengaluru" , teamLead : "" , company : "" , date : new Date() , description : "" , timeZone : 'EDT'}

        $scope.save = function() {

          var toSend = {name : $scope.form.name , location : $scope.form.location , teamLead : $scope.form.teamLead.pk , company : $scope.form.company.pk , date : $scope.form.date , description : $scope.form.description , timeZone : $scope.form.timeZone }

          $http({method : 'POST' , url : '/api/projects/plannerItem/' , data : toSend }).
          then(function(response) {
            $uibModalInstance.close(response.data)
          })


        }

        $scope.companySearch = function(query) {
          return $http.get('/api/ERP/service/?name__contains=' + query).
          then(function(response) {
            return response.data;
          })
        };

        $scope.userSearch = function(query) {
          return $http.get('/api/HR/userSearch/?limit=10&username__contains=' + query).
          then(function(response) {
            return response.data.results;
          })
        }


      },
    }).result.then(function(obj) {

      for (var i = 0; i < $scope.dates.length; i++) {
        if ($scope.compareDates($scope.dates[i] , new Date(obj.date))) {
          $scope.projects[i].push(obj)
        }
      }

    }, function() {

    });

  }

  $scope.me = $users.get('mySelf');

  $scope.compareDates = function(d1 , d2) {
    if (d1.getMonth() ==  d2.getMonth() &&  d1.getFullYear()== d2.getFullYear() && d1.getDate() == d2.getDate()  ) {
      return true
    }
    return false;
  }

  $scope.refresh = function() {
    var today = new Date();
    var day = 1000 * 3600 * 24;
    $scope.dates = []
    for (var i = 6; i > 0; i--) {
      $scope.dates.push(new Date(today.getTime() - day * (i-6 + $scope.offset )))
    }

    var url = '/api/projects/plannerItem/?';

    if ($scope.form.teamLead != 'All') {
      url += '&teamLead=' + $scope.form.teamLead;
    }

    if ($scope.form.customer != 'All') {
      url += '&company=' + $scope.form.customer;
    }
    if ($scope.form.location != 'All') {
      url += '&location=' + $scope.form.location;
    }

    $http({method : 'GET' , url : url }).
    then(function(response) {
      $scope.projects = []
      for (var i = 0; i < $scope.dates.length; i++) {
        $scope.projects.push([])
        for (var j = 0; j < response.data.length; j++) {
          if ( $scope.compareDates($scope.dates[i] , new Date(response.data[j].date) ) ) {
            $scope.projects[i].push(response.data[j])
          }
        }
      }


    })
  }

  $scope.refresh()

  $scope.onDropComplete = function(d , evt , indx) {
    for (var i = 0; i < $scope.projects.length; i++) {
      for (var j = 0; j < $scope.projects[i].length; j++) {
        if ($scope.projects[i][j].pk == d.pk) {
          $scope.projects[i].splice(j, 1)
          $scope.projects[indx].push(d)

          $http({method : 'PATCH' , url : '/api/projects/plannerItem/' + d.pk + '/', data : {date : $scope.dates[indx]}}).
          then(function(response) {
            Flash.create('success' , 'Saved');
          })

        }
      }
    }
  }

});
