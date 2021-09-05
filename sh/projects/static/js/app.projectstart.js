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

  if (window.location.href.indexOf('mode=api')!=-1) {
    $scope.apiMode = true;
  }else{
    $scope.apiMode = false;
  }

  $timeout(function() {
    var iframeWin = document.getElementById("imageviewer").contentWindow
    iframeWin.postMessage({typ : "apiMode" , val : $scope.apiMode }, "*");
  },3000)

  $scope.markField = function(fieldName) {
    if (!$scope.configs) {
      return;
    }
    var iframeWin = document.getElementById("imageviewer").contentWindow
    for (var i = 0; i < $scope.configs.grabs.length; i++) {
      if ($scope.configs.grabs[i].label == fieldName) {
        var grab = $scope.configs.grabs[i];
        iframeWin.postMessage( {typ : 'marker' , x : (grab.x*100) , y : (grab.y*100)  , w : (grab.w*100) , h : (grab.h*100) }  , "*"); // the coordinates are the normalized values
      }
    }
  }

  $scope.autoCapture = function(fieldName) {
    if (!$scope.configs) {
      return;
    }
    var iframeWin = document.getElementById("imageviewer").contentWindow
    for (var i = 0; i < $scope.configs.grabs.length; i++) {
      if ($scope.configs.grabs[i].label == fieldName) {
        var grab = $scope.configs.grabs[i];
        iframeWin.postMessage( {typ : 'autocapture' , x : (grab.x*100) , y : (grab.y*100)  , w : (grab.w*100) , h : (grab.h*100) }  , "*"); // the coordinates are the normalized values
      }
    }
  }
  $scope.serverUrl = imageViewerUrl;
  $scope.multiCountMap = {}
  $scope.saving = false;
  window.addEventListener("message", function(event) {
    if (event.data == 'tabbed') {
      // console.log("tabbed in parent");
      $scope.fieldIDInFocus = parseInt($scope.fieldIDInFocus) + 1
      // console.log('#value'+ $scope.fieldIDInFocus);
      $('#value'+ $scope.fieldIDInFocus ).focus()
      $timeout(function() {
        $('#value'+ $scope.fieldIDInFocus ).focus()
      }, 500)
      $timeout(function() {
        $('#value'+ $scope.fieldIDInFocus ).blur()
      }, 2600)
      $scope.$apply();
    }else if (event.data == 'logout') {
      window.location = '/logout'
    }

    if (typeof event.data == 'object' && event.data.typ && event.data.typ == 'autofill') {
      if ($scope.inpData.obj != undefined && ($scope.inpData.obj.type == 'date' || $scope.inpData.obj.type == 'datetime')) {
        event.data.txt = event.data.txt.replace('.' , ',')
        $scope.inpData.obj[$scope.inpData.typ] = new Date(event.data.txt)
      }else if ($scope.inpData.obj != undefined && $scope.inpData.obj.type == 'name') {
        var names = getName(event.data.txt)
        // var names = getName('Yadav Pradeep Kumar; Ms, Narayan Sowmya')
        if (names.length > 0) {
          $scope.inpData.obj.valueP = names[0].prefix
          $scope.inpData.obj.valueF = names[0].firstName
          $scope.inpData.obj.valueL = names[0].lastName
          $scope.inpData.obj.valueM = names[0].middleName
          if ($scope.inpData.obj.valueC == undefined || $scope.inpData.obj.valueC == "") {
            $scope.inpData.obj.valueC = names[0].company
          }
        }

        var indx = undefined;
        for (var i = 0; i < $scope.fields.length; i++) {
          if ($scope.fields[i].pk == $scope.inpData.obj.pk) {
            indx = i
          }
        }
        for (var j = 1; j < names.length; j++) {

          if ($scope.fields[indx+j-1].pk != $scope.inpData.obj.pk ) {
            continue
          }

          $scope.addMore($scope.fields[indx+j-1] , indx+j-1)
          $scope.fields[indx + j].valueF = names[j].firstName
          $scope.fields[indx + j].valueP = names[j].prefix
          $scope.fields[indx + j].valueM = names[j].middleName
          $scope.fields[indx + j].valueL = names[j].lastName
          $scope.fields[indx + j].valueC = names[j].company
        }
      } else {
        if ($scope.inpData.obj[$scope.inpData.typ] != undefined) {
          $scope.inpData.obj[$scope.inpData.typ] += ' '+ event.data.txt.replace(/(?:\r\n|\r|\n)/g, ' ');
        }else{
          $scope.inpData.obj[$scope.inpData.typ] = event.data.txt.replace(/(?:\r\n|\r|\n)/g, ' ');
        }
        if (typeof $scope.inpData.obj[$scope.inpData.typ] == 'string' ) {
          $scope.inpData.obj[$scope.inpData.typ] = $scope.inpData.obj[$scope.inpData.typ].substring(0, $scope.inpData.obj.maxLength)
        }

        if ($scope.inpData.obj.type == 'text') {
          $scope.count($scope.inpData.obj)
        }
      }

      $scope.$apply()
    }
  });
  $scope.inpData = {}
  $scope.fillData = function(obj, typ,domId) {
    $scope.inpData = {
      obj: obj,
      typ: typ,
      domId:domId
    }
    if (obj.domId == undefined) {
      return;
    }

    id = obj.domId.match(/\d+/g).map(Number);
    $scope.fieldIDInFocus = parseInt(id);
    $scope.markField(obj.name)

  }

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
    url: '/api/projects/projectfield/?project=' + projectpk,
  }).
  then(function(response) {
    $scope.fieldsCopy = response.data
    $scope.fields = JSON.parse(JSON.stringify($scope.fieldsCopy))
    $scope.cleanErrorForm()
  })

  $scope.timeInSec = 0;

  $interval(function(){
    $scope.timeInSec += 1
  },1000)


  $scope.sceServerUrl = $sce.trustAsResourceUrl($scope.serverUrl)

  $scope.updateViewerUrl = function(url) {
    var servr = $scope.serverUrl.split('/imageViewer/')[0]
    var namePrts = url.split('/')
    var configPath = servr+ url.replace(namePrts[namePrts.length -1]  , 'config.json')
    configPath = configPath.replace(':9000' , '')

    $http({method : 'GET' , url :  '/api/projects/getOCRConfig/?name='+ projectName }).
    then(function(response) {
      $scope.configs = response.data;
      var grabs = JSON.parse(response.data.grabs);
      for (var i = 0; i < grabs.length; i++) {
        grabs[i].w = grabs[i].width;
        grabs[i].h = grabs[i].height;

        for (var j = 0; j < $scope.fields.length; j++) {
          if ($scope.fields[j].name == grabs[i].label) {
            $scope.fields[j].autoFormat = true;
            break
          }
        }
      }

      $scope.configs.grabs = grabs;
      console.log(grabs);

    })

    $timeout(function() {
      var iframeWin = document.getElementById("imageviewer").contentWindow
      iframeWin.postMessage( {typ : 'url' , url : url , coder : true }  , "*");
    },1000)
  }

  $scope.fileUploadData = [];
  $scope.refreshIFrame = function(idx){
    $scope.fileData = $scope.mergedData[idx]
    if ($scope.fileData.path) {
      $scope.updateViewerUrl($scope.fileData.path)
      $scope.currFlName = $scope.fileData.path.split('/').slice(-1)[0]
    } else if ($scope.fileData.file) {
      $scope.updateViewerUrl($scope.fileData.file)
      $scope.currFlName = $scope.fileData.file.split('__').slice(-1)[0]
    } else {
      $scope.fileData.iframeUrl = $sce.trustAsResourceUrl('')
    }
    var iframeWin = document.getElementById("imageviewer").contentWindow
    iframeWin.postMessage( "closeFileError"  , "*");

  }

  $scope.PrecDov = function(){
    if ($scope.pageIndex>0) {
      $scope.pageIndex -= 1
      $scope.refreshIFrame($scope.pageIndex)
    }
    if ($scope.pageIndex==0) {
      $scope.showNxtBtn = true
      $scope.showPrevBtn = false
    }else {
      $scope.showNxtBtn = true
      $scope.showPrevBtn = true
    }
    for (key in $scope.ddData) {
      if ($scope.ddData[key].indexOf($scope.pageIndex) !== -1) {
        $scope.flags.ddValue = key
      }
    }
  }

  $scope.nextDoc = function(){
    if ($scope.pageIndex<$scope.maxIdx) {
      $scope.pageIndex += 1
      $scope.refreshIFrame($scope.pageIndex)
    }
    if ($scope.pageIndex==$scope.maxIdx) {
      $scope.showNxtBtn = false
      $scope.showPrevBtn = true
    }else {
      $scope.showNxtBtn = true
      $scope.showPrevBtn = true
    }
    for (key in $scope.ddData) {
      if ($scope.ddData[key].indexOf($scope.pageIndex) !== -1) {
        $scope.flags.ddValue = key
      }
    }
  }

  $scope.ddChange = function(){
    var ddArray = $scope.ddData[$scope.flags.ddValue]
    console.log(ddArray[0]);
    $scope.pageIndex = ddArray[0]
    if ($scope.pageIndex == 0) {
      $scope.refreshIFrame($scope.pageIndex)
      $scope.showPrevBtn = false
      $scope.showNxtBtn = true
    }else {
      $scope.refreshIFrame($scope.pageIndex)
      if ($scope.pageIndex == $scope.maxIdx) {
        $scope.showPrevBtn = true
        $scope.showNxtBtn = false
      }else {
        $scope.showPrevBtn = true
        $scope.showNxtBtn = true
      }
    }
  }
  $scope.nextFile = function(){
    $http({
      method: 'GET',
      url: '/api/projects/checkNextFile/?typ=recoder&projectPk='+projectpk
    }).
    then(function(response) {
      console.log(response.data,'dataaaaaaaaaaa');
      if (response.data.nxt) {
        window.location.href='/project/recoder/'+projectpk



      }else {
        $scope.getFileData()
      }
    })
  }

  $scope.getFileData = function(){
    $scope.flHeaderName = ''
    $scope.currFlName = ''
    $scope.totalPages = 0
    $scope.pageIndex = 0

    $scope.ddData = {}
    $scope.ddSelectionData = []
    $scope.dpIdx = 0
    $scope.stN = 0
    $scope.edN = 0
    $scope.flags = {ddValue:"0"}

    $scope.comment = {'text': ''}
    $http({
      method: 'GET',
      url: '/api/projects/fileupload/?getNextFile&projectPk=' + projectpk + '&statusType=' + statusType
    }).
    then(function(response) {
      $scope.fileUploadData = response.data;
      $scope.timeInSec = 0;
      if (response.data.length>0) {
        $scope.fieldPk = $scope.fileUploadData[0].pk
        $scope.mergedData = JSON.parse(JSON.stringify(response.data))

        if ($scope.fileUploadData[0].children.length>0) {
          $scope.showNxtBtn = true
          $scope.showPrevBtn = false
          $scope.mergedData = $scope.mergedData.concat(JSON.parse(JSON.stringify($scope.fileUploadData[0].children)))
        }else {
          $scope.showNxtBtn = false
          $scope.showPrevBtn = false
        }

        if ($scope.mergedData[0].path) {
          $scope.flHeaderName = $scope.mergedData[0].path.split('/').slice(-1)[0]
        }else if ($scope.mergedData[0].file) {
          $scope.flHeaderName = $scope.mergedData[0].file.split('__').slice(-1)[0]
        }
        $scope.maxIdx = $scope.mergedData.length - 1
        if ($scope.mergedData[$scope.maxIdx].path) {
          $scope.flHeaderName += ' - ' + $scope.mergedData[$scope.maxIdx].path.split('/').slice(-1)[0]
        }else if ($scope.mergedData[$scope.maxIdx].file) {
          $scope.flHeaderName += ' - ' + $scope.mergedData[$scope.maxIdx].file.split('__').slice(-1)[0]
        }
        $scope.totalPages = $scope.mergedData.length
        for (var i = 0; i < $scope.mergedData.length; i++) {
          if (i%5==0) {
            $scope.dpIdx = Math.floor(i/5)
            $scope.stN = i+1
            $scope.ddData[$scope.dpIdx] = []
          }
          $scope.edN = i+1
          $scope.ddSelectionData[$scope.dpIdx] = $scope.stN + ' - ' + $scope.edN
          $scope.ddData[$scope.dpIdx].push(i)
        }
        $scope.refreshIFrame($scope.pageIndex)
        if (!$scope.fileUploadData[0].locked) {
          // $http({
          //   method: 'PATCH',
          //   url: '/api/projects/fileupload/' + $scope.fieldPk +'/',
          //   data:{locked:true,updateCoderVal:true,relocked:true,updaterecodingVal:true}
          // }).
          // then(function(response) {
          //   console.log('coder value updateddddd');
          // } , function(error) {
          //   $scope.nextFile()
          //   $scope.resetForm()
          //   $('#codingWindow').scrollTop(0);
          //   $scope.saving = false;
          // })
        }
      }else {
        window.location.href='/allDone'
        // if ($scope.apiMode) {
        // }else{
        //   window.location.href='/dashboard/'
        // }
      }

    })
  }
  $scope.nextFile()

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

    var comment = $scope.comment.text;
    if ($scope.comment.text.length == 0) {
      comment = 'NO COMMENT';
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
        $http({
          method: 'PATCH',
          url: '/api/projects/fileupload/' + $scope.fieldPk + '/',
          data: {
            'coderComment': comment,
            'status': 'coded',
            'coded' : true,
            'codeTime':$scope.timeInSec,
            'completeData' : completeData
          },
        }).
        then(function(response) {
          $scope.timeInSec = 0;
          $scope.nextFile()
          $scope.resetForm()
          Flash.create('success', 'Posted Sucessfully');
          $scope.saving = false;
          $('#codingWindow').scrollTop(0);
        }, function error(response) {
          $scope.timeInSec = 0;
          postJsError('Error posting field value', '/api/projects/fileUpload/', "0", JSON.stringify(response))
        })
    }
  }

  $scope.resetForm = function() {
    $scope.comment = {'text': ''}
    $scope.fields = JSON.parse(JSON.stringify($scope.fieldsCopy))
    $scope.cleanErrorForm()
    for (var i = 0; i < $scope.fields.length; i++) {
      if ($scope.fields[i].value || $scope.fields[i].valueP || $scope.fields[i].valueF || $scope.fields[i].valueM || $scope.fields[i].valueL || $scope.fields[i].valueC || $scope.fields[i].value == undefined) {
        if ($scope.fields[i].type=='date' || $scope.fields[i].type=='datetime') {
          $scope.fields[i].value = new Date()
          $scope.fields[i].dtMode='fullDate'
        }else {
          $scope.fields[i].value = ''
        }
        $scope.fields[i].valueP = ''
        $scope.fields[i].valueF = null
        $scope.fields[i].valueM = null
        $scope.fields[i].valueL = null
        $scope.fields[i].valueC = null
        $scope.fields[i].showDelete = false
        $scope.fields[i].showDelete = false
      }
      $scope.fields[i].dtMode='fullDate';
      $scope.fields[i].email='';
    }

    $timeout(function() {
      $('#value0').focus();
      $scope.fieldIDInFocus = 0;
    },1500)
  }


});
