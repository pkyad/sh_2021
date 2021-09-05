var app = angular.module('app', []);

app.config(function($httpProvider) {

  $httpProvider.defaults.xsrfCookieName = 'csrftoken';
  $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
  $httpProvider.defaults.withCredentials = true;

});

app.directive('ngEnter', function () {
  return function (scope, element, attrs) {
    element.bind("keydown keypress", function (event) {
      if(event.which === 13) {
        scope.$apply(function (){
          scope.$eval(attrs.ngEnter);
        });
        event.preventDefault();
      }
    });
  };
});
// Main controller is mainly for the Navbar and also contains some common components such as clipboad etc
app.controller('main', function($scope, $http, $timeout) {

  $scope.runTimeData = "[]"
  $scope.runtime = false;

  if (window.location.href.indexOf('&data=')!=-1) {
    jsStr = window.location.href.split('&data=')[1];
    jsStr = jsStr.replace(/%22/g , '"')
    jsStr = jsStr.replace(/%20/g , ' ')
    $scope.runTimeData = jsStr
  }
  if (window.location.href.indexOf('runtime=1')!=-1) {
    $scope.runtime = true;

  }

  $scope.fileName = window.location.href.split('filePath=')[1]

  $http({method : 'GET' , url : '/api/ERP/getPythonFile/?fileName=' + $scope.fileName}).
  then(function(response) {
    $scope.file = response.data;
    if ($scope.file.fileContent != null) {
      $scope.editor.setValue($scope.file.fileContent, -1);

    }
    $timeout(function() {
      if ($scope.runtime) {
        $scope.run();
      }
    },2000)
  })

  $scope.save = function() {
    $http({method : 'PATCH' , url : '/api/ERP/pythonIDEFile/' + $scope.file.pk +'/' , data : {fileContent : $scope.editor.getValue()  , runTimeData : $scope.runTimeData} }).
    then(function(response) {
      $scope.saved = true;
    })
  }

  $scope.connection = new autobahn.Connection({url: WS_SERVER, realm: 'default'});

  $scope.onevent = function(args) {
    console.log(args);
    if (args[0][0] == "") {
      return;
    }

    if (args[0][0].indexOf('UIPATHRPC') != -1 ) {
      if ($scope.runtime) {
        window.postMessage({type : 'UIPathIPC' , data : args[0][0] },"*");
      }
      return;
    }

    $scope.logs.push(args[0][0].replace('\n' , ''))
    $scope.$apply()
  }



  $scope.connection.onopen = function (session) {
    $scope.session = session;
     // 1) subscribe to a topic

     $scope.session.subscribe('support.python.' + USER, $scope.onevent);

  };

  $scope.connection.open();

  $scope.connection.onclose = function(reason, details) {
    console.log("Disconnected");
    console.log(reason);
    console.log(details);

  }



  ace.require("ace/ext/language_tools");
  $scope.editor = ace.edit('aceEditor');
  $scope.editor.setTheme("ace/theme/chaos");
  console.log("ok");
  $scope.editor.getSession().setMode("ace/mode/python");
  $scope.editor.getSession().setUseWorker(false);
  $scope.editor.setHighlightActiveLine(false);
  $scope.editor.setShowPrintMargin(false);
  $scope.editor.setOptions({
    enableBasicAutocompletion: true,
    enableSnippets: true,
    enableLiveAutocompletion: false
  });
  $scope.editor.setFontSize("18px");
  $scope.editor.setBehavioursEnabled(true);


  $scope.logs = []
  $scope.done = false;
  $scope.run = function() {
    $scope.save()
    $scope.logs = []
    $http({method : 'POST' , url : '/pythonRunner/?mode=runDev' , data : {code : $scope.editor.getValue()  , env : USER , runTimeData : $scope.runTimeData }}).
    then(function(response) {
      console.log(response);
      if ($scope.runtime) {
        $scope.done = true;
        var window = remote.getCurrentWindow();
        window.close();
      }
    })
  }

  $scope.install = function(lib) {
    $scope.logs.push('$ ' + $scope.cmdText)
    $scope.cmdText = "";
    $http({method : 'POST' , url : '/pythonRunner/?mode=pip_install' , data : {lib : lib , env : USER  }}).
    then(function(response) {

      var status = response.data.status.split('\n')
      for (var i = 0; i < status.length; i++) {
        $scope.logs.push(status[i])
      }
    })
  }

  $scope.uninstall = function(lib) {
    $scope.logs.push('$ ' + $scope.cmdText)
    $scope.cmdText = "";
    $http({method : 'POST' , url : '/pythonRunner/?mode=pip_uninstall' , data : {lib : lib , env : USER  }}).
    then(function(response) {

      var status = response.data.status.split('\n')
      for (var i = 0; i < status.length; i++) {
        $scope.logs.push(status[i])
      }

    })
  }


  $scope.command = function() {
    var cmd = $scope.cmdText;
    cmd = cmd.replace(/\s\s+/g, ' ');

    if (cmd.indexOf('pip install') != -1) {
      $scope.install(cmd.split(' ')[2])
    }
    if (cmd.indexOf('pip uninstall') != -1) {
      $scope.install(cmd.split(' ')[2])
    }

  }

  // $scope.uninstall("pandas")
  // $scope.install("pandas")



});
