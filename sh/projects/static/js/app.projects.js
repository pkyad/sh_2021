app.config(function($stateProvider) {

  $stateProvider
    .state('home.projects', {
      url: "/projects",
      views: {
        "": {
          templateUrl: '/static/ngTemplates/app.projects.html',
        },
        "menu@home.projects": {
          templateUrl: '/static/ngTemplates/app.projects.menu.html',
          controller: 'projectManagement.projects.menu',
        },
        "@home.projects": {
          templateUrl: '/static/ngTemplates/app.projects.default.html',
          controller: 'projectManagement.projects.default',
        }
      }
    })
    .state('home.projects.new', {
      url: "/new/?clone",
      templateUrl: '/static/ngTemplates/app.projects.new.html',
      controller: 'projectManagement.projects.new'
    })

    .state('home.projects.company', {
      url: "/company",
      templateUrl: '/static/ngTemplates/app.projects.company.html',
      controller: 'projectManagement.projects.company'
    })
    .state('home.projects.planner', {
      url: "/planner",
      templateUrl: '/static/ngTemplates/app.projects.planner.html',
      controller: 'projectManagement.projects.planner'
    })



});

app.controller('projectManagement.projects.project.explore', function($scope, $http, $aside, $state, Flash, $users, $filter, $permissions, $uibModal, $stateParams) {
  console.log('base.html');
  $scope.me = $users.get('mySelf');

  $scope.abbyImport = function(){
    $uibModal.open({
      templateUrl: '/static/ngTemplates/app.project.abbyImport.html',
      size: 'md',
      backdrop: true,
      resolve: {
        projectData: function() {
          return $scope.project;
        }
      },
      controller: function($scope, $uibModalInstance, $timeout,projectData){
        $scope.form = {xlFile:emptyFile,uploadingMsg:false}
        console.log(projectData);
        $scope.upload = function(){
          if ($scope.form.xlFile == emptyFile) {
            Flash.create('warning', 'Please Select Proper Excel File')
            return
          }
          if (!projectData.abbyImport) {
            Flash.create('danger', "Can't Do Abby Import For This Data")
            return
          }
          $scope.form.uploadingMsg = true
          var fd = new FormData()
          fd.append('dataFile', $scope.form.xlFile);
          fd.append('projectPk', projectData.pk);
          console.log('abby import can workkkkkkkkkkkkk');
          $http({
            method: 'POST',
            url: '/api/projects/abbyImportData/',
            data: fd,
            transformRequest: angular.identity,
            headers: {
              'Content-Type': undefined
            }
          }).
          then(function(response) {
            console.log(response.data);
            $uibModalInstance.dismiss('success');
          }, function(err) {
            $scope.form.uploadingMsg = false
            Flash.create('danger', 'Error While Creation');
          })
        }

      },
    }).result.then(function() {
    }, function() {
    });
  }

  $scope.lddUploadForm = {dir : "" , fil: emptyFile,showImg:'' };
  $scope.archiveProject = function(){
    $http({
      method : 'PATCH' ,
      url : '/api/projects/project/' + $scope.project.pk + '/' ,
      data : {archived:true,archivedUser:$scope.me.pk,archivedDt:new Date()}
    }).
    then(function(response) {
      Flash.create('success' , 'Archived Successfully')
      $scope.project.archived = response.data.archived
    })
  }
  $scope.disableProject = function(){
    $http({
      method : 'PATCH' ,
      url : '/api/projects/project/' + $scope.project.pk + '/' ,
      data : {disabled:$scope.project.disabled}
    }).
    then(function(response) {
      Flash.create('success' , 'Saved')
    })
  }
  $scope.changeProjectSatus = function(status){
    var toSend =  {status:status}

    if (status == 'coding') {
      toSend.projectStart = new Date()
    }

    $http({
      method : 'PATCH' ,
      url : '/api/projects/project/' + $scope.project.pk + '/' ,
      data :toSend
    }).
    then(function(response) {
      Flash.create('success' , 'Saved Successfully')
      $scope.project.status = response.data.status
    })
  }

  $scope.uploadLDDOutput = function() {
    $scope.project.uploadingBreakFile = true;

    if ($scope.lddUploadForm.fil == emptyFile) {
      Flash.create('warning' , 'Please select the LDD file');
      return;
    }
    if ($scope.lddUploadForm.dir == "") {
      Flash.create('warning' , 'Please provide the FTP base path');
      return;
    }
    $scope.lddUploadForm.showImg = 'loading'
    var fd = new FormData();
    fd.append('ldd' ,$scope.lddUploadForm.fil)
    fd.append('baseDir' ,$scope.lddUploadForm.dir)
    fd.append('project' ,$scope.project.pk)

    Flash.create('warning' , 'Please Wait Uploading Has Been Started');

    $http({
      method : 'POST' ,
      url : '/api/projects/uploadLDDFile/' ,
      data : fd,transformRequest: angular.identity,
      headers: {
        'Content-Type': undefined
      }
    }).then(function(response) {
      Flash.create('success' , 'Saved Successfully');
      $scope.lddUploadForm.showImg = 'success'
      $scope.project.uploadingBreakFile = false;
    }, function(error) {
      Flash.create('danger', error.status + ' Something Went Wrong Could Not Save');
      $scope.lddUploadForm.showImg = ''
    })


  }



  $scope.uploadFilesList = function() {

    if ($scope.project.lddFiles == emptyFile) {
      Flash.create('danger' , 'Please select the file list first')
      return;
    }

    if ($scope.project.lddFilesBreakup.length >0 &&  $scope.project.clearLDD) {
      for (var i = 0; i < $scope.project.lddFilesBreakup.length; i++) {
        $http({method : 'DELETE' , url : '/api/projects/LDDAssignment/' + $scope.project.lddFilesBreakup[i].pk + '/' }).
        then(function(response) {

        })
      }
    }

    var fd = new FormData();
    fd.append('file', $scope.project.lddFiles)
    fd.append('project', $scope.project.pk)

    $http({
      method: 'POST',
      url: '/api/projects/uploadLDDFiles/',
      data: fd,
      transformRequest: angular.identity,
      headers: {
        'Content-Type': undefined
      }
    }).
    then(function(response) {
      Flash.create('success', 'Saved');
      $scope.project.lddFilesBreakup = response.data;
    });



  }

  $scope.convertCodingFiles = function(){
    $uibModal.open({
      templateUrl: '/static/ngTemplates/app.project.convertToCodingFiles.html',
      size: 'md',
      backdrop: true,
      resolve: {
        projectPk: function() {
          return $scope.project.pk;
        }
      },
      controller: function($scope, projectPk, $uibModalInstance,Flash) {
        $scope.form = {pth: '',projectPk: projectPk,uploadingMsg:false}
        $scope.save = function() {
          console.log($scope.form,'$scope.form$scope.form');
          if ($scope.form.pth.length==0) {
            Flash.create('warning', 'Please Mention Base Dir Path')
            return
          }
          $scope.form.uploadingMsg = true
          $http({
            method: 'GET',
            url: '/api/projects/LDDDownload/?saveExcel&type=excel&projectpk='+$scope.form.projectPk,
          }).
          then(function(response) {
            console.log(response.data);
            $http({
              method : 'POST' ,
              url : '/api/projects/uploadLDDFile/' ,
              data : {project:$scope.form.projectPk,baseDir:$scope.form.pth,'savedFile':response.data.savedExcel},
            }).then(function(response) {
              Flash.create('success' , 'Converted Successfully');
              $uibModalInstance.dismiss('success');
            }, function(error) {
              $scope.form.uploadingMsg = false
              Flash.create('danger', error.status + ' Error While Convertion');
            })

          }, function(error) {
            $scope.form.uploadingMsg = false
            Flash.create('danger', error.status + ' Error While Convertion');
          })

        }
      }
    }).result.then(function() {
    }, function() {
    });
  }

  $scope.assignLDD = function() {
    if ($scope.project.lddFilePath!=null&&$scope.project.lddFilePath.length>0) {
      $http({
        method: 'PATCH',
        url: '/api/projects/project/'+$scope.project.pk+'/',
        data: {
          lddFilePath:$scope.project.lddFilePath
        }
      }).
      then(function(response) {
        console.log('lddfilepath updateddddddddd');
      });
    }

    for (var i = 0; i < $scope.project.lddFilesBreakup.length; i++) {

      var url = '/api/projects/LDDAssignment/';
      var method = 'POST';
      lddAss = $scope.project.lddFilesBreakup[i];
      if (lddAss.pk) {
        url = url + lddAss.pk + '/';
        method = 'PATCH';
      }

      $http({
        method: method,
        url: url,
        data: {
          qc: lddAss.qc.pk,
          coder: lddAss.coder.pk,
          folder: lddAss.folder,
          files: lddAss.files,
          project: $scope.project.pk,
          count: lddAss.count,
        }
      }).
      then((function(i) {
        return function(response) {
          $scope.project.lddFilesBreakup[i].pk = response.data.pk
          Flash.create('success', 'Assigned');
          if ($scope.project.lddFilesBreakup[i].checked) {
            $scope.assgnMentCount += 1
            if ($scope.assgnMentCount == $scope.project.lddFilesBreakup.length) {
              $scope.shwDownloadBtn = true
            }else {
              $scope.shwDownloadBtn = false
            }
          }
        }
      })(i))

    }

  }

  $scope.userSearch = function(query) {
    return $http.get('/api/HR/userSearch/?limit=10&username__contains=' + query).
    then(function(response) {
      return response.data.results;
    })
  }


  $scope.openTask = function(index) {
    var t = $scope.project.tasks[index];
    $scope.addTab({
      title: 'Browse task : ' + t.title,
      cancel: true,
      app: 'taskBrowser',
      data: {
        pk: t.pk,
        name: t.title
      },
      active: true
    })
  }

  $scope.sendMessage = function() {
    if ($scope.commentEditor.text.length == 0) {
      return;
    }
    var dataToSend = {
      project: $scope.project.pk,
      text: $scope.commentEditor.text,
      category: 'message',
    }
    $http({
      method: 'POST',
      url: '/api/projects/timelineItem/',
      data: dataToSend
    }).
    then(function(response) {
      $scope.project.messages.push(response.data);
      $scope.commentEditor.text = '';
    });
  }

  $scope.fetchNotifications = function(index) {
    // takes the index of the repo for which the notifications is to be fetched
    $http({
      method: 'GET',
      url: '/api/git/commitNotification/?limit=10&offset=' + $scope.project.repos[index].page * 5 + '&repo=' + $scope.project.repos[index].pk
    }).
    then((function(index) {
      return function(response) {
        $scope.project.repos[index].commitCount = response.data.count;
        $scope.project.repos[index].rawCommitNotifications = $scope.project.repos[index].rawCommitNotifications.concat(response.data.results);
      }
    })(index));
  }

  $scope.mode = 'new';
  $scope.shwDownloadBtn = false
  $scope.assgnMentCount = 0

  $scope.fetchTasks = function() {
    $http({
      method: 'GET',
      url: '/api/taskBoard/task/?project=' + $scope.tab.data.pk
    }).
    then(function(response) {
      $scope.project.tasks = response.data;
    });
  }
  console.log($scope.tab.data);
  $scope.codingForm = {coderTeam : null , reCoderTeam : null , qaTeam : null , reQaTeam : null , ccTeam : null}
  $http({
    method: 'GET',
    url: '/api/projects/project/' + $scope.tab.data.pk + '/'
  }).
  then(function(response) {
    $scope.project = response.data;
    console.log($scope.project);
    $scope.project.filesDetails = $scope.tab.data.filesDetails
    if ($scope.project.team.indexOf($scope.me.pk)==-1) {
      $scope.project.inteam = false
    }else {
      $scope.project.inteam = true
    }
    $scope.project.messages = [];
    // for (var i = 0; i < $scope.project.repos.length; i++) {
    //   $scope.project.repos[i].page = 0;
    //   $scope.project.repos[i].rawCommitNotifications = []
    //   $scope.fetchNotifications(i);
    // }
    $scope.fetchTasks();
    $http({
      method: 'GET',
      url: '/api/projects/timelineItem/?category=message&project=' + $scope.tab.data.pk
    }).
    then(function(response) {
      $scope.project.messages = response.data;
    })
    $scope.mode = 'view';

    $scope.project.lddFiles = emptyFile;

    $http({method : 'GET' , url : '/api/projects/LDDAssignment/?project=' + $scope.project.pk}).
    then(function(response) {
      $scope.project.lddFilesBreakup = response.data;
      for (var i = 0; i < $scope.project.lddFilesBreakup.length; i++) {
        $scope.project.lddFilesBreakup[i].qc = $users.get($scope.project.lddFilesBreakup[i].qc)
        $scope.project.lddFilesBreakup[i].coder = $users.get($scope.project.lddFilesBreakup[i].coder)
        if ($scope.project.lddFilesBreakup[i].checked) {
          $scope.assgnMentCount += 1
          if ($scope.assgnMentCount == $scope.project.lddFilesBreakup.length) {
            $scope.shwDownloadBtn = true
          }else {
            $scope.shwDownloadBtn = false
          }
        }
      }



    })

    $scope.codingForm = {coderTeam : $scope.project.coderTeam , reCoderTeam : $scope.project.reCoderTeam , qaTeam : $scope.project.qaTeam , reQaTeam : $scope.project.reQaTeam , ccTeam : $scope.project.ccTeam}


  });

  $scope.teamSearch = function(query) {
    return $http.get('/api/HR/team/?limit=10&title__icontains=' + query).
    then(function(response) {
      return response.data.results;
    })
  }

  $scope.saveCodingAssignment = function() {
    var dataToSend = {
      coderTeam : $scope.codingForm.coderTeam.pk , reCoderTeam : $scope.codingForm.reCoderTeam.pk , qaTeam : $scope.codingForm.qaTeam.pk , reQaTeam : $scope.codingForm.reQaTeam.pk , ccTeam : $scope.codingForm.ccTeam.pk
    }

    $http({method : 'PATCH' , url : '/api/projects/project/' + $scope.project.pk + '/' , data : dataToSend}).
    then(function(response) {
      Flash.create('success' , 'Saved')
      console.log();
    })
  }

  $scope.createTask = function() {
    $aside.open({
      templateUrl: '/static/ngTemplates/app.taskBoard.createTask.html',
      controller: 'projectManagement.taskBoard.createTask',
      position: 'left',
      size: 'xl',
      backdrop: true,
      resolve: {
        project: function() {
          return $scope.project.pk;
        }
      }
    }).result.then(function() {}, function() {
      console.log("create task1");
      $scope.fetchTasks();
    });
  }

  $scope.loadMore = function(index) {
    $scope.project.repos[index].page += 1;
    $scope.fetchNotifications(index);
  }

  $scope.exploreNotification = function(repo, commit) {
    $aside.open({
      templateUrl: '/static/ngTemplates/app.GIT.aside.exploreNotification.html',
      position: 'left',
      size: 'xxl',
      backdrop: true,
      resolve: {
        input: function() {
          return $scope.project.repos[repo].commitNotifications[commit];
        }
      },
      controller: 'projectManagement.GIT.exploreNotification',
    })
  }

  $scope.explore = {
    mode: 'git',
    addFile: false
  };

  $scope.updateFiles = function() {
    if (!$scope.explore.addFile) {
      return;
    }
    var pks = [];
    for (var i = 0; i < $scope.project.files.length; i++) {
      pks.push($scope.project.files[i].pk);
    }
    var dataToSend = {
      files: pks
    }
    $http({
      method: 'PATCH',
      url: '/api/projects/project/' + $scope.project.pk + '/',
      data: dataToSend
    }).
    then(function(response) {
      Flash.create('success', 'Saved');
    });
  }

  $scope.changeExploreMode = function(mode) {
    $scope.explore.mode = mode;
  }

  $scope.changeExploreMode('timeline');

  $scope.secondsToHms = function(d) {
    var sec_num = parseInt(d, 10)
    var hours   = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    return hours+':'+minutes+':'+seconds;
  }
  // console.log($scope.secondsToHms(123));



  $scope.opencomments = function() {
    console.log('inside coomments');
  }

  $scope.showDetails = function(id) {
    console.log('showwwwwwwwwwwwwing detail.............', id);
    $aside.open({
      templateUrl: '/static/ngTemplates/app.projects.issueDetails.html',
      placement: 'right',
      size: 'md',
      backdrop: true,
      resolve: {
        project: function() {
          return $scope.project;
        }
      },
      controller: function($scope) {
        console.log(id, '------this issue');
        $http({
          method: 'GET',
          url: '/api/projects/issue/' + id,
        }).
        then(function(response) {
          $scope.details = response.data;
        })
      }


    }) //-modal ends

  }
  $scope.fields = [];
  console.log($scope.project,'projectprojectprojectproject');
  $http({
    method: 'GET',
    url: '/api/projects/projectfield/?project=' + $scope.tab.data.pk,
  }).
  then(function(response) {
    $scope.fields = response.data
    $scope.isError = function() {
      $scope.error = {}
      for (var i = 0; i < $scope.fields.length; i++) {
        var type = $scope.fields[i].type
        if ($scope.fields[i].type == 'name') {
          console.log($scope.fields[i], 'initial');
          $scope.error[type] = {}
          if ($scope.fields[i].prefix) {
            $scope.error[type].prefix = false
          }
          if ($scope.fields[i].fName) {
            $scope.error[type].fname = false
          }
          if ($scope.fields[i].mName) {
            $scope.error[type].mname = false
          }
          if ($scope.fields[i].lName) {
            $scope.error[type].lname = false
          }
          if ($scope.fields[i].compName) {
            $scope.error[type].compName = false
          }
        } else {
          $scope.error[type] = false
        }


      }
      return $scope.error
    }
    $scope.isError()
    console.log($scope.isError(), 'vf')

  })

  $scope.showDateDirectives = function() {
    $uibModal.open({
      templateUrl: '/static/ngTemplates/app.projects.datedirectives.html',
      size: 'md',
      backdrop: true,
    })
  }

  $scope.resetfieldForm = function() {
    $scope.form = {
      name: '',
      type: 'name',
      default: '',
      dropOptions: '',
      prefix: false,
      fName: false,
      mName: false,
      lName: false,
      compName: false,
      checkbox: false,
      switchh: false,
      case : 'ANY_CASE',
      maxLength : 100,
      dateFormat : '%d-%m-%Y',
      nf1:'PN',
      nf2:'',
      nf3:'FN',
      nf4:'',
      nf5:'MN',
      nf6:'',
      nf7:'LN',
      nf8:'',
      nf9:'CN',
      multiLimit : 10,
      restrict : ""
    }
  }
  $scope.resetfieldForm();
  $scope.saveFields = function() {
    var f = $scope.form;
    var dataToSend = {
      name: f.name,
      type: f.type,
      required: f.required,
      default: f.default,
      project: $scope.project.pk,
    }
    if (f.type == 'name') {
      dataToSend.prefix = f.prefix;
      dataToSend.fName = f.fName;
      dataToSend.mName = f.mName;
      dataToSend.lName = f.lName;
      dataToSend.compName = f.compName;
      dataToSend.nameFormat = f.nf1+'|'+f.nf2+'|'+f.nf3+'|'+f.nf4+'|'+f.nf5+'|'+f.nf6+'|'+f.nf7+'|'+f.nf8+'|'+f.nf9;
    }
    if (f.type == 'dropdown') {
      dataToSend.dropOptions = f.dropOptions;
    }
    if (f.type == 'boolean') {
      dataToSend.checkbox = f.checkbox;
      dataToSend.switchh = f.switchh;
    }

    if (['name', 'email' , 'text', 'smallText'].indexOf(f.type) != -1) {
      dataToSend.case = f.case;
      dataToSend.maxLength = f.maxLength;
    }
    dataToSend.multi = f.multi;
    if (f.multi) {
      dataToSend.multiSeperator = f.multiSeperator;
    }

    if (['date' , 'datetime'].indexOf(f.type) != -1) {
      dataToSend.dateFormat = f.dateFormat;
    }

    $http({
      method: 'POST',
      url: '/api/projects/projectfield/',
      data: dataToSend,
    }).
    then(function(response) {
      // console.log(response.data);
      Flash.create('success', 'Saved Succesfully')
      $scope.resetfieldForm();
      $scope.fields.push(response.data);
    })
  }

  $scope.open = false;
  $scope.edit = [];
  $scope.hideit = false;
  console.log($scope.edit);
  $scope.editField = function(idx) {
    $scope.open = false;
    $scope.edit[idx] = true;
    $scope.hideit = true;
    $scope.form = $scope.fields[idx];
    if ($scope.form.type=='name'&&$scope.form.nameFormat!=null&&$scope.form.nameFormat.length>0) {
      var nfData = $scope.form.nameFormat.split('|')
      $scope.form.nf1 = nfData[0]
      $scope.form.nf2 = nfData[1]
      $scope.form.nf3 = nfData[2]
      $scope.form.nf4 = nfData[3]
      $scope.form.nf5 = nfData[4]
      $scope.form.nf6 = nfData[5]
      $scope.form.nf7 = nfData[6]
      $scope.form.nf8 = nfData[7]
      $scope.form.nf9 = nfData[8]
    }else {
      $scope.form.nf1 = ''
      $scope.form.nf2 = ''
      $scope.form.nf3 = ''
      $scope.form.nf4 = ''
      $scope.form.nf5 = ''
      $scope.form.nf6 = ''
      $scope.form.nf7 = ''
      $scope.form.nf8 = ''
      $scope.form.nf9 = ''
    }
    $scope.updateField = function() {
      var dataToSend = {
        name: $scope.form.name,
        type: $scope.form.type,
        required: $scope.form.required,
        default: $scope.form.default,
        restrict: $scope.form.restrict,
      }
      if ($scope.form.type == 'name') {
        dataToSend.prefix = $scope.form.prefix;
        dataToSend.fName = $scope.form.fName;
        dataToSend.mName = $scope.form.mName;
        dataToSend.lName = $scope.form.lName;
        dataToSend.compName = $scope.form.compName;
        dataToSend.nameFormat = $scope.form.nf1+'|'+$scope.form.nf2+'|'+$scope.form.nf3+'|'+$scope.form.nf4+'|'+$scope.form.nf5+'|'+$scope.form.nf6+'|'+$scope.form.nf7+'|'+$scope.form.nf8+'|'+$scope.form.nf9;
      }
      if ($scope.form.type == 'dropdown') {
        dataToSend.dropOptions = $scope.form.dropOptions;
      }
      if ($scope.form.type == 'boolean') {
        dataToSend.checkbox = $scope.form.checkbox;
        dataToSend.switchh = $scope.form.switchh;
      }
      if (['name', 'email' , 'text', 'smallText'].indexOf($scope.form.type) != -1) {
        dataToSend.case = $scope.form.case;
        dataToSend.maxLength = $scope.form.maxLength;
      }
      dataToSend.multi = $scope.form.multi;
      if ($scope.form.multi) {
        dataToSend.multiSeperator = $scope.form.multiSeperator;
        dataToSend.multiLimit = $scope.form.multiLimit;
      }

      if (['date' , 'datetime'].indexOf($scope.form.type) != -1) {
        dataToSend.dateFormat = $scope.form.dateFormat;
      }

      $http({
        method: 'PATCH',
        url: '/api/projects/projectfield/' + $scope.form.pk + '/',
        data: dataToSend,
      }).
      then(function(response) {
        // console.log(response.data);
        Flash.create('success', 'Updated')
        $scope.resetfieldForm();
        $scope.fields[idx] = response.data;
        $scope.edit[idx] = false;
        $scope.hideit = false;
      })
    }
  }

  $scope.removeField = function(idx, pk) {
    console.log(idx, '-------------', pk);
    $http({
      method: 'DELETE',
      url: '/api/projects/projectfield/' + pk + '/',
    }).
    then((function(idx) {
      return function(response) {
        $scope.fields.splice(idx, 1);
      }
    })(idx))
  }

  $scope.items = []

  $scope.addTableRow = function() {
    console.log('fsdfsdfds');
    $scope.items.push({
      location: '',
      browse: '',
    });
    console.log($scope.items);
  }

  $scope.updateSelection = function(val) {
    console.log(val, '-------------');
    if (val == 'check') {
      $scope.form.switchh = false;
    } else if (val == 'switch') {
      $scope.form.checkbox = false;
    }
  }

  // $scope. = [];
  $scope.fileUploadData = [];
  $scope.fileLimit = 0
  $scope.showLoadMore = false
  $scope.fetchFilesData = function(){
    $scope.fileLimit += 10
    $http({
      method: 'GET',
      url: '/api/projects/fileupload/?parentFiles&limit='+$scope.fileLimit+'&project=' + $scope.tab.data.pk
    }).
    then(function(response) {
      $scope.fileUploadData = response.data.results;
      $scope.fileData = $scope.fileUploadData[0];
      if (response.data.next) {
        $scope.showLoadMore = true
      }else {
        $scope.showLoadMore = false
      }
    })
  }
  $scope.fetchFilesData()

  $scope.projectCoderList = []
  $scope.projectqcList = []
  $scope.projectRecoderList = []
  $scope.projectReqcList = []
  $scope.getCoderAndQcData = function(){
    $scope.pendingForm = {selectedcoder:null,selectedqc:null,selecteRedcoder:null,selectedReqc:null,recoder:'',reqc:'',typ:'',allSelected:false,rephase:false}
    $http({
      method: 'GET',
      url: '/api/projects/getCoderAndQcData/?project=' + $scope.tab.data.pk
    }).
    then(function(response) {
      console.log(response.data);
      $scope.projectCoderList = [{"pk": 0,"name": "All"}].concat(response.data.codersList)
      $scope.projectqcList = [{"pk": 0,"name": "All"}].concat(response.data.qcList)
      $scope.projectRecoderList = response.data.recodersList
      $scope.projectReqcList = response.data.reqcList
      $scope.projectcanCodeList = response.data.canCodeList
      $scope.projectcanQcList = response.data.canQcList
      $scope.phaseChange()
    })
  }
  $scope.getCoderAndQcData()
  $scope.changeFiles = function(){
    $scope.pendingForm.recoder = "0"
    $scope.pendingForm.reqc = "0"
    $scope.fetchpendingFilesData()
  }
  $scope.pendingFilesData = []
  $scope.fetchpendingFilesData = function(){
    $scope.pendingForm.allSelected = false
    $scope.selectedfilesPk = []
    var url = '/api/projects/fileupload/?pendingFiles&project=' + $scope.tab.data.pk+'&assignTyp='+$scope.pendingForm.typ
    if ($scope.pendingForm.rephase) {
      if ($scope.pendingForm.typ=='recoding') {
        var userPk = $scope.projectCoderList[parseInt($scope.pendingForm.recoder)].pk
      }else {
        var userPk = $scope.projectqcList[parseInt($scope.pendingForm.reqc)].pk
      }
      url += '&user='+userPk
    }
    $http({
      method: 'GET',
      url: url
    }).
    then(function(response) {
      $scope.pendingFilesData = response.data;
    })
  }
  $scope.phaseChange = function(){
    if ($scope.pendingForm.rephase) {
      if ($scope.projectCoderList.length>0) {
        $scope.pendingForm.typ = 'recoding'
        $scope.changeFiles()
      }else if ($scope.projectqcList.length>0) {
        $scope.pendingForm.typ = 'reqc'
        $scope.changeFiles()
      }
    }else {
      if ($scope.projectcanCodeList.length>0) {
        $scope.pendingForm.typ = 'coding'
        $scope.changeFiles()
      }else if ($scope.projectcanQcList.length>0) {
        $scope.pendingForm.typ = 'qc'
        $scope.changeFiles()
      }
    }
  }
  $scope.selectAll = function() {
    if (!$scope.pendingForm.allSelected) {
      $scope.selectedfilesPk = []
    }
    for (var i = 0; i < $scope.pendingFilesData.length; i++) {
      $scope.pendingFilesData[i].selected = $scope.pendingForm.allSelected;
      if ($scope.pendingForm.allSelected && $scope.selectedfilesPk.indexOf($scope.pendingFilesData[i].pk)==-1) {
        $scope.selectedfilesPk.push($scope.pendingFilesData[i].pk)
      }
    }
  }
  $scope.changeSelect = function(obj){
    if (obj.selected) {
      if ($scope.selectedfilesPk.indexOf(obj.pk)==-1) {
        $scope.selectedfilesPk.push(obj.pk)
      }
    }else {
      if ($scope.selectedfilesPk.indexOf(obj.pk)!=-1) {
        $scope.selectedfilesPk.splice($scope.selectedfilesPk.indexOf(obj.pk),1)
      }
    }
  }
  $scope.assignFiles = function(){
    if ($scope.selectedfilesPk.length==0) {
      Flash.create('danger', 'Please Select Some Files To Assign');
      return
    }
    if ($scope.pendingForm.typ=='coding') {
      if ($scope.pendingForm.selectedcoder) {
        var userPk = parseInt($scope.pendingForm.selectedcoder)
      }else {
        Flash.create('danger', 'Please Select Coder User');
        return
      }
    }else if ($scope.pendingForm.typ=='qc') {
      if ($scope.pendingForm.selectedqc) {
        var userPk = parseInt($scope.pendingForm.selectedqc)
      }else {
        Flash.create('danger', 'Please Select Qc User');
        return
      }
    }else if ($scope.pendingForm.typ=='recoding') {
      if ($scope.pendingForm.selecteRedcoder) {
        var userPk = parseInt($scope.pendingForm.selecteRedcoder)
      }else {
        Flash.create('danger', 'Please Select Re Coder User');
        return
      }
    }else {
      if ($scope.pendingForm.selectedReqc) {
        var userPk = parseInt($scope.pendingForm.selectedReqc)
      }else {
        Flash.create('danger', 'Please Select Re Qc User');
        return
      }
    }
    console.log('assign filesssss',userPk,$scope.selectedfilesPk,$scope.pendingForm.typ);
    $http({
      method: 'POST',
      url: '/api/projects/assignFilesToUser/',
      data: {
        userPk: userPk,
        typ:$scope.pendingForm.typ,
        filesPks:$scope.selectedfilesPk
      }
    }).
    then(function(response) {
      Flash.create('success', 'Assigned Successfully');
      $scope.pendingForm.allSelected = false
      $scope.selectAll()
    }, function(error) {
      Flash.create('danger', error.status);
    })
  }

  $scope.unlockFiles = function(){
    if ($scope.selectedfilesPk.length==0) {
      Flash.create('danger', 'Please Select Some Files To Assign');
      return
    }

    $http({
      method: 'POST',
      url: '/api/projects/unlockFilesForUser/',
      data: {
        typ:$scope.pendingForm.typ,
        filesPks:$scope.selectedfilesPk
      }
    }).
    then(function(response) {
      Flash.create('success', 'Unlocked Successfully');
      $scope.pendingForm.allSelected = false
      $scope.selectAll()
    }, function(error) {
      Flash.create('danger', error.status);
    })
  }


  $scope.orderChange = function(position, index) {
    console.log('clickkkkedd', index, 'moveeeee', position);
    if ($scope.fileUploadData.length > 1) {
      var a = $scope.fileUploadData[index]
      if (position == 'up') {
        if (index > 0) {
          $scope.fileUploadData.splice(index, 1)
          $scope.fileUploadData.splice(index - 1, 0, a)
        }
        $scope.orderChangeSave(index, position);
        // console.log('--- cliked up', $scope.fileUploadData[index - 1].path, '---- row current index', index - 1, 'this is moved by me');
        // console.log($scope.fileUploadData[index].path, 'moved autoooooo down to position', index);
      } else {
        if (index < $scope.fileUploadData.length - 1) {
          $scope.fileUploadData.splice(index, 1)
          $scope.fileUploadData.splice(index + 1, 0, a)
        }
        $scope.orderChangeSave(index, position);
        // console.log('--------cliked down', $scope.fileUploadData[index + 1].path, '--- row current index', index + 1,'this is moved by me');
        // console.log($scope.fileUploadData[index].path, 'moved autoooooo uppp to position', index);
      }
    }
  }
  $scope.orderChangeSave = function(idx, pos) {
    if (pos == 'up') {
      console.log(idx, pos);
      var value = idx - 1;
      console.log(value, 'index - 1');
    } else if (pos == 'down') {
      console.log(idx, pos);
      var value = idx + 1;
      console.log(value, 'index + 1');
    }
    $http({
      method: 'PATCH',
      url: '/api/projects/fileupload/' + $scope.fileUploadData[value].pk + '/',
      data: {
        order: value
      }
    }).
    then(function(response) {}, function(error) {
      Flash.create('danger', error.status);
    })
    $http({
      method: 'PATCH',
      url: '/api/projects/fileupload/' + $scope.fileUploadData[idx].pk + '/',
      data: {
        order: idx
      }
    }).
    then(function(response) {}, function(error) {
      Flash.create('danger', error.status);
    })
  }

  $scope.save = function() {
    for (var i = 0; i < $scope.items.length; i++) {
      console.log('in loooopppp');
      if (typeof $scope.items[i].file != 'object' || typeof $scope.items[i].file == 'string' || $scope.items[i].file == undefined) {
        console.log($scope.items[i].path, '----pppatthh');
        Flash.create('warning', 'Please Remove Empty Rows');
        console.log('in iffffffff ');
        return
      }
    }
    for (var i = 0; i < $scope.items.length; i++) {
      var url = '/api/projects/fileupload/'
      var method = 'POST';
      var fd = new FormData();
      if ($scope.items[i].file != emptyFile && typeof $scope.items[i].file != 'string' && $scope.items[i].file != undefined) {
        fd.append('file', $scope.items[i].file)
      } else {
        Flash.create('warning', 'Please Upload File');
        return
      }
      if ($scope.items[i].path != undefined) {
        fd.append('path', $scope.items[i].path);
      } else {
        fd.append('path', '');
      }
      fd.append('order', i + 1 + $scope.fileUploadData.length);
      fd.append('project', $scope.project.pk);
      $http({
        method: method,
        url: url,
        data: fd,
        transformRequest: angular.identity,
        headers: {
          'Content-Type': undefined
        }
      }).
      then((function(i) {
          return function(response) {
            console.log(response.data.order);
            $scope.fileUploadData[response.data.order - 1] = response.data
            if (i == $scope.items.length - 1) {
              Flash.create('success', 'Saved');
              $scope.items = []
            }
          }
        })(i),
        function(error) {
          Flash.create('danger', 'Something Went Could Not Save.');
        })
    }

  }

  $scope.deleteTableRow = function(pk, idx) {
    if (pk != undefined) {
      console.log('withhhh pk came here', pk);
      $http({
        method: 'DELETE',
        url: '/api/projects/fileupload/' + pk + '/'
      }).
      then((function(idx) {
          return function(response) {
            $scope.fileUploadData.splice(idx, 1);
            Flash.create('success', 'Deleted');
          }
        })(idx),
        function(error) {
          Flash.create('danger', 'Could not Delete');
        })
    }
  };

  $scope.deleteEmptyRow = function(idx) {
    console.log('deleteEmptyRow');
    $scope.items.splice(idx, 1);
  }


  $scope.fileIndex = 0;

  $scope.next = function() {
    console.log($scope.fileUploadData, $scope.fileIndex, 'rtttttttttttttttt');
    for (var i = 0; i < $scope.fields.length; i++) {
      if ($scope.fields[i].value || $scope.fields[i].valueF || $scope.fields[i].valueM || $scope.fields[i].valueL || $scope.fields[i].valueP) {
        return $uibModal.open({
          templateUrl: '/static/ngTemplates/app.projects.clearvalue.html',
          size: 'sm',
          backdrop: true,
          resolve: {
            fields: function() {
              return $scope.fields;
            },
            uploaddata: function() {
              return $scope.fileUploadData;
            },
            indexVal: function() {
              return $scope.fileIndex;
            },

          },
          controller: function($scope, fields, $http, uploaddata, $uibModalInstance, indexVal) {
            $scope.clear = function() {

              for (var i = 0; i < fields.length; i++) {
                if (fields[i].value || fields[i].valueP || fields[i].valueF || fields[i].valueM || fields[i].valueL || fields[i].value == undefined) {
                  fields[i].value = ''
                  fields[i].valueP = null
                  fields[i].valueF = null
                  fields[i].valueM = null
                  fields[i].valueL = null
                }


              }
              console.log(uploaddata, indexVal, 'ooooooooooooooooo');

              indexVal += 1;
              if (indexVal >= uploaddata.length) {
                indexVal -= 1;
                $uibModalInstance.dismiss()
                Flash.create('danger', 'No more files next');
                return
              }
              var filedata = uploaddata[indexVal];
              console.log(indexVal, 'eeeeee');
              var filDataIndex = {
                index: indexVal,
                data: filedata
              }
              $uibModalInstance.close(filDataIndex)
            }
            $scope.close = function() {
              $uibModalInstance.dismiss()
            }
          }
        }).result.then(function(i) {
          $scope.fileIndex = i.index
          $scope.fileData = i.data
          $scope.isError()
        }, function() {

        });
      }

    }

    $scope.isError()
    $scope.fileIndex += 1;
    if ($scope.fileIndex >= $scope.fileUploadData.length) {
      $scope.fileIndex -= 1;
      Flash.create('danger', 'No more files next');
      return
    }
    $scope.fileData = $scope.fileUploadData[$scope.fileIndex];
  }

  $scope.prev = function() {
    for (var i = 0; i < $scope.fields.length; i++) {
      if ($scope.fields[i].value || $scope.fields[i].valueF || $scope.fields[i].valueM || $scope.fields[i].valueL || $scope.fields[i].valueP) {
        return $uibModal.open({
          templateUrl: '/static/ngTemplates/app.projects.clearvalue.html',
          size: 'sm',
          backdrop: true,
          resolve: {
            fields: function() {
              return $scope.fields;
            },
            uploaddata: function() {
              return $scope.fileUploadData;
            },
            indexVal: function() {
              return $scope.fileIndex;
            },

          },
          controller: function($scope, fields, $http, uploaddata, $uibModalInstance, indexVal) {
            $scope.clear = function() {

              for (var i = 0; i < fields.length; i++) {
                if (fields[i].value || fields[i].valueP || fields[i].valueF || fields[i].valueM || fields[i].valueL || fields[i].value == undefined) {
                  fields[i].value = ''
                  fields[i].valueP = null
                  fields[i].valueF = null
                  fields[i].valueM = null
                  fields[i].valueL = null
                }


              }

              console.log(uploaddata, indexVal, 'ooooooooooooooooo');
              indexVal -= 1;
              if (indexVal < 0) {
                indexVal += 1;
                $uibModalInstance.dismiss()
                Flash.create('danger', 'No more files from Previous');
                return
              }
              var filedata = uploaddata[indexVal];
              console.log(indexVal, 'eeeeee');
              var filDataIndex = {
                index: indexVal,
                data: filedata
              }
              $uibModalInstance.close(filDataIndex)
            }
            $scope.close = function() {
              $uibModalInstance.dismiss()
            }
          }
        }).result.then(function(i) {
          $scope.fileIndex = i.index
          $scope.fileData = i.data
          $scope.isError()
        }, function() {

        });
      }

    }

    $scope.isError()
    $scope.fileIndex -= 1;
    if ($scope.fileIndex < 0) {
      $scope.fileIndex += 1;
      Flash.create('danger', 'No more files from Previous');
      return
    }
    $scope.fileData = $scope.fileUploadData[$scope.fileIndex]
  }
  $scope.today = new Date()
  $scope.countvalue = 0
  $scope.count = function() {
    for (var i = 0; i < $scope.fields.length; i++) {
      if ($scope.fields[i].type == 'text') {
        $scope.countvalue = $scope.fields[i].value.length
      }
    }
  }


  $scope.saveDynamicForm = function() {
    var otherFields = [];
    var toSend = {}
    // tosend.field = $scope.fields.pk;

    console.log($scope.form, $scope.fields, 'formmmmmm')
    for (var i = 0; i < $scope.fields.length; i++) {
      if ($scope.fields[i].required) {
        if ($scope.fields[i].type == 'name') {
          if (!$scope.fields[i].valueP && $scope.fields[i].prefix) {
            $scope.error.name.prefix = true
          } else {
            $scope.error.name.prefix = false
            toSend.prefix = $scope.fields[i].valueP;
          }
          if (!$scope.fields[i].valueF && $scope.fields[i].fName) {
            $scope.error.name.fname = true
          } else {
            $scope.error.name.fname = false
            toSend.fname = $scope.fields[i].valueF;
          }
          if (!$scope.fields[i].valueM && $scope.fields[i].mName) {
            $scope.error.name.mname = true
          } else {
            $scope.error.name.mname = false
            toSend.mname = $scope.fields[i].valueM;
          }
          if (!$scope.fields[i].valueL && $scope.fields[i].lName) {
            $scope.error.name.lname = true
          } else {
            $scope.error.name.lname = false
            toSend.lname = $scope.fields[i].valueL;
          }
          if (!$scope.fields[i].valueC && $scope.fields[i].compName) {
            $scope.error.name.compName = true
          } else {
            $scope.error.name.compName = false
            toSend.compName = $scope.fields[i].valueC;
          }
        }
        if ($scope.fields[i].type == 'dropdown') {
          if (!$scope.fields[i].value) {
            $scope.error.dropdown = true
          } else {
            $scope.error.dropdown = false
            toSend.char = $scope.fields[i].value;
          }
        }
        if ($scope.fields[i].type == 'email') {
          if (!$scope.fields[i].value) {
            $scope.error.email = true

          } else {
            var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            if (re.test($scope.fields[i].value)) {
              $scope.error.email = false
              toSend.email = $scope.fields[i].value;
            } else {
              $scope.error.email = true
            }
          }
        }
        if ($scope.fields[i].type == 'number') {
          if (!$scope.fields[i].value) {
            $scope.error.number = true

          } else {
            $scope.error.number = false
            toSend.number = $scope.fields[i].value;
          }
        }
        if ($scope.fields[i].type == 'text') {
          if (!$scope.fields[i].value) {
            $scope.error.text = true
          } else {
            if ($scope.fields[i].value.length >= 5 && $scope.fields[i].value.length <= 300) {
              $scope.error.text = false
              toSend.txt = $scope.fields[i].value;
            } else {
              $scope.error.text = true
            }
          }
        }
        if ($scope.fields[i].type == 'date') {
          if (!$scope.fields[i].value) {
            $scope.error.date = true
          } else {
            $scope.error.date = false
            toSend.dt = $scope.fields[i].value;
          }
        }
        if ($scope.fields[i].type == 'datetime') {
          if (!$scope.fields[i].value) {
            $scope.error.datetime = true
          } else {
            $scope.error.datetime = false
            toSend.dtTime = $scope.fields[i].value;
          }
        }
      }
      if ($scope.fields[i].type == 'dropdown' && $scope.fields[i].value != undefined) {
        toSend.char = $scope.fields[i].value;
      }
      if ($scope.fields[i].type == 'email' && $scope.fields[i].value != undefined) {
        toSend.email = $scope.fields[i].value;
      }
      if ($scope.fields[i].type == 'number' && $scope.fields[i].value != undefined) {
        toSend.number = $scope.fields[i].value;
      }
      if ($scope.fields[i].type == 'text' && $scope.fields[i].value != undefined) {
        toSend.txt = $scope.fields[i].value;

      }
      if ($scope.fields[i].type == 'date' && $scope.fields[i].value != undefined) {
        toSend.dt = $scope.fields[i].value;
      }
      if ($scope.fields[i].type == 'boolean' && $scope.fields[i].value != undefined) {
        toSend.bool = $scope.fields[i].value;
      }
      if ($scope.fields[i].type == 'datetime' && $scope.fields[i].value != undefined) {
        toSend.dtTime = $scope.fields[i].value;
      }
      if ($scope.fields[i].type == 'name') {
        if ($scope.fields[i].prefix && $scope.fields[i].valueP != undefined) {
          toSend.prefix = $scope.fields[i].valueP;
        }
        if ($scope.fields[i].fName && $scope.fields[i].valueF != undefined) {
          toSend.fname = $scope.fields[i].valueF;
        }
        if ($scope.fields[i].mName && $scope.fields[i].valueM != undefined) {
          toSend.mname = $scope.fields[i].valueM;
        }
        if ($scope.fields[i].lName && $scope.fields[i].valueL != undefined) {
          toSend.lname = $scope.fields[i].valueL;
        }
        if ($scope.fields[i].compName && $scope.fields[i].valueC != undefined) {
          toSend.compName = $scope.fields[i].valueC;
        }
      }
    }
    var errorCheck = $scope.error


    console.log($scope.error, 'ppppppppp');
    var check = Object.values(errorCheck)
    var status = function() {
      for (var i = 0; i < check.length; i++) {
        if (typeof check[i] == 'object') {

          if (check[i].prefix || check[i].fname || check[i].mname || check[i].lname || check[i].compName) {
            return false
          }
        } else if (check[i]) {
          return false
        }
      }
      return true
    }

    var validate = status()
    if (validate) {
      for (var i = 0; i < $scope.fields.length; i++) {
        console.log(i, 'ffffffffff', 'lengthhhh');
        datasend = {}
        datasend.field = $scope.fields[i].pk

        datasend.file = $scope.fileData.pk;
        if ($scope.fields[i].type == 'email') {
          datasend.email = toSend.email
        } else if ($scope.fields[i].type == 'text') {
          datasend.txt = toSend.txt
        } else if ($scope.fields[i].type == 'date') {
          datasend.dt = toSend.dt
        } else if ($scope.fields[i].type == 'boolean') {
          datasend.bool = toSend.bool
        } else if ($scope.fields[i].type == 'name') {
          datasend.fname = toSend.fname
          datasend.mName = toSend.mname
          datasend.lname = toSend.lname
          datasend.compName = toSend.compName
          datasend.prefix = toSend.prefix
        } else if ($scope.fields[i].type == 'boolean') {
          datasend.bool = toSend.bool
        } else if ($scope.fields[i].type == 'datetime') {
          datasend.dtTime = toSend.dtTime
        } else if ($scope.fields[i].type == 'number') {
          datasend.number = toSend.number
        } else {
          datasend.char = toSend.char
        }

        $http({
          method: 'POST',
          url: '/api/projects/fieldValue/',
          data: datasend,
        }).
        then(function(response) {
          $scope.dynmicform = response.data
          $scope.isError()
        }, function error(response) {
          Flash.create('danger', 'Something went Wrong');
          return
        })
      }
      Flash.create('success', 'Posted Sucessfully');
      for (var i = 0; i < $scope.fields.length; i++) {
        if ($scope.fields[i].value || $scope.fields[i].valueP || $scope.fields[i].valueF || $scope.fields[i].valueM || $scope.fields[i].valueL || $scope.fields[i].value == undefined) {
          $scope.fields[i].value = ''
          $scope.fields[i].valueP = null
          $scope.fields[i].valueF = null
          $scope.fields[i].valueM = null
          $scope.fields[i].valueL = null
        }
      }
      $scope.fileIndex += 1;
      if ($scope.fileIndex >= $scope.fileUploadData.length) {
        $scope.fileIndex -= 1;
        return
      }
      $scope.fileData = $scope.fileUploadData[$scope.fileIndex];

    }

  }





});


