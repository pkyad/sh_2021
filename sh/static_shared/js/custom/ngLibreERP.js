var app = angular.module('app', ['ui.router', 'ui.bootstrap', 'ngSanitize', 'ngAside', 'ngDraggable', 'flash', 'chart.js', 'ngTagsInput', 'ui.tinymce', 'hljs', 'mwl.confirm', 'ngAudio', 'uiSwitch', 'rzModule']);

app.config(function($stateProvider, $urlRouterProvider, $httpProvider, $provide, hljsServiceProvider) {
  hljsServiceProvider.setOptions({
    // replace tab with 4 spaces
    tabReplace: '    '
  });

  $urlRouterProvider.otherwise(DEFAULT_STATE);
  $httpProvider.defaults.xsrfCookieName = 'csrftoken';
  $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
  $httpProvider.defaults.withCredentials = true;


});

app.run(['$rootScope', '$state', '$stateParams', '$permissions', function($rootScope, $state, $stateParams, $permissions) {
  $rootScope.$state = $state;
  $rootScope.$stateParams = $stateParams;
  $rootScope.$on("$stateChangeError", console.log.bind(console));
}]);


// Main controller is mainly for the Navbar and also contains some common components such as clipboad etc
app.controller('main', function($scope, $state, $users, $aside, $http, $timeout, $uibModal, $permissions, ngAudio) {
  $scope.me = $users.get('mySelf');
  $scope.headerUrl = '/static/ngTemplates/header.html',
    $scope.sideMenu = '/static/ngTemplates/sideMenu.html',
    $scope.themeObj = {
      main: '#005173',
      highlight: '#04414f'
    };
  $scope.dashboardAccess = false;
  $scope.brandLogo = BRAND_LOGO;
  $scope.toolName = toolName;

  function setCookie(cname,cvalue,exdays) {
        var d = new Date();
        d.setTime(d.getTime() + (exdays*24*60*60*1000));
        var expires = "expires=" + d.toGMTString();
        document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
    }

    function getCookie(cname) {
        var name = cname + "=";
        var decodedCookie = decodeURIComponent(document.cookie);
        var ca = decodedCookie.split(';');
        for(var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "";
    }



  $scope.mobileView=false;

  setInterval(function(){

    if($(window).width() < 600) {
      document.getElementById('mainUI').addEventListener('click', function() {
          if($(window).width() < 600) {
          $scope.sideMenuVisibility=false
        }

      })

        $scope.mobileView=true;
        if(!$scope.sideMenuVisibility)
          {
            document.getElementById('navbarTop').style.margin='0%';
            document.getElementById('mainUIParent').style.width='100%';
            document.getElementById('sideMenu').style.display='none'
          }
    }else{
        $scope.mobileView=false;
    }
  },10)
    // $(window).on('mouseover', function() {
    //
    // })


  $scope.onHover=false;
  console.log($scope.onHover);
  $scope.sideMenuVisibility = false;
    // retrive it back
  $permissions.module().
  success(function(response) {
    // console.log(response);
    $scope.modules = response;
    if ($scope.modules.length == 1) {
      // console.log($state);
      // console.log($state.current.name);
      if ($state.current.name.split('.').length == 1) {
        // $state.go($scope.modules[0].name);
      }
    }

  });


  $http({
    method: 'GET',
    url: '/api/PIM/settings/' + $scope.me.settings + '/'
  }).
  then(function(response) {
    for (key in response.data.theme) {
      if (key != 'url') {
        if (response.data.theme[key] != null) {
          $scope.themeObj[key] = response.data.theme[key];
        }
      }
    }
  }, function(response) {});

  $scope.sound = ngAudio.load("/static/audio/notification.ogg");

  $scope.theme = ":root { --themeMain: " + $scope.themeObj.main + ";--headerNavbarHighlight:" + $scope.themeObj.highlight + "; }";
  $scope.$watchGroup(['themeObj.main', 'themeObj.highlight'], function(newValue, oldValue) {
    $scope.theme = ":root { --themeMain: " + $scope.themeObj.main + ";--headerNavbarHighlight:" + $scope.themeObj.highlight + "; }";
  })

  $scope.terminal = {
    command: '',
    show: false,
    showCommandOptions: false
  };

  $scope.about = function() {
    var modalInstance = $uibModal.open({
      templateUrl: '/static/ngTemplates/about.html',
      size: 'lg',
      controller: function($scope) {},
    });
  };

  $scope.commandOptionsClicked = function(action) {
    if (action == 'im') {
      $scope.addIMWindow($scope.terminal.command.pk)
    } else if (action == 'social') {
      $state.go('home.social', {
        id: $scope.terminal.command.pk
      })
    }
    $scope.terminal = {
      command: '',
      show: false,
      showCommandOptions: false
    };
  }

  $scope.userSearch = function(query) {
    if (!query.startsWith('@')) {
      return;
    }
    var searchQuery = query.split('@')[1]
    if (searchQuery.length == 0) {
      return;
    }
    return $http.get('/api/HR/userSearch/?username__contains=' + searchQuery).
    then(function(response) {
      return response.data;
    })
  };
  $scope.getName = function(u) {
    if (typeof u == 'undefined' || u == null || u.username == null || typeof u.first_name == 'undefined') {
      return '';
    }
    return '@ ' + u.first_name + '  ' + u.last_name;
  }

  $scope.$watch('terminal.command.username', function(newValue, oldValue) {
    console.log(newValue);
    if (typeof newValue != 'undefined') {
      $scope.terminal.showCommandOptions = true;
    }
  });

  $scope.parseCommand = function() {
    if ($scope.terminal.command == '') {
      $scope.terminal.show = false;
      return;
    }
    // parse the command
    // possible commands for the calendar app :
    // 'remind me to ask bill for the report on the project'
    // arrange a meeting with @team ELMS at 2 pm on alternate working day
    // todo code review by EOD
    var cmd = $scope.terminal.command;
    if (typeof cmd == 'string' && cmd.startsWith('@')) {
      // user is searching for a user



    }

  };


  $scope.$watch('terminal.show', function(newValue, oldValue) {
    // once the termial is visible the timer starts , after 150 seconds is there is no command
    // in the termial then the terminal is closed
    if (newValue == false) {
      return;
    }
    $timeout(function() {
      if ($scope.terminal.command.length == 0) {
        $scope.closeTerminal();
      }
    }, 150000);
  });

  $scope.closeTerminal = function() {
    if ($scope.terminal.command.length == 0) {
      $scope.terminal.show = false;
    }
  }



  settings = {
    theme: $scope.themeObj,
    mobile: $scope.me.profile.mobile
  };
  $scope.openSettings = function(position, backdrop, data) {
    $scope.asideState = {
      open: true,
      position: position
    };

    function postClose() {
      $scope.asideState.open = false;
      $scope.me = $users.get('mySelf', true)
    }

    $aside.open({
      templateUrl: '/static/ngTemplates/settings.html',
      placement: position,
      size: 'md',
      backdrop: backdrop,
      controller: function($scope, $uibModalInstance, $users, $http, Flash) {
        emptyFile = new File([""], "");
        $scope.settings = settings;
        $scope.settings.displayPicture = emptyFile;
        $scope.me = $users.get('mySelf');
        $scope.statusMessage = '';
        $scope.settings.oldPassword = '';
        $scope.settings.password = '';
        $scope.settings.password2 = '';
        $scope.cancel = function(e) {
          $uibModalInstance.dismiss();
          // e.stopPropagation();
        };

        $scope.changePassword = function() {
          if ($scope.settings.password != '' && $scope.settings.password2 == $scope.settings.password && $scope.settings.oldPassword != '') {
            $http({
              method: 'PATCH',
              url: '/api/HR/users/' + $scope.me.pk + '/',
              data: {
                password: $scope.settings.password,
                oldPassword: $scope.settings.oldPassword
              }
            }).
            then(function(response) {
              Flash.create('success', response.status + ' : ' + response.statusText);
            }, function(response) {
              Flash.create('danger', response.status + ' : ' + response.statusText);
            });
          }
        }

        $scope.saveSettings = function() {
          var fdProfile = new FormData();
          if ($scope.settings.displayPicture != emptyFile) {
            fdProfile.append('displayPicture', $scope.settings.displayPicture);
          }
          if (isNumber($scope.settings.mobile)) {
            fdProfile.append('mobile', $scope.settings.mobile);
          }
          $http({
            method: 'PATCH',
            url: '/api/HR/profile/' + $scope.me.profile.pk + '/',
            data: fdProfile,
            transformRequest: angular.identity,
            headers: {
              'Content-Type': undefined
            }
          }).
          then(function(response) {
            $http({
              method: 'PATCH',
              url: '/api/PIM/settings/' + $scope.me.settings + '/',
              data: {
                presence: "Busy",
                user: $scope.me.pk
              }
            }).
            then(function(response) {
              $http({
                method: 'PATCH',
                url: '/api/PIM/theme/' + response.data.theme.pk + '/',
                data: $scope.settings.theme
              }).
              then(function(response) {
                $scope.changePassword();
                Flash.create('success', response.status + ' : ' + response.statusText);
              }, function(response) {
                $scope.changePassword();
                Flash.create('danger', response.status + ' : ' + response.statusText);
              });
            });
          });

        }
      }
    }).result.then(postClose, postClose);
  }

  

  $scope.notificationClicked = function(pk) {
    // one the notification was clikced the directive will call this function. here i will mark the notification in the dropdown read
    for (var i = 0; i < $scope.rawNotifications.length; i++) {
      if ($scope.rawNotifications[i].pk == pk) {
        $scope.rawNotifications[i].read = true;
      }
    }
    $scope.refreshNotification();
  }


  $scope.imWindows = []

  $scope.addIMWindow = function(pk) {
    // console.log(pk);
    url = $users.get(pk).url;
    for (var i = 0; i < $scope.rawMessages.length; i++) {
      if ($scope.rawMessages[i].originator == pk && $scope.rawMessages[i].read == false) {
        $scope.rawMessages[i].read = true;
      }
    }
    $scope.refreshMessages();
    if ($scope.imWindows.length <= 4) {
      for (var i = 0; i < $scope.imWindows.length; i++) {
        if ($scope.imWindows[i].url == url) {
          return;
        }
      }
      me = $users.get("mySelf");
      if (url != me.url.split('?')[0]) {
        friend = $users.get(url)
        $scope.imWindows.push({
          url: url,
          username: friend.username
        });
      }
    }
  }
  $scope.fetchAddIMWindow = function(msgPK) {
    $scope.sound.play();
    $http({
      method: 'GET',
      url: '/api/PIM/chatMessage/' + msgPK + '/?mode='
    }).
    then(function(response) {
      $scope.addIMWindow(response.data.originator)
      response.data.read = true;
      $scope.rawMessages.unshift(response.data);
      $scope.refreshMessages()
    });
  };


  $scope.closeIMWindow = function(pos) {
    $scope.imWindows.splice(pos, 1);
  }

});

app.controller('controller.generic.menu', function($scope, $http, $aside, $state, Flash, $users, $filter, $permissions) {
  // settings main page controller

  var parts = $state.current.name.split('.');
  $scope.moduleName = parts[0];
  $scope.appName = parts[1];

  var getState = function(input) {
    var parts = input.name.split('.');
    // console.log(parts);
    return input.name.replace('app', $scope.moduleName)
  }

  $scope.apps = [];
  $scope.rawApps = [];

  $scope.buildMenu = function(apps) {
    for (var i = 0; i < apps.length; i++) {
      var a = apps[i];
      var parts = a.name.split('.');
      if (parts.length != 3 || parts[1] != $scope.appName) {
        continue;
      }
      a.state = getState(a)
      a.dispName = parts[parts.length - 1];
      $scope.apps.push(a);
    }
  }

  var as = $permissions.apps();
  if (typeof as.success == 'undefined') {
    $scope.rawApps = as;
    $scope.buildMenu(as);
  } else {
    as.success(function(response) {
      $scope.buildMenu(response);
      $scope.rawApps = response;
    });
  };

  $scope.getIcon = function() {
    if ($scope.rawApps.length == 0) {
      return ''
    } else {
      for (var i = 0; i < $scope.rawApps.length; i++) {
        if ($scope.rawApps[i].name == 'app.' + $scope.appName) {
          return $scope.rawApps[i].icon;
        }
      }
    }
  };

  $scope.goToRoot = function() {
    $state.go($scope.moduleName + '.' + $scope.appName)
  }

  $scope.isActive = function(index) {
    var app = $scope.apps[index]
    if (angular.isDefined($state.params.app)) {
      return $state.params.app == app.name.split('.')[2]
    } else {
      return $state.is(app.name.replace('app', $scope.moduleName))
    }
  }

});

// Main controller is mainly for the Navbar and also contains some common components such as clipboad etc
app.controller('sideMenu', function($scope, $http, $aside, $state, Flash, $users, $filter, $permissions, $rootScope, $timeout) {

  $scope.user = $users.get('mySelf');

  $scope.SHOW_COMMON_APPS = SHOW_COMMON_APPS;

  $scope.fixedApps = [
    // {icon : 'home' , state : 'home'},
    // {icon : 'envelope-o' , state : 'home.mail'},
    // {icon : 'calendar' , state : 'home.calendar'},
    // {icon : 'sticky-note-o' , state : 'home.notes'},
  ]

  var parts = $state.current.name.split('.');

  $scope.moduleName = parts[0];
  $scope.appName = parts[1];
  $scope.rawApps = $permissions.apps();
  $scope.modules = $permissions.module();

  if (typeof $scope.modules.success != 'undefined') {
    $scope.modules.success(function(response) {
      $scope.modules = response;
    });
  }


  $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams, options) {
    // if (toState.name == $scope.moduleName) {
    //   return;
    // }
    $scope.moduleName = toState.name.split('.')[0];
    if (typeof $scope.rawApps.success == 'undefined') {
      $scope.rawApps = $scope.rawApps;
      $scope.buildMenu();
    } else {
      $scope.rawApps.success(function(response) {
        $scope.rawApps = response;
        $scope.buildMenu();
      });
    };
  });

  $scope.inExcludedApps = function(a) {
    var apps = ['app.mail' , 'app.calendar' , 'app.dashboard' , 'app.notes', 'app.users']
    for (var i = 0; i < apps.length; i++) {
      if (a.name == apps[i]) {
        return true;
      }
    }
    return false;
  }

  var getState = function(input) {
    var parts = input.name.split('.');
    if (parts[0] == 'sudo') {
      return input.name.replace('sudo', $scope.moduleName)
    }else {
      return input.name.replace('app', $scope.moduleName)
    }
  }

  $scope.buildMenu = function() {
    $timeout(function() {
      $scope.apps = [];
      for (var i = 0; i < $scope.modules.length; i++) {
        if ($scope.modules[i].name == $scope.moduleName) {
          for (var j = 0; j < $scope.rawApps.length; j++) {
            if ($scope.rawApps[j].module == $scope.modules[i].pk ) {
              var a = $scope.rawApps[j];
              var parts = a.name.split('.');
              if (parts.length>2 || $scope.inExcludedApps(a)) {
                continue;
              }
              a.state = getState(a)
              a.dispName = parts[parts.length - 1];
              $scope.apps.push(a);
            }
          }
        }
      }
    },1000)

  }



  $scope.getIcon = function() {
    if ($scope.rawApps.length == 0) {
      return ''
    } else {
      for (var i = 0; i < $scope.rawApps.length; i++) {
        if ($scope.rawApps[i].name == 'app.' + $scope.appName) {
          return $scope.rawApps[i].icon;
        }
      }
    }
  };

  $scope.goToRoot = function() {
    $state.go($scope.moduleName + '.' + $scope.appName)
  }

  $scope.isActive = function(index) {
    var app = $scope.apps[index]
    if (angular.isDefined($state.params.app)) {
      return $state.params.app == app.name.split('.')[2]
    } else {
      return $state.is(app.name.replace('app', $scope.moduleName))
    }
  }

})
