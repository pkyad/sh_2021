app.controller('admin.manageUsers.mailAccount', function($scope, $http) {
  $scope.generateMailPasskey = function() {
    console.log($scope);
    console.log($scope.data);
    $http({
      method: 'PATCH',
      url: '/api/mail/account/' + $scope.data.mailAccount.pk + '/?user=' + $scope.data.mailAccount.user
    }).
    then(function(response) {
      $scope.data.mailAccount = response.data;
    });
  }
});

app.controller('sudo.manageUsers.explore', function($scope, $http, $aside, $state, Flash, $users, $filter, $timeout) {

  $scope.data = $scope.tab.data;
  console.log($scope.data);



  $http({
    method: 'GET',
    url: '/api/HR/payroll/?user=' + $scope.data.userPK
  }).
  then(function(response) {
    $scope.payroll = response.data[0];
    console.log($scope.payroll);
  })

  $http({
    method: 'GET',
    url: '/api/HR/designation/?user=' + $scope.data.userPK
  }).
  then(function(response) {
    $scope.designation = response.data[0];
    console.log($scope.designation);


    if (typeof $scope.designation.division == 'number') {
      $http({
        method: 'GET',
        url: '/api/organization/divisions/' + $scope.designation.division + '/'
      }).
      then(function(response) {
        $scope.designation.division = response.data;
      })
    }

    if (typeof $scope.designation.unit == 'number') {
      $http({
        method: 'GET',
        url: '/api/organization/unit/' + $scope.designation.unit + '/'
      }).
      then(function(response) {
        $scope.designation.unit = response.data;
      })

    }

  })

});

app.controller('sudo.manageUsers.editPayroll', function($scope, $http, Flash, $users) {
  $scope.user = $users.get($scope.tab.data.user);

  $scope.form = $scope.tab.data;

  $scope.save = function() {
    console.log('AAAAAAAAAA');
    // make patch request
    var f = $scope.form;
    dataToSend = {
      // user: f.pk,
      hra: f.hra,
      special: f.special,
      lta: f.lta,
      basic: f.basic,
      taxSlab: f.taxSlab,
      adHoc: f.adHoc,
      policyNumber: f.policyNumber,
      provider: f.provider,
      amount: f.amount,
      noticePeriodRecovery: f.noticePeriodRecovery,
      notice: f.notice,
      probation: f.probation,
      probationNotice: f.probationNotice,
      al: f.al,
      ml: f.ml,
      adHocLeaves: f.adHocLeaves,
      off: f.off,
      accountNumber: f.accountNumber,
      ifscCode: f.ifscCode,
      bankName: f.bankName,
      deboarded: f.deboarded,
      PFUan: f.PFUan,
      pan: f.pan,
      pfAccNo: f.pfAccNo,
      pfUniNo: f.pfUniNo,
      pfAmnt: f.pfAmnt,
      esic: f.esic

    }

    if (f.joiningDate != null && typeof f.joiningDate == 'object') {
      dataToSend.joiningDate = f.joiningDate.toJSON().split('T')[0]
    }

    // if (typeof f.lastWorkingDate == 'object') {
    //   dataToSend.lastWorkingDate = f.lastWorkingDate.toJSON().split('T')[0]
    // } else {
    //   dataToSend.lastWorkingDate = f.lastWorkingDate
    // }
    if (f.lastWorkingDate != null && typeof f.lastWorkingDate == 'object') {
      dataToSend.lastWorkingDate = f.lastWorkingDate.toJSON().split('T')[0]
    }


    $http({
      method: 'PATCH',
      url: '/api/HR/payroll/' + f.pk + '/',
      data: dataToSend
    }).
    then(function(response) {

      // $scope.data.pk=response.data.pk

      Flash.create('success', response.status + ' : ' + response.statusText);
      // }, function(response){
      //    Flash.create('danger', response.status + ' : ' + response.statusText);
    }, function(err) {

    })



  }




});

