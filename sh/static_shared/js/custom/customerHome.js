var app = angular.module('app', [ 'ui.bootstrap','flash']);

app.config(function($httpProvider) {
  $httpProvider.defaults.xsrfCookieName = 'csrftoken';
  $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
  $httpProvider.defaults.withCredentials = true;
});


// Main controller is mainly for the Navbar and also contains some common components such as clipboad etc
app.controller('customerHome', function($scope,$http, $timeout) {
  $scope.headerUrl = '/static/ngTemplates/customerHeader.html',
  $scope.headerTitle = 'Customer Connect Portal'
  $scope.bodyUrl = '/static/ngTemplates/customerBody.html',
  $scope.brandLogo = BRAND_LOGO;
  $scope.custType = CUST_TYPE;
  $scope.sessionId = SESSION_ID;

  $scope.logout = function(){
    console.log('logoutttttttt');
    document.cookie = 'customerSessionId=; expires=Thu, 01 Jan 1970 00:00:01 GMT;;path=/'
    window.location.href='/customer/login'
  }

  document.getElementById("goTop").style.display = "none"
  $(window).scroll(function(event) {
    var scroll = $(window).scrollTop();
    if (scroll > 80) {
      document.getElementById("goTop").style.display = "block"
    } else {
      document.getElementById("goTop").style.display = "none"
    }
  });
  $scope.goToTop = function() {
    $("html, body").animate({ scrollTop: 0 }, 200);
  }

});

app.controller('customerbody', function($scope,$http, $timeout,Flash) {
  console.log($scope.custType);
  $scope.randomClr = function(){
    color = "hsl(" + Math.random() * 360 + ", 100%, 97%)";
    return color;
  }
  if ($scope.custType=='client') {
    var url = '/api/clientRelationships/customerAccessData/?sessionId='+$scope.sessionId+'&typ=getAllData&custTyp=client'
  }else {
    var url = '/api/clientRelationships/customerAccessData/?sessionId='+$scope.sessionId+'&typ=getAllData&custTyp=invoice'
  }
  $http({
    method:'get',
    url:url
  }).
  then(function(response){
    console.log(response.data);
    $scope.customerData = response.data
  })

  $scope.resetForm = function() {
    $scope.today = new Date()
    dayAftTom = new Date($scope.today.setDate($scope.today.getDate()+2))
    $scope.form = {
      'title': '',
      'priority': 'low',
      'fil' : emptyFile,
      'description' : '',
      'tentresdt': dayAftTom,
      'selectedProject': null,
    }
  }
  $scope.resetForm();


  $scope.saveBug = function() {
    // console.log($scope.form);
    if ($scope.form.title.length == 0) {
      Flash.create('danger', 'Please Mention Some Title')
      return
    }
    if ($scope.form.description.length == 0) {
      Flash.create('danger', 'Please Write Some Steps To Reproduce The Bug')
      return
    }
    if ($scope.customerData.companyProjects.length==1) {
      $scope.form.selectedProject = $scope.customerData.companyProjects[0].pk
    }else if ($scope.form.selectedProject==null) {
      Flash.create('danger', 'Please Select The Project')
      return
    }

    var fd = new FormData();
    fd.append('title', $scope.form.title);
    fd.append('priority', $scope.form.priority);
    fd.append('description', $scope.form.description);
    fd.append('project', $scope.form.selectedProject);
    fd.append('tentresdt', $scope.form.tentresdt.toJSON().split('T')[0]);
    if ($scope.form.fil != emptyFile) {
      fd.append('fil', $scope.form.fil)
    }
    $http({
      method: 'POST',
      url: '/api/clientRelationships/customerAccessData/?typ=bug',
      data: fd,
      transformRequest: angular.identity,
      headers: {
        'Content-Type': undefined
      }
    }).
    then(function(response) {
      $scope.resetForm();
      Flash.create('success', 'Saved');
      // console.log(response.data);
    });
  }
})
