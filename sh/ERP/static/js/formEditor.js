var app = angular.module('app', ['flash']);

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
app.controller('main', function($scope, $http, $timeout, Flash) {

  $scope.name = window.location.href.split('name=')[1]

  $http({method : 'GET' , url : '/getDynamicForm?name=' + $scope.name}).
  then(function(response) {
    $scope.dynamicForm = response.data;
    $scope.fields = response.data.fields;
  })


  $scope.connection = new autobahn.Connection({url: 'wss://ws.syrow.com/ws', realm: 'default'});

  $scope.onevent = function(args) {
    console.log(args);
    if (args[0][0] == "") {
      return;
    }

    if (args[0][0].indexOf('UIPATHRPC') != -1) {
      window.postMessage({type : 'UIPathIPC' , data : args[0][0] },"*");
      return;
    }

    $scope.logs.push(args[0][0].replace('\n' , ''))
    $scope.$apply()
  }

  $scope.connection.onopen = function (session) {
    $scope.session = session;
     // 1) subscribe to a topic

     $scope.session.subscribe('com.myapp.hello', $scope.onevent);

  };

  $scope.connection.open();

  $scope.connection.onclose = function(reason, details) {
    console.log("Disconnected");
    console.log(reason);
    console.log(details);

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
      dynamicForm: $scope.dynamicForm.pk,
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




});