app.controller('sudo.manageUsers.editDesignation', function($scope, $http, Flash, $users, $uibModal) {
  // $scope.user = $users.get($scope.tab.data.user);

  $scope.divisionSearch = function(query) {
    return $http.get('/api/organization/divisions/?name__contains=' + query).
    then(function(response) {
      console.log('@', response.data);
      return response.data;
    })
  };

  $scope.unitSearch = function(query) {
    // console.log('************',query);
    return $http.get('/api/organization/unit/?name__contains=' + query).
    then(function(response) {
      console.log('@', response.data)
      return response.data;
    })
  };

  $scope.depSearch = function(query) {
    // console.log('************',query);
    return $http.get('/api/organization/departments/?name__contains=' + query).
    then(function(response) {
      console.log('@', response.data)
      return response.data;
    })
  };

  $scope.roleSearch = function(query) {
    // console.log('************',query);
    return $http.get('/api/organization/role/?name__contains=' + query).
    then(function(response) {
      console.log('@', response.data)
      return response.data;
    })
  };

$scope.sallarySearch = function(query) {
  // console.log('************',query);
  return $http.get('/api/HR/salaryGrade/?title__icontains=' + query).
  then(function(response) {
    console.log('@', response.data)
    return response.data;
  })
};

  $scope.form = $scope.tab.data;
  $scope.form.teamPksList = []
  $scope.form.teamPk = ''
  for (var i = 0; i < $scope.form.team.length; i++) {
    $scope.form.teamPksList.push($scope.form.team[i].pk)
  }

  if (typeof $scope.form.reportingTo == 'number') {
    $scope.form.reportingTo = $users.get($scope.form.reportingTo);
  }

  if (typeof $scope.form.hrApprover == 'number') {
    $scope.form.hrApprover = $users.get($scope.form.hrApprover);
  }

  if (typeof $scope.form.secondaryApprover == 'number') {
    $scope.form.secondaryApprover = $users.get($scope.form.secondaryApprover);
  }

  if (typeof $scope.form.primaryApprover == 'number') {
    $scope.form.primaryApprover = $users.get($scope.form.primaryApprover);
  }
  if (typeof $scope.form.division == 'number') {
    $http({
      method: 'GET',
      url: '/api/organization/divisions/' + $scope.form.division + '/'
    }).
    then(function(response) {
      $scope.form.division = response.data;
    })
  }

  if (typeof $scope.form.unit == 'number') {
    $http({
      method: 'GET',
      url: '/api/organization/unit/' + $scope.form.unit + '/'
    }).
    then(function(response) {
      $scope.form.unit = response.data;
    })
  }

  if (typeof $scope.form.department == 'number') {
    $http({
      method: 'GET',
      url: '/api/organization/departments/' + $scope.form.department + '/'
    }).
    then(function(response) {
      $scope.form.department = response.data;
    })
  }

  if (typeof $scope.form.role == 'number') {
    $http({
      method: 'GET',
      url: '/api/organization/role/' + $scope.form.role + '/'
    }).
    then(function(response) {
      $scope.form.role = response.data;
    })
  }





  console.log('pppppppppppppppppppp', $scope.tab.data);
  $scope.save = function() {
    console.log("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA");
    // make patch request
    var f = $scope.form;
    console.log(f);
    dataToSend = {
      // user: f.pk,
      // reportingTo: f.reportingTo.pk,
      // primaryApprover: f.primaryApprover.pk,
      // secondaryApprover: f.secondaryApprover.pk,
      // division: f.division.pk,
      // unit: f.unit.pk,
      // department: f.department.pk,
      // role: f.role.pk

    }
    if (f.reportingTo != null && typeof f.reportingTo == 'object') {
      dataToSend.reportingTo = f.reportingTo.pk
    }
    if (f.hrApprover != null && typeof f.hrApprover == 'object') {
      dataToSend.hrApprover = f.hrApprover.pk
    }
    if (f.primaryApprover != null && typeof f.primaryApprover == 'object') {
      dataToSend.primaryApprover = f.primaryApprover.pk
    }
    if (f.secondaryApprover != null && typeof f.secondaryApprover == 'object') {
      dataToSend.secondaryApprover = f.secondaryApprover.pk
    }
    if (f.division != null && typeof f.division == 'object') {
      dataToSend.division = f.division.pk
    }
    if (f.unit != null && typeof f.unit == 'object') {
      dataToSend.unit = f.unit.pk
    }
    if (f.department != null && typeof f.department == 'object') {
      dataToSend.department = f.department.pk
    }
    if (f.role != null && typeof f.role == 'object') {
      dataToSend.role = f.role.pk
    }
    if (f.salaryGrade != null && typeof f.salaryGrade == 'object') {
      dataToSend.salaryGrade = f.salaryGrade.pk
    }
    dataToSend.team = f.teamPksList
    console.log(dataToSend);
    $http({
      method: 'PATCH',
      url: '/api/HR/designation/' + f.pk + '/',
      data: dataToSend
    }).
    then(function(response) {

      // $scope.form.pk = response.data.pk;
      Flash.create('success', response.status + ' : ' + response.statusText);
    }, function(err) {})
  }



  // Kra controller
  $scope.kraForm = {
    responsibility: '',
    target: 0,
    period: 'yearly',
    KRAs: []
  }

  $scope.resetForm = function() {
    $scope.kraForm.responsibility = '';
    $scope.kraForm.target = 0;
    $scope.kraForm.period = 'yearly';
  }

  $http({
    method: 'GET',
    url: '/api/organization/KRA/?user=' + $scope.form.userPK
  }).
  then(function(response) {
    $scope.kraForm.KRAs = response.data;
  })


  $scope.responsibilitySearch = function(query) {
    return $http.get('/api/organization/responsibility/?title__contains=' + query).
    then(function(response) {
      return response.data;
    })
  }

  $scope.saveKra = function() {

    var f = $scope.kraForm;

    if (f.responsibility == null || f.responsibility.length == 0) {
      Flash.create('warning', 'Responsibility Is required');
      return
    }
    if (f.target == null || f.target.length == 0) {
      Flash.create('warning', 'Target Is required');
      return
    }
    var toSend = {
      target: f.target,
      period: f.period,
      user: $scope.form.userPK
    }
    if (typeof f.responsibility == 'object') {
      toSend.responsibility = f.responsibility.pk
    }

    var method = 'POST';
    var url = '/api/organization/KRA/';
    if (typeof f.pk != 'undefined') {
      method = 'PATCH';
      url += f.pk + '/';
    }
    console.log(toSend);

    $http({
      method: method,
      url: url,
      data: toSend
    }).
    then(function(response) {
      Flash.create('success', 'Saved');
      $scope.kraForm.KRAs.push(response.data);
      $scope.resetForm();
      if ($scope.kraForm.pk) {
        delete $scope.kraForm.pk
      }

    }, function(err) {
      Flash.create('danger', 'Already assigned , Please edit if required');
    });


  }

  $scope.saveWeightage = function() {
    var a = 0
    for (var i = 0; i < $scope.kraForm.KRAs.length; i++) {
      console.log($scope.kraForm.KRAs[i].weightage, typeof $scope.kraForm.KRAs[i].weightage);
      a = a + $scope.kraForm.KRAs[i].weightage
    }
    console.log(a);
    if (a > 100) {
      Flash.create('warning', 'Sum should be lessthan 100');
      return
    } else {
      for (var i = 0; i < $scope.kraForm.KRAs.length; i++) {
        console.log('weighttttttttttttt', $scope.kraForm.KRAs[i].weightage);
        var toSend = {
          target: $scope.kraForm.KRAs[i].target,
          period: $scope.kraForm.KRAs[i].period,
          weightage: $scope.kraForm.KRAs[i].weightage
        }
        $http({
          method: 'PATCH',
          url: '/api/organization/KRA/' + $scope.kraForm.KRAs[i].pk + '/',
          data: toSend
        }).
        then(function(response) {
          Flash.create('success', 'Saved');
        });
      }
    }
  }

  $scope.deleteKRA = function(indx) {
    $http({
      method: 'DELETE',
      url: '/api/organization/KRA/' + $scope.kraForm.KRAs[indx].pk
    }).
    then((function(indx) {
      return function(response) {
        $scope.kraForm.KRAs.splice(indx, 1);
        Flash.create('danger', 'Removed');
      }
    })(indx))
  }

  $scope.editKRA = function(indx) {
    $scope.kraForm.responsibility = $scope.kraForm.KRAs[indx].responsibility;
    $scope.kraForm.target = $scope.kraForm.KRAs[indx].target;
    $scope.kraForm.period = $scope.kraForm.KRAs[indx].period;
    $scope.kraForm.pk = $scope.kraForm.KRAs[indx].pk;
    $scope.kraForm.KRAs.splice(indx, 1);
  }



  // $scope.showCreateTeamBtn = false;
  // $scope.TeamExist = false;
  $scope.me = $users.get('mySelf');

  $scope.teamSearch = function(query) {
    return $http.get('/api/HR/team/?title__icontains=' + query).
    then(function(response) {
      return response.data;
    })
  };
  $scope.addTeam = function() {
    if (typeof $scope.form.teamPk == 'object' || $scope.form.teamPk.pk) {
      if ($scope.form.teamPksList.indexOf($scope.form.teamPk.pk)>=0) {
        Flash.create('danger', 'Already Exist');
        return
      }else {
        $scope.form.teamPksList.push($scope.form.teamPk.pk)
        $scope.form.team.push($scope.form.teamPk)
        $scope.form.teamPk = ''
      }
    }else {
      Flash.create('danger', 'Please Add Valid Team Object');
      return
    }
  }
  $scope.removeTeam = function(idx) {
    $scope.form.teamPksList.splice(idx,1)
    $scope.form.team.splice(idx,1)
  }

  $scope.openCreateTeam = function() {
    $uibModal.open({
      templateUrl: '/static/ngTemplates/app.HR.form.createTeam.html',
      size: 'md',
      backdrop: true,
      resolve: {
        data: function() {
          return $scope.form.teamPk;
        }
      },
      controller: function($scope, data, $uibModalInstance) {
        $scope.Reporting = function(query) {
          return $http.get('/api/HR/users/?username__contains=' + query).
          then(function(response) {
            console.log('@', response.data)
            return response.data;
          })
        };
        if (data.pk) {
          $scope.form = {
            team: data.title,
            manager: data.manager,
          }
        } else {
          $scope.form = {
            team: data,
            manager: '',
          }
        }

        console.log(data);
        $scope.saveTeam = function() {
          if (data.pk) {
            console.log(data.pk);
            var Method = 'PATCH';
            var Url = '/api/HR/team/' + data.pk + '/';
          } else {
            var Method = 'POST';
            var Url = '/api/HR/team/';
          }
          var toSend = {
            title: $scope.form.team,
            manager: $scope.form.manager.pk,
          }
          $http({
            method:Method ,
            url: Url,
            data: toSend,
          }).
          then(function(response) {
            $uibModalInstance.dismiss(response.data);
            $scope.form.team = response.data.title;
            Flash.create('success', 'Saved Team SuccessFully');
          })
        }
      }
    }).result.then(function(f) {

    }, function(f) {
      if (typeof f == 'object') {
        $scope.form.teamPk = f
      }
    });
  }



});



