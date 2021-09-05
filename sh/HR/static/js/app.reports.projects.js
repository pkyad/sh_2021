app.controller('projectManagement.reports.projects', function($scope, $http, $aside, $state, Flash, $users, $filter, $permissions, $stateParams) {
  $scope.projectsData = []
  $scope.timesData = [{val:0,name:'00 AM'},{val:1,name:'01 AM'},{val:2,name:'02 AM'},{val:3,name:'03 AM'},{val:4,name:'04 AM'},{val:5,name:'05 AM'},{val:6,name:'06 AM'},{val:7,name:'07 AM'},{val:8,name:'08 AM'},{val:9,name:'09 AM'},{val:10,name:'10 AM'},{val:11,name:'11 AM'},{val:12,name:'12 PM'},{val:13,name:'01 PM'},{val:14,name:'02 PM'},{val:15,name:'03 PM'},{val:16,name:'04 PM'},{val:17,name:'05 PM'},{val:18,name:'06 PM'},{val:19,name:'07 PM'},{val:20,name:'08 PM'},{val:21,name:'09 PM'},{val:22,name:'10 PM'},{val:23,name:'11 PM'}]

  $scope.getProjects = function() {
    $http({
      method: 'GET',
      url: '/api/projects/project/?limit=10&offset=' + ($scope.page)*10
    }).
    then(function(response) {
      for (var i = 0; i < response.data.results.length; i++) {
        $scope.projectsData.push(response.data.results[i])
      }
    })
  }

  $scope.page = 0

  $scope.getProjects()

  $scope.more = function() {
    $scope.page += 1
    $scope.getProjects()
  }


  var today = new Date()
  var todayCP = new Date()
  var tomarrow = new Date(todayCP.setDate(todayCP.getDate() + 1))
  $scope.openData = function(obj){
    obj.showData=!obj.showData
    if (obj.statsData==undefined) {
      obj.stDate = new Date(today.getFullYear(),today.getMonth(),today.getDate(),0)
      obj.edDate = new Date(tomarrow.getFullYear(),tomarrow.getMonth(),tomarrow.getDate(),0)
      obj.stTime = "0"
      obj.edTime = "0"
      setTimeout(function () {
        obj.codingObj = new Chart(document.getElementById("coding"+obj.pk).getContext("2d"), {
          type: 'line',
          data: {
            labels: [],
            datasets: [{
              label: "Coding",
              type: "line",
              borderColor: "#e4dd2f",
              data: [],
              fill: false,
              lineTension: 0,
            }]
          },
          options: {title: {display: true,text: 'Coding'},legend: {display: false}}
        });

        obj.qcObj = new Chart(document.getElementById("qc"+obj.pk).getContext("2d"), {
          type: 'line',
          data: {
            labels: [],
            datasets: [{
              label: "Qc",
              type: "line",
              borderColor: "#2fe48d",
              data: [],
              fill: false,
              lineTension: 0,
            }]
          },
          options: {title: {display: true,text: 'Qc'},legend: {display: false}}
        });

        obj.recodingObj = new Chart(document.getElementById("recoding"+obj.pk).getContext("2d"), {
          type: 'line',
          data: {
            labels: [],
            datasets: [{
              label: "Re Coding",
              type: "line",
              borderColor: "#2faee4",
              data: [],
              fill: false,
              lineTension: 0,
            }]
          },
          options: {title: {display: true,text: 'Re Coding'},legend: {display: false}}
        });

        obj.reqcObj = new Chart(document.getElementById("reqc"+obj.pk).getContext("2d"), {
          type: 'line',
          data: {
            labels: [],
            datasets: [{
              label: "Re Qc",
              type: "line",
              borderColor: "#e4802f",
              data: [],
              fill: false,
              lineTension: 0,
            }]
          },
          options: {title: {display: true,text: 'Re Qc'},legend: {display: false}}
        });

        $scope.fetchData(obj)
      }, 500);

    }
  }
  $scope.chnageTime = function(typ,obj){
    if (typ=='start') {
      obj.stDate = new Date(obj.stDate.getFullYear(),obj.stDate.getMonth(),obj.stDate.getDate(),parseInt(obj.stTime))
    }else {
      obj.edDate = new Date(obj.edDate.getFullYear(),obj.edDate.getMonth(),obj.edDate.getDate(),parseInt(obj.edTime))
    }
  }
  $scope.fetchData = function(obj){
    if (obj.edDate-obj.stDate<0) {
      Flash.create('danger','End Date Should Be Greater Than Start Date')
      return
    }
    $http({
      method: 'GET',
      url: '/api/projects/getProjectReports/?projectPk='+obj.pk+'&stDate='+obj.stDate.toJSON()+'&edDate='+obj.edDate.toJSON()
    }).
    then(function(response) {
      console.log(response.data);
      obj.statsData = response.data
      obj.codingObj.data.labels = response.data.codingLabels
      obj.codingObj.data.datasets[0].data = response.data.codingData
      obj.qcObj.data.labels = response.data.qcLabels
      obj.qcObj.data.datasets[0].data = response.data.qcData
      obj.recodingObj.data.labels = response.data.recodingLabels
      obj.recodingObj.data.datasets[0].data = response.data.recodingData
      obj.reqcObj.data.labels = response.data.reqcLabels
      obj.reqcObj.data.datasets[0].data = response.data.reqcData
      obj.codingObj.update();
      obj.qcObj.update();
      obj.recodingObj.update();
      obj.reqcObj.update();
    })

  }
})
