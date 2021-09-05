app.config(function($stateProvider) {

  $stateProvider
    .state('projectManagement', {
      url: "/projectManagement",
      views: {
        "": {
          templateUrl: '/static/ngTemplates/projectManagement.html',
        },
        "menu@projectManagement": {
          templateUrl: '/static/ngTemplates/projectManagement.menu.html',
          controller: 'projectManagement.menu'
        },
        "@projectManagement": {
          templateUrl: '/static/ngTemplates/projectManagement.dash.html',
          controller: 'projectManagement'
        }
      }
    })

});

app.controller('projectManagement', function($scope, $users, Flash,$http) {
  // main businessManagement tab default page controller
  $scope.fetchProjectData = function() {
    $http({
      method: 'GET',
      url: '/api/projects/dashboardprojectmgmt/',
    }).
    then(function(response) {
      $scope.projectData = response.data;
    })
  }
  $scope.fetchProjectData()


  new Chart(document.getElementById("project-mixed-chart"), {
    type: 'bar',
    data: {
      labels: ["2013","2014","2015", "2016", "2017", "2018"],
      datasets: [{
        label: "Monomerce",
        type: "line",
        borderColor: "#df8f45",
        data: [300,130,200,408, 747, 875, -634],
        lineTension: 0,
        fill: false
      }, {
        label: "Syrow",
        type: "line",
        borderColor: "#78c4a4",
        data: [133, -321,170, -783, 1278,350,160],
        lineTension: 0,
        fill: false
      }, {
        label: "Tutors24",
        type: "bar",
        backgroundColor: "rgba(106, 147, 154, 0.38)",
        data: [408, 547, 675, -734,300,230],
      }, {
        label: "EpsilonAI",
        type: "bar",
        backgroundColor: "rgba(106, 147, 154, 0.38)",
        backgroundColorHover: "#3e95cd",
        data: [133, 221, -783, 2478,160,350]
      }]
    },
    options: {
      scales: {
        xAxes: [{
          barPercentage: 0.4
        }]
      },
      title: {
        display: true,
        text: ''
      },
      legend: {
        display: false
      }
    }
  });


  new Chart(document.getElementById("Projectexpense-bar-chart"), {
    type: 'bar',
    data: {
      labels: ["Software engineer", "Systems analyst", "Business analyst", "Technical support", "Network engineer", "Technical consultant"],
      datasets: [{
        label: "",
        backgroundColor: ["#dfde3e", "#63c4e8", "#ed9941", "#5acd24", "#f9594d", "#4dcf56","#63c4e8", "#ed9941", "#5acd24"],
        data: [50, 78, 40, 60, 75, 68,30,48,56]
      }]
    },
    options: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: ''
      }
    }
  });

});

app.controller('projectManagement.menu', function($scope, $users, Flash, $permissions) {
  // main businessManagement tab default page controller

  $scope.apps = [];

  $scope.buildMenu = function(apps) {
    for (var i = 0; i < apps.length; i++) {
      var a = apps[i];
      var parts = a.name.split('.');
      if (a.module != 10 || a.name.indexOf('app') == -1 || parts.length != 2) {
        continue;
      }
      a.state = a.name.replace('app', 'projectManagement')
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
});