app.controller('sudo.admin.editProfile', function($scope, $http, $aside, $state, Flash, $users, $filter, $timeout) {

  $scope.page = 1;
  $scope.maxPage = 3;
  console.log($scope.tab);

  $scope.data = $scope.tab.data;
  if ($scope.data.emergency != null) {
    $scope.data.emergencyName = $scope.data.emergency.split('::')[0]
    $scope.data.emergencyNumber = $scope.data.emergency.split('::')[1]
  }
  $scope.next = function() {
    console.log("came to next");
    if ($scope.page < $scope.maxPage) {
      $scope.page += 1;
    }
  }

  $scope.prev = function() {
    if ($scope.page > 1) {
      $scope.page -= 1;
    }
  }

  $scope.saveFirstPage = function() {
    var prof = $scope.data;

    console.log($scope.data);

    if (prof.sameAsLocal == true) {
      prof.permanentAddressStreet = prof.localAddressStreet
      prof.permanentAddressCity = prof.localAddressCity
      prof.permanentAddressPin = prof.localAddressPin
      prof.permanentAddressState = prof.localAddressState
      prof.permanentAddressCountry = prof.prof.localAddressCountry
    }

    var dataToSend = {
      empID: prof.empID,
      empType: prof.empType,
      prefix: prof.prefix,
      // dateOfBirth: prof.dateOfBirth.toJSON().split('T')[0],

      gender: prof.gender,
      permanentAddressStreet: prof.permanentAddressStreet,
      permanentAddressCity: prof.permanentAddressCity,
      permanentAddressPin: prof.permanentAddressPin,
      permanentAddressState: prof.permanentAddressState,
      permanentAddressCountry: prof.permanentAddressCountry,
      sameAsLocal: prof.sameAsLocal,
      // sameAsShipping: prof.sameAsShipping,
      localAddressStreet: prof.localAddressStreet,
      localAddressCity: prof.localAddressCity,
      localAddressPin: prof.localAddressPin,
      localAddressState: prof.localAddressState,
      localAddressCountry: prof.localAddressCountry,
      email: prof.email,
      mobile: prof.mobile,
      emergency: prof.emergencyName + '::' + prof.emergencyNumber,
      bloodGroup: prof.bloodGroup,
    }
    if (prof.married) {
      dataToSend.married = prof.married;
      // dataToSend.anivarsary = prof.anivarsary.toJSON().split('T')[0]
      if (typeof prof.anivarsary == 'object') {
        dataToSend.anivarsary = prof.anivarsary.toJSON().split('T')[0]
      } else {
        dataToSend.anivarsary = prof.anivarsary
      }
    }

    if (typeof prof.dateOfBirth == 'object') {
      dataToSend.dateOfBirth = prof.dateOfBirth.toJSON().split('T')[0]
    } else {
      dataToSend.dateOfBirth = prof.dateOfBirth
    }

    $http({
      method: 'PATCH',
      url: '/api/HR/profileAdminMode/' + prof.pk + '/',
      data: dataToSend
    }).
    then(function(response) {
      Flash.create('success', "Saved");
    })
  }

  $scope.saveSecondPage = function() {


    var f = $scope.data;
    var dataToSend = {
      website: f.website,
      almaMater: f.almaMater,
      pgUniversity: f.pgUniversity,
      docUniversity: f.docUniversity,
      fathersName: f.fathersName,
      mothersName: f.mothersName,
      wifesName: f.wifesName,
      childCSV: f.childCSV,
      note1: f.note1,
      note2: f.note2,
      note3: f.note3,
    }

    $http({
      method: 'PATCH',
      url: '/api/HR/profileAdminMode/' + f.pk + '/',
      data: dataToSend
    }).
    then(function(response) {
      Flash.create('success', "Saved");
    })

  }

  $scope.files = {
    "displayPicture": emptyFile,
    'TNCandBond': emptyFile,
    'resume': emptyFile,
    'certificates': emptyFile,
    'transcripts': emptyFile,
    'otherDocs': emptyFile,
    'resignation': emptyFile,
    'vehicleRegistration': emptyFile,
    'appointmentAcceptance': emptyFile,
    'pan': emptyFile,
    'drivingLicense': emptyFile,
    'cheque': emptyFile,
    'passbook': emptyFile,
    'sign': emptyFile,
    'IDPhoto': emptyFile

  }

  $scope.saveFiles = function() {
    var f = $scope.files;
    var fd = new FormData();

    var fileFields = ['displayPicture', 'TNCandBond', 'resume', 'certificates', 'transcripts', 'otherDocs', 'resignation', 'vehicleRegistration', 'appointmentAcceptance', 'pan', 'drivingLicense', 'cheque', 'passbook', 'sign', 'IDPhoto']
    for (var i = 0; i < fileFields.length; i++) {
      if ($scope.files[fileFields[i]] != emptyFile) {
        fd.append(fileFields[i], $scope.files[fileFields[i]])
      }
    }

    $http({
      method: 'PATCH',
      url: '/api/HR/profileAdminMode/' + $scope.data.pk + '/',
      data: fd,
      transformRequest: angular.identity,
      headers: {
        'Content-Type': undefined
      }
    }).
    then(function(response) {
      console.log(response);
      Flash.create('success', "Saved");

    })
  }

  $scope.save = function() {
    if ($scope.page == 1) {
      $scope.saveFirstPage();
    } else if ($scope.page == 2) {
      $scope.saveSecondPage();
    } else {
      $scope.saveFiles();
    }
  }

});




