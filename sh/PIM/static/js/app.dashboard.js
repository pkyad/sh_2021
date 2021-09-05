function getPreviousMonday()
{
    var date = new Date();
    var day = date.getDay();
    var prevMonday;
    if(date.getDay() == 0){
        prevMonday = new Date().setDate(date.getDate() - 7);
    }
    else{
        prevMonday = new Date().setDate(date.getDate() - day);
    }

    return prevMonday;
}

app.controller("controller.home", function($scope, $state ,$uibModal,$http,Flash) {

  $scope.statsMode = 'today';

  $scope.$watch('statsMode' , function(newValue , oldValue) {
    var dt = new Date()

    dt = new Date(dt.getTime() + 60*60*24*1000);

    var today = dt.toISOString().split('T')[0]
    if (newValue == 'week') {
      dt = new Date(getPreviousMonday())
    }else if (newValue == 'month') {
      var date = new Date();
      dt = new Date(date.getFullYear(), date.getMonth(), 1);
    }else{
      dt = new Date()
    }
    dtStr = dt.toISOString().split('T')[0]
    $http({method : 'GET' , url : '/api/projects/getPerformanceReport/?stDate='+ dtStr +'&edDate=' + today }).
    then(function(response) {
      var d = response.data;
      $scope.stats = [
        {name : "Tasks points" , value : d.generalTasks },
        {name : "Coding Count" , value : d.counts.codingCount },
        {name : "QC Count" , value : d.counts.qcCount },
        {name : "LDD Coding Count" , value : d.counts.lddcoderCount },
        {name : "LDD QC Count" , value : d.counts.lddqcCount },
        {name : "Mistakes (%)" , value : d.counts.wpercent },
        {name : "Coding Points" , value : d.points.coding + d.points.recoding },
        {name : "QC Points" , value : d.points.qa + d.points.reqa},
        {name : "Total Points" , value : d.points.total },
        {name : "Coding / QC Terget" , value : d.target },
      ]
    })

  })



  $scope.showDocs = function(indx) {
    $uibModal.open({
      templateUrl: '/static/ngTemplates/app.projects.files.modal.html',
      size: 'md',
      backdrop : true,
      resolve : {
        project : function() {
          return $scope.allProjectsData[indx]
        }
      },
      controller: function($scope , $http , $uibModalInstance , project){
        console.log(project);
        $scope.project = project;
      },
    })

  }

  $scope.fetchAllProjects = function(){
    return $http.get('/api/projects/projectDashboard/?dashboardProjects').
    then(function(response) {
      $scope.allProjectsData = response.data;
    })
  }
  $scope.fetchAllProjects ()

  $scope.lmt = 0
  $scope.annoucementsData = []
  $scope.loadMore = false
  $scope.fetchAnnouncements = function(){
    $scope.lmt += 10
    return $http.get('/api/HR/announcements/?limit='+$scope.lmt).
    then(function(response) {
      $scope.annoucementsData = response.data.results;
      if (response.data.next) {
        $scope.loadMore = true
      }else {
        $scope.loadMore = false
      }
    })
  }
  $scope.fetchAnnouncements ()

  $scope.deleteAnnouncement = function(idx) {
    $http({method : 'DELETE' , url : '/api/HR/announcements/' + $scope.annoucementsData[idx].pk + '/' }).
    then(function(response) {
      Flash.create('danger' , 'Deleted')
    })
    $scope.annoucementsData.splice(idx , 1)

  }

  $scope.openAnnouncement = function() {
    $uibModal.open({
      templateUrl: '/static/ngTemplates/app.home.dashboard.announcementForm.html',
      size: 'md',
      backdrop: true,
      controller: function($scope, $uibModalInstance) {
        console.log('announcementttttttt');
        $scope.teamSearch = function(query) {
          return $http.get('/api/HR/team/?limit=10&title__icontains=' + query).
          then(function(response) {
            return response.data.results;
          })
        };
        $scope.form = {
          message: '',
          fil: emptyFile,
          toAll:false,
          toTeam:''
        }

        $scope.saveAnnouncement = function() {
          if ($scope.form.message==null||$scope.form.message.length==0) {
            Flash.create('danger', 'Message Is Required');
            return
          }
          if ((!$scope.form.toAll) && (typeof $scope.form.toTeam != 'object' || $scope.form.toTeam.pk == undefined)) {
            Flash.create('warning', 'Please Select A team');
            return
          }
          var fd = new FormData();


          fd.append('message', $scope.form.message);
          if (typeof $scope.form.fil != 'string' && $scope.form.fil!=emptyFile) {
            fd.append('fil', $scope.form.fil);
          }
          if ($scope.form.toAll) {
            fd.append('toAll', $scope.form.toAll);
          }else {
            fd.append('toTeam', $scope.form.toTeam.pk);
          }


          $http({
            method: 'POST',
            url: '/api/HR/announcements/',
            data: fd,
            transformRequest: angular.identity,
            headers: {
              'Content-Type': undefined
            }
          }).
          then(function(response) {
          Flash.create("success",'Saved')
          $uibModalInstance.dismiss(response.data);
          })
        }
      }
    }).result.then(function(f) {
    }, function(f) {
      if (typeof f== 'object' && f.pk) {
        $scope.annoucementsData.unshift(f)
      }
    });
  }

})
