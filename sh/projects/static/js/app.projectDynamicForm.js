function getName(str){
  console.log(str);
  var prts = []
  if (str.indexOf(';') != -1  ) {
    prts = str.split(';')
  } else if (str.indexOf('\n') != -1  ) {
    prts = str.split('\n')
  }else{
    prts = [str]
  }

  console.log(prts);
  namesToReturn = []

  for (var i = 0; i < prts.length; i++) {
    var prts2 = prts[i].split(' ')
    console.log(prts2);

    if (prts[i] == "") {
      continue;
    }

    if (prts2.length == 1) {
      return [{ firstName : prts[i]  ,middleName : "" , lastName : "" , prefix : "" , company : ""}]
    }

    var compName = prts[i].match(/\@(.*)\./);

    if (compName == null) {
      compName = ""
    }else{
      compName = compName.pop()
    }

    if (prts[i].toLowerCase().indexOf(' of ') != -1 &&   prts[i].indexOf('@') == -1  ) {
      compName = prts[i].substring(prts[i].toLowerCase().indexOf(' of ')+4, prts[i].length)
    }

    if (prts2[0] == "") {
      prts2.splice(0,1)
    }

    var prfx = 0;
    var prefixTemp = ""
    var firstNameTemp = ""
    var middleNameTemp = ""
    var lastName = ""
    if (prts2[0].indexOf('.')  != -1 ) {
      prefixTemp = prts2[0].replace(',', '').replace('.', '')

      if (prts2[1].indexOf(',')  != -1 ) {
        lastName = prts2[1].replace(',', '').replace('.', '')

        if (prts2.length > 2) {
          firstNameTemp = prts2[2]
        }
        if (prts2.length > 3) {
          middleNameTemp = prts2[3]
        }


      }else{
        firstNameTemp = prts2[1].replace(',', '').replace('.', '')
        // var lastName = prts2[prfx]
        if (prts2.length == 3) {
          lastName = prts2[2].split('[')[0]
        }else if (prts2.length > 3) {
          middleNameTemp = prts2[2]
          lastName = prts2[3].split('[')[0]
        }
      }



    }else if (prts2[0].indexOf(',')  != -1 ) {

      lastName = prts2[0].replace(',', '').replace('.', '')
      firstNameTemp = prts2[1]

      if (prts2.length > 2 && prts2[2].indexOf('@') == -1) {
        middleNameTemp = prts2[2]
      }


    }else{
      console.log("else");
      firstNameTemp = prts2[0].replace(',', '').replace('.', '')
      // var lastName = prts2[prfx]
      if (prts2.length == 2) {
        lastName = prts2[1]
      }else if (prts2.length > 2) {
        middleNameTemp = prts2[1]
        lastName = prts2[2]
      }
    }
    namesToReturn.push( { firstName : firstNameTemp ,middleName : middleNameTemp , lastName : lastName , prefix : prefixTemp , company : compName} )
  }
  return namesToReturn
}


// console.log(getName('Pradeep Kumar Yadav [pradeep@HCL.in]; Narayan, Sowmya [somecompany@ciocfmcg.in]; Dr. Raj Kumar Yadav[raj@cioc.in]; Mr. Yadav, Sandeep'));
// console.log(getName('Pradeep Kumar Yadav; Narayan, Sowmya; Dr. Raj Kumar Yadav[raj@cioc.in]; Mr. Yadav, Sandeep'));


var app = angular.module('app', ['ui.bootstrap', 'flash','mwl.confirm',]);