app.controller('admin.manageUsers', function($scope, $http, $aside, $state, Flash, $users, $filter,$uibModal) {

  // var views = [{name : 'table' , icon : 'fa-bars' , template : '/static/ngTemplates/genericTable/tableDefault.html'},
  //     {name : 'thumbnail' , icon : 'fa-th-large' , template : '/static/ngTemplates/empSearch/tableThumbnail.html'},
  //     {name : 'icon' , icon : 'fa-th' , template : '/static/ngTemplates/empSearch/tableIcon.html'},
  //     {name : 'graph' , icon : 'fa-pie-chart' , template : '/static/ngTemplates/empSearch/tableGraph.html'}
  //   ];

  var views = [{
      name: 'table',
      icon: 'fa-bars',
      template: '/static/ngTemplates/genericTable/genericSearchList.html',
      itemTemplate: '/static/ngTemplates/app.HR.manage.users.items.html'
    },
    // {name : 'thumbnail' , icon : 'fa-th-large' , template : '/static/ngTemplates/empSearch/tableThumbnail.html'},
    // {name : 'icon' , icon : 'fa-th' , template : '/static/ngTemplates/empSearch/tableIcon.html'},
    // {name : 'graph' , icon : 'fa-pie-chart' , template : '/static/ngTemplates/empSearch/tableGraph.html'}
  ];

  var options = {
    main: {
      icon: 'fa-envelope-o',
      text: 'im'
    },
    others: [{
        icon: '',
        text: 'social'
      },
      {
        icon: '',
        text: 'editProfile'
      },
      {
        icon: '',
        text: 'editDesignation'
      },
      {
        icon: '',
        text: 'editPermissions'
      },
      {
        icon: '',
        text: 'editMaster'
      },
      {
        icon: '',
        text: 'editPayroll'
      },
      {
        icon: '',
        text: 'viewProfile'
      },
    ]
  };

  var multiselectOptions = [{
    icon: 'fa fa-download',
    text: 'PerformanceReport'
  },{
    icon: 'fa fa-user',
    text: 'BulkAssign'
  },{
    icon: 'fa fa-users',
    text: 'BulkUpload'
  }];

  $scope.config = {
    url: '/api/HR/users/',
    views: views,
    options: options,
    itemsNumPerView: [12, 24, 48],
    multiselectOptions: multiselectOptions,
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




  // create new user
  $scope.newUser = {
    username: '',
    firstName: '',
    lastName: '',
    password: ''
  };
  $scope.createUser = function() {
    dataToSend = {
      username: $scope.newUser.username,
      first_name: $scope.newUser.firstName,
      last_name: $scope.newUser.lastName,
      password: $scope.newUser.password
    };
    $http({
      method: 'POST',
      url: '/api/HR/usersAdminMode/',
      data: dataToSend
    }).
    then(function(response) {
      Flash.create('success', response.status + ' : ' + response.statusText);
      $scope.newUser = {
        username: '',
        firstName: '',
        lastName: '',
        password: ''
      };
    }, function(response) {
      Flash.create('danger', response.status + ' : ' + response.statusText);
    });
  }


  $scope.tableAction = function(target, action, mode) {
    // target is the url of the object
    if (typeof mode == 'undefined') {
      if (action == 'im') {
        $scope.$parent.$parent.addIMWindow(target);
      } else if (action == 'editProfile') {
        for (var i = 0; i < $scope.data.tableData.length; i++) {
          if ($scope.data.tableData[i].pk == target) {
            u = $users.get(target)
            $http.get('/api/HR/profileAdminMode/' + $scope.data.tableData[i].profile.pk + '/').
            success((function(target) {
              return function(response) {
                u = $users.get(target)
                console.log("will add tab profile : ");
                console.log(response);
                $scope.addTab({
                  title: 'Edit Profile for ' + u.first_name + ' ' + u.last_name,
                  cancel: true,
                  app: 'editProfile',
                  data: response,
                  active: true
                })

                console.log($scope.tabs);
              }
            })(target));
          }
        }

      } else if (action == 'social') {
        $state.go('home.social', {
          id: target
        })
      } else if (action == 'editMaster') {
        console.log(target);
        $http({
          method: 'GET',
          url: '/api/HR/usersAdminMode/' + target + '/'
        }).
        then(function(response) {
          $scope.addTab({
            title: 'Edit master data  for ' + response.data.first_name + ' ' + response.data.last_name,
            cancel: true,
            app: 'editMaster',
            data: response.data,
            active: true
          })
        })
      } else if (action == 'editPermissions') {
        u = $users.get(target)
        $http.get('/api/ERP/application/?user=' + u.username).
        success((function(target) {
          return function(data) {
            u = $users.get(target)
            permissionsFormData = {
              appsToAdd: data,
              url: target,
            }
            $scope.addTab({
              title: 'Edit permissions for ' + u.first_name + ' ' + u.last_name,
              cancel: true,
              app: 'editPermissions',
              data: permissionsFormData,
              active: true
            })
          }
        })(target));
      } else if (action == 'viewProfile') {
        for (var i = 0; i < $scope.data.tableData.length; i++) {
          if ($scope.data.tableData[i].pk == target) {
            u = $users.get(target)
            $http.get('/api/HR/profileAdminMode/' + $scope.data.tableData[i].profile.pk + '/').
            success((function(target) {
              return function(response) {
                response.userPK = target;
                u = $users.get(target)
                console.log("will add tab profile : ");
                console.log(response);
                $scope.addTab({
                  title: 'Profile for ' + u.first_name + ' ' + u.last_name,
                  cancel: true,
                  app: 'viewProfile',
                  data: response,
                  active: true
                })

                console.log($scope.tabs);
              }
            })(target));
          }
        }
      } else if (action == 'editDesignation') {
        for (var i = 0; i < $scope.data.tableData.length; i++) {
          if ($scope.data.tableData[i].pk == target) {
            u = $users.get(target)
            $http.get('/api/HR/designation/' + $scope.data.tableData[i].designation + '/').
            success((function(target) {
              return function(response) {
                response.userPK = target;
                // console.log(target);
                u = $users.get(target)
                console.log("will add tab profile : ");
                console.log(response);
                $scope.addTab({
                  title: 'Edit Designation for ' + u.first_name + ' ' + u.last_name,
                  cancel: true,
                  app: 'editDesignation',
                  data: response,
                  active: true
                })

                console.log($scope.tabs);
              }
            })(target));
          }
        }
      } else if (action == 'editPayroll') {
        for (var i = 0; i < $scope.data.tableData.length; i++) {
          if ($scope.data.tableData[i].pk == target) {
            u = $users.get(target)
            $http.get('/api/HR/payroll/' + $scope.data.tableData[i].payroll.pk + '/').
            success((function(target) {
              return function(response) {
                u = $users.get(target)
                console.log("will add tab payroll : ");
                console.log(response);
                $scope.addTab({
                  title: 'Edit payroll for ' + u.first_name + ' ' + u.last_name,
                  cancel: true,
                  app: 'editPayroll',
                  data: response,
                  active: true
                })

                console.log($scope.tabs);

              }
            })(target));
          }
        }
      }
      // for the single select actions
    } else {
      if (mode == 'multi') {
        if (action == 'PerformanceReport') {
          $uibModal.open({
            templateUrl: '/static/ngTemplates/app.HR.performanceReport.html',
            size: 'lg',
            backdrop: true,
            controller: 'HR.performanceReport'
          }).result.then(function() {
          }, function() {
          });
          // window.open('/api/projects/downloadPerformanceReport/', '_blank');
        }else if (action == 'BulkAssign') {
          console.log('bulk assignnnnnnnnnn');
          $aside.open({
            templateUrl: '/static/ngTemplates/app.HR.bulkAssign.html',
            placement: 'right',
            size: 'xl',
            backdrop: true,
            resolve: {
              teamsData: function() {
                return $scope.teamsData;
              },
              usersData: function() {
                return $scope.usersData;
              }
            },
            controller: function($scope , teamsData,usersData,$uibModalInstance,$rootScope){
              $scope.teamsData = JSON.parse(JSON.stringify(teamsData))
              $scope.usersData = usersData
              $scope.close = function() {
                $uibModalInstance.close();
              }
              if ($scope.teamsData.length>0) {
                $scope.form = {allSelected:false,team:JSON.stringify($scope.teamsData[0])}
              }
              $scope.selectAll = function() {
                for (var i = 0; i < $scope.usersData.length; i++) {
                  $scope.usersData[i].selected = $scope.form.allSelected;
                }
              }
              $scope.deleteTeam = function(desgPk,teamPk,teamIdx,userObj){
                console.log(desgPk,teamPk,teamIdx);
                $http({
                  method: 'PATCH',
                  url: '/api/HR/designation/' + desgPk + '/',
                  data: {
                    team: teamPk,
                    deleteTeam: true
                  }
                }).
                then(function(response) {
                  Flash.create('success', 'Deleted');
                  userObj.teams.splice(teamIdx,1)
                });
              }
              $scope.assign = function(){
                console.log('asignnnnnnnnnn');
                $scope.newTeam = {pk: JSON.parse($scope.form.team).pk,title: JSON.parse($scope.form.team).title}
                $scope.postData = []
                $scope.indexData = []
                for (var i = 0; i < $scope.usersData.length; i++) {
                  if ($scope.usersData[i].selected) {
                    var obj = $scope.usersData[i].teams.find(o => o.pk === JSON.parse($scope.form.team).pk);
                    if (typeof obj == 'undefined') {
                      $scope.postData.push({designation:$scope.usersData[i].designation,team:JSON.parse($scope.form.team).pk})
                      $scope.indexData.push(i)
                    }
                  }
                }
                if ($scope.postData.length>0) {
                  console.log($scope.postData,$scope.indexData);
                  $http({
                    method: 'POST',
                    url: '/api/HR/bulkAssign/',
                    data: {
                      postData: $scope.postData,
                    }
                  }).
                  then(function(response) {
                    Flash.create('success', 'Saved');
                    for (var i = 0; i < $scope.usersData.length; i++) {
                      if ($scope.indexData.indexOf(i)>=0) {
                        $scope.usersData[i].teams.push($scope.newTeam)
                      }
                    }
                  });
                }
              }

            },
          }).result.then(function() {
          }, function() {
          });
        }else if (action == 'BulkUpload') {
          console.log('bulk uploadddddd');
          $uibModal.open({
            templateUrl: '/static/ngTemplates/app.HR.bulkUpload.html',
            size: 'md',
            backdrop: true,
            controller: function($scope, $uibModalInstance, $timeout){
              $scope.form = {xlFile:emptyFile,uploadingMsg:false}
              $scope.upload = function(){
                if ($scope.form.xlFile == emptyFile) {
                  Flash.create('warning', 'Please Select Proper Excel File')
                  return
                }
                $scope.form.uploadingMsg = true
                var fd = new FormData()
                fd.append('dataFile', $scope.form.xlFile);
                $http({
                  method: 'POST',
                  url: '/api/HR/bulkUpload/',
                  data: fd,
                  transformRequest: angular.identity,
                  headers: {
                    'Content-Type': undefined
                  }
                }).
                then(function(response) {
                  $scope.form = {xlFile:emptyFile,uploadingMsg:false}
                  console.log(response.data);
                  $uibModalInstance.dismiss('success');

                }, function(err) {
                  $scope.form.uploadingMsg = false
                  Flash.create('danger', 'Error While Creation');
                })
              }

            },
          }).result.then(function() {
          }, function(data) {
          });
        }
      }
    }
  }
  $scope.teamsData = []
  $http({
    method: 'GET',
    url: '/api/HR/team/',
  }).
  then(function(response) {
    $scope.teamsData = response.data
  })
  $scope.usersData = []
  $http({
    method: 'GET',
    url: '/api/HR/users/',
  }).
  then(function(response) {
    $scope.usersData = response.data
  })

  $scope.updateUserPermissions = function(index) {
    var userData = $scope.tabs[index].data;
    if (userData.appsToAdd.length == 0) {
      Flash.create('warning', 'No new permission to add')
      return;
    }
    var apps = [];
    for (var i = 0; i < userData.appsToAdd.length; i++) {
      apps.push(userData.appsToAdd[i].pk)
    }
    var dataToSend = {
      user: getPK(userData.url),
      apps: apps,
    }
    $http({
      method: 'POST',
      url: '/api/ERP/permission/',
      data: dataToSend
    }).
    then(function(response) {
      Flash.create('success', response.status + ' : ' + response.statusText);
    }, function(response) {
      Flash.create('danger', response.status + ' : ' + response.statusText);
    })

  }

  $scope.getPermissionSuggestions = function(query) {
    return $http.get('/api/ERP/application/?name__contains=' + query)
  }

  $scope.updateProfile = function(index) {
    userData = $scope.tabs[index].data;
    var fd = new FormData();
    for (key in userData) {
      if (key != 'url' && userData[key] != null) {
        if ($scope.profileFormStructure[key].type.indexOf('integer') != -1) {
          if (userData[key] != null) {
            fd.append(key, parseInt(userData[key]));
          }
        } else if ($scope.profileFormStructure[key].type.indexOf('date') != -1) {
          if (userData[key] != null) {
            fd.append(key, $filter('date')(userData[key], "yyyy-MM-dd"));
          }
        } else if ($scope.profileFormStructure[key].type.indexOf('url') != -1 && (userData[key] == null || userData[key] == '')) {
          // fd.append( key , 'http://localhost');
        } else {
          fd.append(key, userData[key]);
        }
      }
    }
    $http({
      method: 'PATCH',
      url: '/api/HR/profileAdminMode/' + userData.pk + '/',
      data: fd,
      transformRequest: angular.identity,
      headers: {
        'Content-Type': undefined
      }
    }).
    then(function(response) {
      Flash.create('success', response.status + ' : ' + response.statusText);
    }, function(response) {
      Flash.create('danger', response.status + ' : ' + response.statusText);
    });
  };

  $scope.updateUserMasterDetails = function(index) {
    var userData = $scope.tabs[index].data;
    dataToSend = {
      username: userData.username,
      last_name: userData.last_name,
      first_name: userData.first_name,
      is_staff: userData.is_staff,
      is_active: userData.is_active,
    }
    if (userData.password != '') {
      dataToSend.password = userData.password
    }
    $http({
      method: 'PATCH',
      url: userData.url.replace('users', 'usersAdminMode'),
      data: dataToSend
    }).
    then(function(response) {
      Flash.create('success', response.status + ' : ' + response.statusText);
    }, function(response) {
      Flash.create('danger', response.status + ' : ' + response.statusText);
    });
  }

  $scope.Reporting = function(query) {
    return $http.get('/api/HR/users/?username__contains=' + query).
    then(function(response) {
      return response.data;
    })
  };

  $scope.role = {
    selected: '',
    tabIndex: '',
  }

  $scope.$watch('tabs[role.tabIndex].data.role', function(newValue, oldValue) {
    if (typeof newValue == 'object') {
      console.log($scope.role);
      console.log($scope.tabs[$scope.role.tabIndex].data.role);
      $scope.tabs[$scope.role.tabIndex].data.appsToAdd = $scope.tabs[$scope.role.tabIndex].data.role.applications
      $scope.tabs[$scope.role.tabIndex].data.role = ''
    }
  })

  $scope.roleGroupSearch = function(query) {
  // console.log('************',query);
  return $http.get('/api/ERP/roles/?name__icontains=' + query).
  then(function(response) {
    console.log('@', response.data)
    return response.data;
  })
};
$scope.getPermissionSuggestions = function(query) {
  return $http.get('/api/ERP/application/?permission=1&name__icontains=' + query)
}
});


app.controller("app.settings.roles", function($scope, $state, $http, Flash, $permissions, $timeout) {

  // $scope.rolesPerm = false;

  // $timeout(function() {
  //   $scope.rolesPerm = $permissions.myPerms('module.roles.createDelete')
  // }, 500);

  $scope.roles = []

  $scope.Refresh = function() {
    $scope.isPermission = false
    $scope.roleForm = {
      name: '',
      applications: []
    }
  }
  $scope.Refresh()
  $http({
    method: 'GET',
    url: '/api/ERP/roles/',
  }).
  then(function(response) {
    for (var i = 0; i < response.data.length; i++) {
      response.data[i].display = false
      $scope.roles.push(response.data[i])
    }
  });


  $scope.isPermission = false
  $scope.editRole = function(r) {
    console.log(r, 'r');
    $scope.roleForm = r
    console.log($scope.roleForm);
    if ($scope.roleForm.name === 'Restricted Access Client' || $scope.roleForm.name === 'Full Access Client') {
      $scope.isPermission = true
    } else {
      $scope.isPermission = false
    }
  }


  $scope.saveRole = function() {
    var apps = [];
    for (var i = 0; i < $scope.roleForm.applications.length; i++) {
      apps.push($scope.roleForm.applications[i].pk)
    }


    if ($scope.roleForm.name != '' && $scope.roleForm.applications.length > 0) {
      if ($scope.roleForm.pk) {
        $http({
          method: 'PATCH',
          url: '/api/ERP/roles/' + $scope.roleForm.pk + '/',
          data: {
            name: $scope.roleForm.name,
            applications: apps
          }
        }).
        then(function(response) {
          response.data.display = false
          for (var i = 0; i < $scope.roles.length; i++) {
            if ($scope.roles[i].pk == response.data.pk) {
              $scope.roles[i] = response.data
            }
          }
          $scope.Refresh()
          // $scope.roleForm = {
          //   name: '',
          //   applications: []
          // }
          Flash.create('success', 'Edited Successfully')
        });
      } else {
        $http({
          method: 'POST',
          url: '/api/ERP/roles/',
          data: {
            name: $scope.roleForm.name,
            applications: apps
          }
        }).
        then(function(response) {
          response.data.display = false
          $scope.roles.push(response.data)
          $scope.Refresh()
          // $scope.roleForm = {
          //   name: '',
          //   applications: []
          // }
          Flash.create('success', 'Created Successfully')
        });
      }
    } else {
      Flash.create('warning', 'Fields can not be empty')
    }
  }


  $scope.deleteRole = function(pk, indx) {
    $http({
      method: 'DELETE',
      url: '/api/ERP/roles/' + pk + '/'
    }).
    then(function(response) {
      $scope.roles.splice(indx, 1);
      $scope.roleForm = {
        name: '',
        applications: []
      }

      Flash.create('success', 'Deleted Successfully')
    })
  }

  $scope.getPermissionSuggestions = function(query) {
    return $http.get('/api/ERP/applicationAdminMode/?name__contains=' + query)
  }


})


app.controller('sudo.salaryGrade', function($scope, $http, $aside, $state, Flash, $users, $filter, $timeout) {

  $scope.refresh = function(){
    $scope.form = {
      title:'',
      target:''
    }

  }
$scope.targetList = []

$scope.reload = function(){
  $http({
    method: 'GET',
    url: '/api/HR/salaryGrade/',
  }).
  then(function(response) {
    $scope.targetList = response.data
  });
}
$scope.reload()

$scope.SaveGrade = function(){
  if ($scope.form.pk) {
    var method = 'PATCH'
    var url = '/api/HR/salaryGrade/' + $scope.form.pk +'/'
  }
  else{
    var method = 'POST'
    var url = '/api/HR/salaryGrade/'
  }
  $http({
    method: method,
    url: url,
    data: {
      title: $scope.form.title,
      target: $scope.form.target
    }
  }).
  then(function(response) {
    Flash.create('success', 'Created Successfully')
    $scope.targetList.push(response.data)
    $scope.refresh()
  });
}

$scope.deleteGrade = function(pk,indx){
  $http({
    method: 'DELETE',
    url: '/api/HR/salaryGrade/' + pk + '/'
  }).
  then(function(response) {
    $scope.targetList.splice(indx, 1);
    Flash.create('success', 'Deleted Successfully')
  })
}

$scope.editGrade = function(pk,indx){
  console.log("herrrrrrrrrrr");
  $scope.form =  $scope.targetList[indx]
  $scope.targetList.splice(indx, 1);
}

})

app.controller('HR.performanceReport', function($scope, $http, $aside, $state, Flash, $users, $filter, $timeout,$uibModalInstance) {




  // $http({method : 'GET' , url : '/api/HR/getPagination/' }).
  // then(function(response) {
  //   $scope.pageCount = response.data.count/80
  //   if (response.data.count%80!=0) {
  //     $scope.pageCount += 1;
  //   }
  //   $scope.pages = []
  //   for (var i = 0; i < $scope.pageCount; i++) {
  //     $scope.pages.push(i);
  //   }
  // })

  $http({method : 'GET' , url : '/api/HR/team/'}).
  then(function(response) {
    $scope.teams = response.data;
  })



  var date = new Date();
  var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  $scope.dateForm = {
    stDate : firstDay,
    edDate : date
  }
$scope.close = function(){
    $uibModalInstance.dismiss()
}

})
