app.controller('projectManagement.projects.new', function($scope, $http, $aside, $state, Flash, $users, $filter, $permissions,$stateParams) {

  $scope.ccSearch = function(query) {
    return $http.get('/api/finance/costCenter/?name__icontains=' + query).
    then(function(response) {
      return response.data;
    })
  };
  $scope.companySearch = function(query) {
    return $http.get('/api/ERP/service/?limit=10&name__icontains=' + query).
    then(function(response) {
      return response.data.results;
    })
  };

  $scope.teamSearch = function(query) {
    return $http.get('/api/HR/team/?limit=10&title__icontains=' + query).
    then(function(response) {
      return response.data.results;
    })
  }
  $scope.resetForm = function() {
    $scope.form = {
      title: '',
      dueDate: new Date(),
      costCenter: '',
      company: '',
      description: '',
      team: [],
      factor : 1,
      ldd : true ,
      coding : true,
      qaCanEdit : false,
      coderTeam:'',
      qaTeam:'',
      reCoderTeam:'',
      reQaTeam:'',
      ccTeam : '',
    };
    $scope.data = {
      files: []
    };
  };
  $scope.resetForm();
  if (typeof $stateParams.clone !== 'undefined' && $stateParams.clone !== '') {
    $http.get('/api/projects/project/' + $stateParams.clone).
    then(function(response) {
      console.log(response.data);
      $scope.form.description = response.data.description
      $scope.form.team = response.data.team
      $scope.form.factor = response.data.factor
      $scope.form.ldd = response.data.ldd
      $scope.form.coding = response.data.coding
      $scope.form.qaCanEdit = response.data.qaCanEdit
      $scope.form.coderTeam = response.data.coderTeam
      $scope.form.qaTeam = response.data.qaTeam
      $scope.form.reCoderTeam = response.data.reCoderTeam
      $scope.form.reQaTeam = response.data.reQaTeam
      $scope.form.ccTeam = response.data.ccTeam
      $scope.form.cloningProject = response.data.pk
      if (response.data.company) {
        $http.get('/api/ERP/service/' + response.data.company).
        then(function(response) {
          $scope.form.company = response.data
        })
      }
    })
  }

  $scope.postProject = function() {
    if ($scope.form.title.length==0) {
      Flash.create('warning', 'Please Select The Title');
      return;
    }
    // if ($scope.form.costCenter.length==0 || $scope.form.costCenter.pk==undefined) {
    //   Flash.create('warning', 'Please Select Proper Cost Center');
    //   return;
    // }
    if ($scope.form.company==null || $scope.form.company.length==0 || $scope.form.company.pk==undefined) {
      Flash.create('warning', 'Please Select a Company');
      return;
    }

    var dataToSend = {
      title : $scope.form.title,
      factor : $scope.form.factor,
      dueDate : $scope.form.dueDate,
      description : $scope.form.description,
      qaCanEdit : $scope.form.qaCanEdit,
      team : $scope.form.team
    };
    if ($scope.form.coding) {
      if ($scope.form.coderTeam==null || $scope.form.coderTeam.length==0 || $scope.form.coderTeam.pk==undefined) {
        Flash.create('warning', 'Please Select Proper Coder Group');
        return;
      }
      if ($scope.form.qaTeam==null || $scope.form.qaTeam.length==0 || $scope.form.qaTeam.pk==undefined) {
        Flash.create('warning', 'Please Select Proper QA Group');
        return;
      }
      if ($scope.form.reCoderTeam==null || $scope.form.reCoderTeam.length==0 || $scope.form.reCoderTeam.pk==undefined) {
        Flash.create('warning', 'Please Select Proper Re-Coder Group');
        return;
      }
      if ($scope.form.reQaTeam==null || $scope.form.reQaTeam.length==0 || $scope.form.reQaTeam.pk==undefined) {
        Flash.create('warning', 'Please Select Proper Re-QA Group');
        return;
      }
      dataToSend.coderTeam = $scope.form.coderTeam.pk;
      dataToSend.qaTeam = $scope.form.qaTeam.pk;
      dataToSend.reCoderTeam = $scope.form.reCoderTeam.pk;
      dataToSend.reQaTeam = $scope.form.reQaTeam.pk;
      dataToSend.ccTeam = $scope.form.ccTeam.pk;
    }

    if ($scope.form.cloningProject != undefined) {
      dataToSend.cloningProject = $scope.form.cloningProject;
    }


    // dataToSend.costCenter = $scope.form.costCenter.pk;
    dataToSend.company = $scope.form.company.pk;
    dataToSend.files = []
    for (var i = 0; i < $scope.data.files.length; i++) {
      dataToSend.files.push($scope.data.files[i].pk)
    }
    $http({
      method: 'POST',
      url: '/api/projects/project/',
      data: dataToSend
    }).
    then(function(response) {
      Flash.create('success', 'Project created')
      $scope.resetForm();
    });
  };

});