app.config(function($httpProvider ) {
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

app.directive('restrictChars', function() {
   function link(scope, elem, attrs, ngModel, Flash) {
       elem[0].onkeyup = function(evt) {
         viewValue = evt.target.value
         evt.target.value = viewValue.replace(new RegExp( attrs.restrictChars ), "");
         if (attrs.uibDatepickerPopup == undefined) {
           return;
         }
         var logCon = attrs.uibDatepickerPopup.split('-').length;
           var dtParts = evt.target.value.split('-')
           if (dtParts.length <logCon  || (dtParts.length == logCon && dtParts[logCon-1].length <4)   ) {
             return;
           }
           var inpVal = ""
           for (var j = 0; j < dtParts.length; j++) {
             if (dtParts[j].length == 1) {
               dtParts[j] = "0" + dtParts[j]
             }
             if (dtParts.length -1 == j) {
               inpVal += dtParts[j];
             }else{
               inpVal += dtParts[j] +'-';
             }
           }
           evt.target.value = inpVal;
       }
    }
    return {
        restrict: 'A',
        require: 'ngModel',
        link: link
    };
});


app.directive('ngCtrl', function () {
  return function (scope, element, attrs) {
    element.bind("keydown keypress", function (event) {
      if(event.key === 'Enter' && event.ctrlKey == true && event.shiftKey == false) {
        scope.$apply(function (){
          scope.$eval(attrs.ngCtrl);
        });
        event.preventDefault();
      }
    });
  };
});

app.controller('main', function($scope, $http, $interval, $uibModal, Flash, $sce,$timeout) {

  if (window.location.href.indexOf('&data=')!=-1) {
    jsStr = window.location.href.split('&data=')[1];
    jsStr = jsStr.replace(/%22/g , '"')
    jsStr = jsStr.replace(/%20/g , ' ')
    $scope.autoFillData = JSON.parse(jsStr)
  }

  if (window.location.href.indexOf('mode=api')!=-1) {
    $scope.apiMode = true;
  }else{
    $scope.apiMode = false;
  }


  $scope.serverUrl = imageViewerUrl;
  $scope.multiCountMap = {}
  $scope.saving = false;

  $scope.inpData = {}

  $scope.cleanErrorForm = function() {
    $scope.errorsArray = []
    for (var i = 0; i < $scope.fields.length; i++) {
      $scope.error = {}
      var type = $scope.fields[i].type
      if ($scope.fields[i].type == 'name') {
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
      if ($scope.fields[i].type=='date' || $scope.fields[i].type=='datetime') {
        $scope.fields[i].value = ""
      }
      $scope.errorsArray.push($scope.error)

    }
  }

  $scope.fields = [];
  $scope.fieldsCopy = []
  $scope.errorsArray = []

  $http({
    method: 'GET',
    url: '/api/projects/projectfield/?dynamicForm=' + projectpk,
  }).
  then(function(response) {
    $scope.fieldsCopy = response.data
    $scope.fields = JSON.parse(JSON.stringify($scope.fieldsCopy))
    $scope.cleanErrorForm()
    for (var i = 0; i < $scope.autoFillData.length; i++) {

      for (var j = 0; j < $scope.fields.length; j++) {
        objCp = $scope.fields[j]
        if ($scope.autoFillData[i].varName == objCp.name) {
          objCp.value = $scope.autoFillData[i].value
          if (objCp.type == 'boolean' ) {
            if ($scope.autoFillData[i].value == 'True') {
              objCp.value = true;
            }else{
              objCp.value = false;
            }
          }
          if (objCp.type == 'date' ||  objCp.type == 'datetime') {
            console.log($scope.autoFillData[i].value);
            objCp.value = new Date($scope.autoFillData[i].value);
          }
          objCp.dtMode='fullDate'
          objCp.valueP = ''
          objCp.valueF = null
          objCp.valueM = null
          objCp.valueL = null
          objCp.valueC = null
        }

      }

    }




  })

  $scope.startTime = function(){
    $scope.timeInSec = 0
    setInterval(function(){
      $scope.timeInSec += 1
      $scope.$apply()
    },1000)
  }

  $scope.fileUploadData = [];

  $scope.count = function(obj) {
    obj.countvalue = obj.value.length
  }

  $scope.addMore = function(obj,idx){

    objCp = JSON.parse(JSON.stringify(obj))

    if (  $scope.multiCountMap[objCp.pk + '']) {
      $scope.multiCountMap[objCp.pk + ''] += 1
    }else{
      $scope.multiCountMap[objCp.pk + ''] = 2
    }

    if ($scope.multiCountMap[objCp.pk + '']> objCp.multiLimit) {
      Flash.create('warning' , "You can not add more than " + objCp.multiLimit)
      $scope.multiCountMap[objCp.pk + ''] -= 1
      return;
    }

    objCp.value = ''
    objCp.dtMode='fullDate'
    objCp.valueP = ''
    objCp.valueF = null
    objCp.valueM = null
    objCp.valueL = null
    objCp.valueC = null
    objCp.showDelete = true
    objCp.multi = true

    obj.multi = true
    if (idx>0) {
      if (obj.pk==$scope.fields[idx-1].pk) {
        var miltiIndex = $scope.fields[idx-1].miltiIndex + 1
      }else {
        var miltiIndex = 0
      }
    }else {
      var miltiIndex = 0
    }
    obj.miltiIndex = miltiIndex
    objCp.miltiIndex = miltiIndex + 1
    $scope.fields.splice(idx+1,0,objCp)
    $scope.errorsArray.splice(idx+1,0,JSON.parse(JSON.stringify($scope.errorsArray[idx])))
  }

  $scope.deleteMulti = function(idx){
    $scope.multiCountMap[$scope.fields[idx].pk + ''] -= 1
    $scope.fields.splice(idx,1)
  }

  $scope.saveDynamicForm = function() {
    if ($scope.saving) {
      return;
    }
    $scope.finalFieldValues = [];
    $scope.validForm = true
    for (var i = 0; i < $scope.fields.length; i++) {
      var toSend = {}
      if ($scope.fields[i].required) {
        if ($scope.fields[i].type == 'name') {

          if (!$scope.fields[i].valueP && $scope.fields[i].prefix) {
            $scope.errorsArray[i].name.prefix = true
            $scope.validForm = false
          } else {
            $scope.errorsArray[i].name.prefix = false
            toSend.prefix = $scope.fields[i].valueP;
          }
          if (!$scope.fields[i].valueF && $scope.fields[i].fName) {
            $scope.errorsArray[i].name.fname = true
            $scope.validForm = false
          } else {
            $scope.errorsArray[i].name.fname = false
            toSend.fname = $scope.fields[i].valueF;
          }
          if (!$scope.fields[i].valueM && $scope.fields[i].mName) {
            $scope.errorsArray[i].name.mname = true
            $scope.validForm = false
          } else {
            $scope.errorsArray[i].name.mname = false
            toSend.mName = $scope.fields[i].valueM;
          }
          if (!$scope.fields[i].valueL && $scope.fields[i].lName) {
            $scope.errorsArray[i].name.lname = true
            $scope.validForm = false
          } else {
            $scope.errorsArray[i].name.lname = false
            toSend.lname = $scope.fields[i].valueL;
          }
          if (!$scope.fields[i].valueC && $scope.fields[i].compName) {
            $scope.errorsArray[i].name.compName = true
            $scope.validForm = false
          } else {
            $scope.errorsArray[i].name.compName = false
            toSend.compName = $scope.fields[i].valueC;
          }
        }
        if ($scope.fields[i].type == 'dropdown') {
          if (!$scope.fields[i].value) {
            $scope.errorsArray[i].dropdown = true
            $scope.validForm = false
          } else {
            $scope.errorsArray[i].dropdown = false
            toSend.char = $scope.fields[i].value;
          }
        }
        if ($scope.fields[i].type == 'email') {
          if (!$scope.fields[i].value) {
            $scope.errorsArray[i].email = true
            $scope.validForm = false

          } else {
            var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            if (re.test($scope.fields[i].value)) {
              $scope.errorsArray[i].email = false
              toSend.email = $scope.fields[i].value;
            } else {
              $scope.errorsArray[i].email = true
              $scope.validForm = false
            }
          }
        }
        if ($scope.fields[i].type == 'number') {
          if (!$scope.fields[i].value) {
            $scope.errorsArray[i].number = true
            $scope.validForm = false
          } else {
            $scope.errorsArray[i].number = false
            toSend.number = $scope.fields[i].value;
          }
        }
        if ($scope.fields[i].type == 'text') {
          if (!$scope.fields[i].value) {
            $scope.errorsArray[i].text = true
            $scope.validForm = false
          } else {
            if ($scope.fields[i].value.length >= 5 && $scope.fields[i].value.length <= 3000) {
              $scope.errorsArray[i].text = false
              toSend.txt = $scope.fields[i].value;
            } else {
              $scope.errorsArray[i].text = true
              $scope.validForm = false
            }
          }
        }
        if ($scope.fields[i].type == 'date') {
          if (!$scope.fields[i].value) {
            $scope.errorsArray[i].date = true
            $scope.validForm = false
          } else {
            $scope.errorsArray[i].date = false
            toSend.dt = $scope.fields[i].value;
          }
        }
        if ($scope.fields[i].type == 'datetime') {
          if (!$scope.fields[i].value) {
            $scope.errorsArray[i].datetime = true
            $scope.validForm = false
          } else {
            $scope.errorsArray[i].datetime = false
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
      if ($scope.fields[i].type == 'number' && $scope.fields[i].value != undefined && $scope.fields[i].value != "") {
        toSend.number = $scope.fields[i].value;
      }
      if (($scope.fields[i].type == 'text' || $scope.fields[i].type == 'smallText') && $scope.fields[i].value != undefined) {
        toSend.txt = $scope.fields[i].value;

      }

      if ($scope.fields[i].type == 'date' && $scope.fields[i].value != null) {

        try {
          if ($scope.fields[i].value.getHours()==0) {
            toSend.dt =  new Date($scope.fields[i].value.setHours($scope.fields[i].value.getHours() + 6)).toJSON().split('T')[0]
          }else {
            toSend.dt = $scope.fields[i].value.toJSON().split('T')[0]
          }
        } catch (e) {
          console.log('date type is ', typeof $scope.fields[i].value);
        }
      }
      if ($scope.fields[i].type == 'boolean' && $scope.fields[i].value != undefined) {
        toSend.bool = $scope.fields[i].value;
      }
      if ($scope.fields[i].type == 'datetime' && $scope.fields[i].value != undefined && $scope.fields[i].value != "") {
        toSend.dtTime = $scope.fields[i].value;
        // toSend.dtTime = $scope.fields[i].value;
      }
      if ($scope.fields[i].type == 'name') {
        if ($scope.fields[i].prefix && $scope.fields[i].valueP != undefined) {
          toSend.prefix = $scope.fields[i].valueP;
        }
        if ($scope.fields[i].fName && $scope.fields[i].valueF != undefined) {
          toSend.fname = $scope.fields[i].valueF;
        }
        if ($scope.fields[i].mName && $scope.fields[i].valueM != undefined) {
          toSend.mName = $scope.fields[i].valueM;
        }
        if ($scope.fields[i].lName && $scope.fields[i].valueL != undefined) {
          toSend.lname = $scope.fields[i].valueL;
        }
        if ($scope.fields[i].compName && $scope.fields[i].valueC != undefined) {
          toSend.compName = $scope.fields[i].valueC;
        }
      }
      $scope.finalFieldValues.push(toSend)
    }


    if ($scope.validForm) {
      var completeData = []
        for (var i = 0; i < $scope.fields.length; i++) {
          console.log(i, 'ffffffffff', 'lengthhhh' ,  $scope.fields[i], $scope.finalFieldValues[i]);
          datasend = {}
          datasend.field = $scope.fields[i].pk
          datasend.project = projectpk
          datasend.file = $scope.fieldPk;
          datasend.order = i;
          datasend.showDelete = $scope.fields[i].showDelete;
          datasend.miltiIndex = $scope.finalFieldValues[i].miltiIndex;
          datasend.dtMode = $scope.fields[i].dtMode;

          if ($scope.fields[i].type == 'email' && $scope.finalFieldValues[i].email != undefined && $scope.finalFieldValues[i].email.length > 0) {
            datasend.email = $scope.finalFieldValues[i].email
          } else if ($scope.fields[i].type == 'text' && $scope.finalFieldValues[i].txt != undefined  && $scope.finalFieldValues[i].txt.length > 0) {
            datasend.txt = $scope.finalFieldValues[i].txt
          } else if ($scope.fields[i].type == 'date') {
            datasend.dt = $scope.finalFieldValues[i].dt
          } else if ($scope.fields[i].type == 'boolean' && $scope.finalFieldValues[i].bool != undefined  && $scope.finalFieldValues[i].bool != "") {
            datasend.bool = $scope.finalFieldValues[i].bool
          } else if ($scope.fields[i].type == 'name') {
            if ( $scope.finalFieldValues[i].fname != undefined && $scope.finalFieldValues[i].fname.length > 0) {
              datasend.fname = $scope.finalFieldValues[i].fname
            }
            if ($scope.finalFieldValues[i].mName != undefined && $scope.finalFieldValues[i].mName.length > 0) {
              datasend.mName = $scope.finalFieldValues[i].mName
            }
            if ( $scope.finalFieldValues[i].lname != undefined && $scope.finalFieldValues[i].lname.length > 0) {
              datasend.lname = $scope.finalFieldValues[i].lname
            }
            if ( $scope.finalFieldValues[i].compName != undefined && $scope.finalFieldValues[i].compName.length > 0) {
              datasend.compName = $scope.finalFieldValues[i].compName
            }
            if ($scope.finalFieldValues[i].prefix != undefined && $scope.finalFieldValues[i].prefix.length > 0) {
              datasend.prefix = $scope.finalFieldValues[i].prefix
            }
          } else if ($scope.fields[i].type == 'datetime') {
            datasend.dtTime = $scope.finalFieldValues[i].dtTime
          } else if ($scope.fields[i].type == 'number') {
            datasend.number = $scope.finalFieldValues[i].number
          }else if ($scope.fields[i].type == 'smallText' && $scope.finalFieldValues[i].txt != undefined && $scope.finalFieldValues[i].txt.length > 0) {
            datasend.char = $scope.finalFieldValues[i].txt
          } else {
            if ( $scope.finalFieldValues[i].char != undefined &&  $scope.finalFieldValues[i].char.length > 0) {
              datasend.char = $scope.finalFieldValues[i].char
            }
          }
          completeData.push(datasend)
        }
        $scope.saving = true;



    }

    console.log(completeData);

    // send the data


  }


});
