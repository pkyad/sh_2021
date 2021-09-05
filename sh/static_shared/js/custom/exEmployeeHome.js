var app = angular.module('app', [ 'ui.bootstrap','flash']);

app.config(function($httpProvider) {
  $httpProvider.defaults.xsrfCookieName = 'csrftoken';
  $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
  $httpProvider.defaults.withCredentials = true;
});


// Main controller is mainly for the Navbar and also contains some common components such as clipboad etc
app.controller('exEmployeeHomeCtrl', function($scope,$http, $timeout) {
  $scope.headerUrl = '/static/ngTemplates/customerHeader.html',
  $scope.headerTitle = 'Ex - employee Dashboard'
  $scope.bodyUrl = '/static/ngTemplates/exEmployeeBody.html',
  $scope.brandLogo = BRAND_LOGO;
  $scope.sessionId = SESSION_ID;

  $scope.logout = function(){
    console.log('logoutttttttt');
    document.cookie = 'exEmployeeSessionId=; expires=Thu, 01 Jan 1970 00:00:01 GMT;;path=/'
    window.location.href='/exEmployee/login'
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

app.controller('exEmployeeBody', function($scope,$http, $timeout,Flash) {
  $http({
    method:'get',
    url:'/api/HR/exEmployeeAccessData/?sessionId='+$scope.sessionId+'&typ=getAllData'
  }).
  then(function(response){
    console.log(response.data);
    $scope.exEmpData = response.data
  })
})