app.controller('projectManagement.project.issues.form', function($scope, $state, $users, $http, Flash, $timeout, $uibModal, $filter, $permissions, project, $uibModalInstance) {


  $scope.reset = function() {
    $scope.today = new Date()
    dayAftTom = new Date($scope.today.setDate($scope.today.getDate() + 2))
    $scope.form = {
      'title': '',
      'project': project.pk,
      'responsible': '',
      'tentresdt': dayAftTom,
      'priority': 'low',
      'file': emptyFile,
      'description': ''
    }
  }
  $scope.reset();


  $scope.save = function() {
    if ($scope.form.responsible == null || $scope.form.responsible.length == 0) {
      Flash.create('warning', 'Please Mention Responsible Person Name')
      return
    }
    var method = 'POST'
    var Url = '/api/projects/issue/'
    var fd = new FormData();
    if ($scope.form.file != emptyFile) {
      fd.append('file', $scope.form.file)
    }
    fd.append('title', $scope.form.title);
    fd.append('project', $scope.form.project);
    fd.append('responsible', $scope.form.responsible.pk);
    fd.append('tentresdt', $scope.form.tentresdt.toJSON().split('T')[0]);
    fd.append('priority', $scope.form.priority);
    fd.append('description', $scope.form.description);
    $http({
      method: method,
      url: Url,
      data: fd,
      transformRequest: angular.identity,
      headers: {
        'Content-Type': undefined
      }
    }).
    then(function(response) {
      Flash.create('success', 'Saved');
      $uibModalInstance.dismiss(response.data);
    });
  }
  $scope.userSearch = function(query) {
    //search for the user
    return $http.get('/api/HR/userSearch/?username__contains=' + query).
    then(function(response) {
      return response.data;
    })
  }

});


