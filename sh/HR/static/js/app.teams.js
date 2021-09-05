app.controller("admin.teams", function($scope, $state) {
  $scope.data = {
    tableData: []
  };
  var views = [{
    name: 'list',
    icon: 'fa-bars',
    template: '/static/ngTemplates/genericTable/genericSearchList.html',
    itemTemplate: '/static/ngTemplates/app.teams.item.html',
  }, ];

  $scope.teamsConfig = {
    views: views,
    url: '/api/HR/team/',
    searchField: 'title',
    itemsNumPerView: [16, 32],
    canCreate: true,
    editorTemplate: '/static/ngTemplates/app.team.createForm.html',
  }

  $scope.tableAction = function(target, action, mode) {
    if (action == 'browserTeams') {
      for (var i = 0; i < $scope.data.tableData.length; i++) {
        if ($scope.data.tableData[i].pk == parseInt(target)) {
          $scope.addTab({
            title: 'Team Details : ' + $scope.data.tableData[i].title,
            cancel: true,
            app: 'teamDetails',
            data: {
              pk: target,
              teamData: $scope.data.tableData[i]
            },
            active: true
          })
        }
      }
    }
  }

  $scope.tabs = [];
  $scope.searchTabActive = true;

  $scope.closeTab = function(index) {
    $scope.tabs.splice(index, 1)
  }

  $scope.addTab = function(input) {
    console.log(JSON.stringify(input));
    $scope.searchTabActive = false;
    alreadyOpen = false;
    for (var i = 0; i < $scope.tabs.length; i++) {
      if ($scope.tabs[i].data.pk == input.data.pk && $scope.tabs[i].app == input.app) {
        $scope.tabs[i].active = true;
        alreadyOpen = true;
      } else {
        $scope.tabs[i].active = false;
      }
    }
    if (!alreadyOpen) {
      $scope.tabs.push(input)
    }
  }

});

app.controller('admin.teams.explore', function($scope, $http, $aside, $state, Flash, $users, $filter, $permissions, $uibModal, $stateParams) {

  $scope.teamData = $scope.tab.data.teamData
  $scope.teamData.statsData = {}
  // $scope.assignData = function(userPk,duration){
  //   $http({
  //     method: 'GET',
  //     url: '/api/projects/getUserStats/?user='+userPk+'&duration='+duration,
  //   }).
  //   then(function(response) {
  //     $scope.teamData.statsData[userPk] = response.data
  //   })
  // }
  // $scope.fetchUserStats = function(duration){
  //   for (var i = 0; i < $scope.teamData.teamMembers.length; i++) {
  //     $scope.assignData($scope.teamData.teamMembers[i],duration)
  //   }
  // }

  $scope.form = {
    newUser: '',
    filterType: '3M',
    team : ''
  }
  $scope.$watch('form.filterType', function(newValue, oldValue) {
    $scope.fetchUserStats(newValue)
  })
  $scope.userSearch = function(query) {
    return $http.get('/api/HR/userSearch/?limit=10&username__icontains=' + query).
    then(function(response) {
      return response.data.results;
    })
  }
  $scope.getUsrName = function(u) {
    if (typeof u == 'undefined' || u == null || u.username == null || typeof u.first_name == 'undefined') {
      return '';
    }
    return '@ ' + u.first_name + '  ' + u.last_name;
  }


  $scope.teamSearch = function(query) {
    return $http.get('/api/HR/team/?limit=10&title__icontains=' + query).
    then(function(response) {
      return response.data.results;
    })
  }
  $scope.getTeamName = function(u) {
    if (typeof u == 'undefined' || u == null || u.title == null) {
      return '';
    }
    return  u.title + ' - ' + u.teamMembers.length + ' Team members';
  }


  $scope.addTeam = function() {

    if (typeof $scope.form.team != 'object' || $scope.form.team.pk == undefined) {
      Flash.create('warning', 'Please Select A Valid Team');
      return
    }


    console.log( $scope.teamData);
    $http({method : 'POST' , url : '/api/HR/assignTeamToTeam/' , data : {members : $scope.form.team.teamMembers , team : $scope.teamData.pk} }   ).
    then(function(response) {
      for (var i = 0; i < $scope.form.team.teamMembers.length; i++) {
          $scope.assignData($scope.form.team.teamMembers[i],$scope.form.filterType)
          $scope.teamData.teamMembers.push($scope.form.team.teamMembers[i])
      }
      Flash.create('success' , 'All team members copied')
      $scope.form.team = '';
    })


  }

  $scope.addUser = function(u) {
    console.log($scope.form.newUser);

    if (typeof $scope.form.newUser != 'object' || $scope.form.newUser.pk == undefined) {
      Flash.create('warning', 'Please Select A Valid User');
      return
    }
    if ($scope.teamData.teamMembers.indexOf($scope.form.newUser.pk) >= 0) {
      Flash.create('warning', 'User Has Already In The Team');
      return
    }
    if ($scope.form.newUser.designation) {
      $http({
        method: 'PATCH',
        url: '/api/HR/designation/' + $scope.form.newUser.designation + '/',
        data: {
          team: $scope.teamData.pk,
          addOne: true
        }
      }).
      then(function(response) {
        Flash.create('success', 'Added');
        $scope.assignData($scope.form.newUser.pk,$scope.form.filterType)
        $scope.teamData.teamMembers.push($scope.form.newUser.pk)
        $scope.form.newUser = ''
      });
    } else {
      Flash.create('warning', "User Doesn't Have Designation Object");
      return
    }
  }

  $scope.deleteUser = function(pk, idx) {
    console.log(pk, idx);
    $scope.user = $users.get(pk)
    console.log($scope.user)
    $http({
      method: 'PATCH',
      url: '/api/HR/designation/' + $scope.user.designation + '/',
      data: {
        team: $scope.teamData.pk,
        deleteTeam: true
      }
    }).
    then(function(response) {
      Flash.create('success', 'Deleted');
      console.log(idx, $scope.teamData.teamMembers);
      $scope.teamData.teamMembers.splice(idx, 1)
    });
  }

})

app.controller('app.team.createForm', function($scope, $http, $aside, $state, Flash, $users, $filter, $permissions, $uibModal, $stateParams) {
  $scope.Reporting = function(query) {
    return $http.get('/api/HR/userSearch/?limit=10&username__icontains=' + query).
    then(function(response) {
      return response.data.results;
    })
  };
  $scope.getUsrName = function(u) {
    if (typeof u == 'undefined' || u == null || u.username == null || typeof u.first_name == 'undefined') {
      return '';
    }
    return '@ ' + u.first_name + '  ' + u.last_name;
  }
  $scope.form = {
    team: '',
    manager: '',
  }


  $scope.saveTeam = function() {
    if ($scope.form.team==null||$scope.form.team.length==0) {
      Flash.create('danger', 'Title Is Required');
      return
    }
    if (typeof $scope.form.manager != 'object' || $scope.form.manager.pk == undefined) {
      Flash.create('warning', 'Please Select A Manager');
      return
    }
    $http({
      method: 'POST',
      url: '/api/HR/team/',
      data: {
        title: $scope.form.team,
        manager: $scope.form.manager.pk,
      },
    }).
    then(function(response) {
      Flash.create('success', 'Saved Team SuccessFully');
      $scope.form = {
        team: '',
        manager: '',
      }
      $scope.$broadcast('forceRefetch', {});
    })
  }
})