//-------------------------------------------------------------------------------------------------------------------------------------------
app.controller('projectManagement.project.item', function($scope, $http, $aside, $state, Flash, $users, $filter, $permissions, $uibModal) {
  $scope.me = $users.get('mySelf');
  $scope.change = function(item) {
    window.location = "#/home/projects/new";
  }

  $scope.openReport = function(pk) {

    $uibModal.open({
      templateUrl: '/static/ngTemplates/app.projects.report.html',
      size: 'md',
      backdrop: true,
      resolve: {
        pk: function() {
          return pk
        }
      },
      controller: function($scope, $http, $uibModalInstance, pk) {
        $scope.pk = pk;
        $scope.FieldDetails = []
        $scope.checkbox = true;

        $scope.$watch('checkbox' , function(newValue , oldValue) {
          for (var i = 0; i < $scope.FieldDetails.length; i++) {
            $scope.FieldDetails[i].selected = newValue;
          }
        })

        $http({
          method: 'GET',
          url: '/api/projects/projectfield/?project=' + pk
        }).
        then(function(response) {
          $scope.fields = response.data;
          for (var i = 0; i < $scope.fields.length; i++) {
            $scope.FieldDetails.push({selected:true,name:$scope.fields[i].name,pk:$scope.fields[i].pk})
          }
        })


      },
    })



  }


});

app.controller('projectManagement.project.modal.project', function($scope, $http, $aside, $state, Flash, $users, $filter, $permissions) {

  $scope.save = function() {
    var dataToSend = {
      description: $scope.data.description,
      dueDate: $scope.data.dueDate,
      team: $scope.data.team,
      qaCanEdit : $scope.data.qaCanEdit,
    }
    $http({
      method: 'PATCH',
      url: '/api/projects/project/' + $scope.data.pk + '/',
      data: dataToSend
    }).
    then(function(response) {
      Flash.create('success', 'Saved');
    })
  }

});



app.controller('projectManagement.projects.default', function($scope, $http, $aside, $state, Flash, $users, $filter, $permissions , $uibModal) {
  $scope.data = {
    tableData: [],
    completeTableData: [],
  };
  var views = [{
    name: 'list',
    icon: 'fa-bars',
    template: '/static/ngTemplates/genericTable/genericSearchList.html',
    itemTemplate: '/static/ngTemplates/app.projects.item.html',
  }, ];

  var multiselectOptions = [{
    icon: 'fa fa-th',
    text: 'deleteOlderProjects'
  }];

  $scope.projectsConfig = {
    views: views,
    url: '/api/projects/projectLite/',
    editorTemplate: '/static/ngTemplates/app.projects.form.project.html',
    searchField: 'title',
    itemsNumPerView: [6, 12, 24],
    multiselectOptions: multiselectOptions,
    getParams : [{key : 'status!' , value :'complete'}],
  }
  $scope.projectsCompleteConfig = {
    views: views,
    url: '/api/projects/projectLite/',
    editorTemplate: '/static/ngTemplates/app.projects.form.project.html',
    searchField: 'title',
    itemsNumPerView: [6, 12, 24],
    getParams : [{key : 'status' , value :'complete'}],
  }

  $scope.tableAction = function(target, action, mode) {
    if (action == 'projectBrowser') {
      for (var i = 0; i < $scope.data.tableData.length; i++) {
        if ($scope.data.tableData[i].pk == parseInt(target)) {
          $scope.addTab({
            title: 'Browse project : ' + $scope.data.tableData[i].title,
            cancel: true,
            app: 'projectBrowser',
            data: {
              pk: target,
              name: $scope.data.tableData[i].title,
              filesDetails:$scope.data.tableData[i].filesDetails
            },
            active: true
          })
        }
      }
    } else if (action == 'projectFields') {
      for (var i = 0; i < $scope.data.tableData.length; i++) {
        if ($scope.data.tableData[i].pk == parseInt(target)) {
          $scope.addTab({
            title: 'Project Field: ' + $scope.data.tableData[i].title,
            cancel: true,
            app: 'projectField',
            data: {
              pk: target,
              name: $scope.data.tableData[i].title
            },
            active: true
          })
        }
      }
    } else if (action == 'fileupload') {
      for (var i = 0; i < $scope.data.tableData.length; i++) {
        if ($scope.data.tableData[i].pk == parseInt(target)) {
          $scope.addTab({
            title: 'File Upload: ' + $scope.data.tableData[i].title,
            cancel: true,
            app: 'fileUpload',
            data: {
              pk: target,
              name: $scope.data.tableData[i].title
            },
            active: true
          })
        }
      }
    } else if (action == 'projectCC') {
      for (var i = 0; i < $scope.data.tableData.length; i++) {
        if ($scope.data.tableData[i].pk == parseInt(target)) {
          $scope.addTab({
            title: 'Consistancy Check: ' + $scope.data.tableData[i].title,
            cancel: true,
            app: 'projectCC',
            data: {
              pk: target,
              name: $scope.data.tableData[i].title
            },
            active: true
          })
        }
      }
    } else if (action == 'start') {
      for (var i = 0; i < $scope.data.tableData.length; i++) {
        if ($scope.data.tableData[i].pk == parseInt(target)) {
          $scope.addTab({
            title: 'Start Upload: ' + $scope.data.tableData[i].title,
            cancel: true,
            app: 'start',
            data: {
              pk: target,
              name: $scope.data.tableData[i].title
            },
            active: true
          })
        }
      }
    }else if (action == 'deleteOlderProjects') {

      $uibModal.open({
        templateUrl: '/static/ngTemplates/app.projects.deleteOlderProjects.html',
        size: 'md',
        backdrop: true,
        controller: function($scope, $uibModalInstance, $timeout, $http){

          $http({method : 'GET' , url : '/api/projects/retentionNotice/'}).
          then(function(response) {
            $scope.projects = response.data;
          })

          $scope.delete = function(indx) {
            $http({method : 'DELETE' , url : '/api/projects/project/' + $scope.projects[indx].pk + '/' }).
            then((function(indx) {
              $scope.projects.splice(indx , 1);
            })(indx))
          }

        },
      }).result.then(function() {
      }, function(data) {
      });




    }
  }

  $scope.completedTableAction = function(target, action, mode) {
    if (action == 'projectBrowser') {
      for (var i = 0; i < $scope.data.completeTableData.length; i++) {
        if ($scope.data.completeTableData[i].pk == parseInt(target)) {
          $scope.addTab({
            title: 'Browse project : ' + $scope.data.completeTableData[i].title,
            cancel: true,
            app: 'projectBrowser',
            data: {
              pk: target,
              name: $scope.data.completeTableData[i].title,
              filesDetails:$scope.data.completeTableData[i].filesDetails
            },
            active: true
          })
        }
      }
    } else if (action == 'projectFields') {
      for (var i = 0; i < $scope.data.completeTableData.length; i++) {
        if ($scope.data.completeTableData[i].pk == parseInt(target)) {
          $scope.addTab({
            title: 'Project Field: ' + $scope.data.completeTableData[i].title,
            cancel: true,
            app: 'projectField',
            data: {
              pk: target,
              name: $scope.data.completeTableData[i].title
            },
            active: true
          })
        }
      }
    } else if (action == 'fileupload') {
      for (var i = 0; i < $scope.data.completeTableData.length; i++) {
        if ($scope.data.completeTableData[i].pk == parseInt(target)) {
          $scope.addTab({
            title: 'File Upload: ' + $scope.data.completeTableData[i].title,
            cancel: true,
            app: 'fileUpload',
            data: {
              pk: target,
              name: $scope.data.completeTableData[i].title
            },
            active: true
          })
        }
      }
    } else if (action == 'start') {
      for (var i = 0; i < $scope.data.completeTableData.length; i++) {
        if ($scope.data.completeTableData[i].pk == parseInt(target)) {
          $scope.addTab({
            title: 'Start Upload: ' + $scope.data.completeTableData[i].title,
            cancel: true,
            app: 'start',
            data: {
              pk: target,
              name: $scope.data.completeTableData[i].title
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


app.controller('projectManagement.projects.menu', function($scope, $http, $aside, $state, Flash, $users, $filter, $permissions) {
  // settings main page controller

  var getState = function(input) {
    var parts = input.name.split('.');
    // console.log(parts);
    return input.name.replace('app', 'home')
  }

  $scope.apps = [];

  $scope.buildMenu = function(apps) {
    for (var i = 0; i < apps.length; i++) {
      var a = apps[i];
      var parts = a.name.split('.');
      if (a.module != 1 || parts.length != 3 || parts[1] != 'projects') {
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


app.controller('projectManagement.projects.cc', function($scope, $http, $aside, $state, Flash, $users, $filter, $permissions) {
  $scope.data = $scope.tab.data;
  console.log($scope.data,'llllllllllll');

  $scope.editCC = function(d) {
    console.log(d);

    $aside.open({
      templateUrl: '/static/ngTemplates/app.project.cc.aside.html',
      placement: 'left',
      size: 'xl',
      backdrop: true,
      controller:function($scope , pid , fid, $sce) {
        $scope.url = window.location.origin + '/project/CC/' + pid + '/' + fid
        $scope.url = $sce.trustAsResourceUrl($scope.url)

      },
      resolve: {
       pid: function () {
         return $scope.projectData.pk;
       },
       fid: function () {
         return d[d.length -1];
        }
      }
    }).result.then(function(evt) {
      $scope.getTableData()
    }, function(evt) {
      $scope.getTableData()
    });
  }

  $http({
    method: 'GET',
    url: '/api/projects/project/' + $scope.tab.data.pk + '/'
  }).
  then(function(response) {
    console.log(response.data);
    $scope.projectData = response.data;
  })

  $scope.page = 0

  $scope.getTableData = function(){

    $http({
      method: 'GET',
      url: '/api/projects/projectCCView/?projectpk='+$scope.tab.data.pk+'&limit=20&offset='+($scope.page*20)
    }).
    then(function(response) {
      $scope.fetchedData = response.data
      $scope.tableHead = $scope.fetchedData[0]
      $scope.tableData = $scope.fetchedData.slice(1,$scope.fetchedData.length-1)
      // for (var i = 0; i < $scope.tableData.length; i++) {
      //   for (var j = 0; j < $scope.tableData[i].length; j++) {
      //     console.log($scope.tableData[i][j]);
      //   }
      // }
      console.log($scope.fetchedData );
    })
  }
  $scope.getTableData()

  $scope.next = function() {
    $scope.page += 1;
    $scope.getTableData()
  }

  $scope.prev = function() {
    if ($scope.page == 0) {
      return;
    }
    $scope.page -= 1;
    $scope.getTableData()
  }

})
