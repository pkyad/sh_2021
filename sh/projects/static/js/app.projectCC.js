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


var app = angular.module('app', ['ui.bootstrap', 'flash','mwl.confirm',]);

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

app.config(function($httpProvider ) {
  $httpProvider.defaults.xsrfCookieName = 'csrftoken';
  $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
  $httpProvider.defaults.withCredentials = true;

});

app.controller('main', function($scope, $http, $interval, $uibModal, Flash, $sce,$timeout) {

  $scope.saving = false;

  $scope.selector = {idx : -1}


  window.addEventListener("message", function(event) {

    if (event.data == 'tabbed') {

      $scope.selector.idx +=1
      $scope.$apply();
    }else if (event.data == 'logout') {
      window.location = '/logout'
    }

    if ($scope.selector.idx != -1  && typeof event.data == 'object' && event.data.typ && event.data.typ == 'autofill') {
      console.log("data from iframe is : " + event.data.txt);

      var f = $scope.fieldValuesData[$scope.selector.idx].field

      console.log(f);
      if (f.type == 'date' ) {
        $scope.fieldValuesData[$scope.selector.idx].dt = new Date(event.data.txt)
      }else if(f.type == 'datetime') {
        $scope.fieldValuesData[$scope.selector.idx].dtTime = new Date(event.data.txt)
      }else if (f.type == 'name') {
        var names = getName(event.data.txt)
        console.log(names);
        if (names.length > 0) {
          console.log("setting first name");
          $scope.fieldValuesData[$scope.selector.idx].prefix = names[0].prefix
          $scope.fieldValuesData[$scope.selector.idx].fname = names[0].firstName
          $scope.fieldValuesData[$scope.selector.idx].lname = names[0].lastName
          $scope.fieldValuesData[$scope.selector.idx].mName = names[0].middleName
          $scope.fieldValuesData[$scope.selector.idx].compName = names[0].company
        }
        var indx = $scope.selector.idx;

        for (var j = 1; j < names.length; j++) {
          $scope.addMore($scope.fieldValuesData[indx+j-1] , indx+j-1)
          console.log(names[j]);

          $scope.fieldValuesData[indx + j].prefix = names[j].prefix
          $scope.fieldValuesData[indx + j].fname = names[j].firstName
          $scope.fieldValuesData[indx + j].lname = names[j].lastName
          $scope.fieldValuesData[indx + j].mName = names[j].middleName
          $scope.fieldValuesData[indx + j].compName = names[j].company
          $scope.$apply()
        }
      } else if(f.type == 'email') {
        $scope.fieldValuesData[$scope.selector.idx].email = event.data.txt
      }else if(f.type == 'number') {
        $scope.fieldValuesData[$scope.selector.idx].number = parseInt(event.data.txt)
      }else if(f.type == 'smallText') {
        if ($scope.fieldValuesData[$scope.selector.idx].char == null) {
          $scope.fieldValuesData[$scope.selector.idx].char =""
        }
        $scope.fieldValuesData[$scope.selector.idx].char += ' ' + event.data.txt.replace(/(?:\r\n|\r|\n)/g, ' ')
      }else if(f.type == 'text') {
        if ($scope.fieldValuesData[$scope.selector.idx].txt == null) {
          $scope.fieldValuesData[$scope.selector.idx].txt =""
        }
        $scope.fieldValuesData[$scope.selector.idx].txt += ' ' + event.data.txt.replace(/(?:\r\n|\r|\n)/g, ' ')
      }
      $scope.$apply()
    }
  });

  $scope.serverUrl = imageViewerUrl;

  $scope.startTime = function(){
    $scope.timeInSec = 0
    setInterval(function(){
      $scope.timeInSec += 1
    },1000)
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

  $scope.updateViewerUrl = function(url) {
    var iframeWin = document.getElementById("imageviewer").contentWindow
    iframeWin.postMessage( {typ : 'url' , url : url }  , "*");
  }

  $scope.sceServerUrl = $sce.trustAsResourceUrl($scope.serverUrl)

  $scope.fileUploadData = [];
  $scope.refreshIFrame = function(idx,typ){
    $scope.fileData = $scope.mergedData[idx]
    if ($scope.fileData.path) {
      // $scope.fileData.iframeUrl = $sce.trustAsResourceUrl($scope.serverUrl + $scope.fileData.path)

      $scope.updateViewerUrl($scope.fileData.path)

      $scope.currFlName = $scope.fileData.path.split('/').slice(-1)[0]
    } else if ($scope.fileData.file) {
      // $scope.fileData.iframeUrl = $sce.trustAsResourceUrl($scope.serverUrl + $scope.fileData.file)


      $scope.updateViewerUrl($scope.fileData.path)

      $scope.currFlName = $scope.fileData.file.split('__').slice(-1)[0]
    } else {
      $scope.fileData.iframeUrl = $sce.trustAsResourceUrl('')
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
      url: '/api/projects/fileupload/?id=' + filePk
    }).
    then(function(response) {
      $scope.fileUploadData = response.data;
      $scope.startTime()
      if (response.data.length>0) {
        $scope.parentField = $scope.fileUploadData[0]
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
        $scope.files()
      }else {

      }
    })
  }

  $timeout(function() {
    $scope.getFileData()
  },1000)

  $scope.files = function() {
    if ($scope.parentField.status == 'coded') {
      $scope.approveBtn = true
      $scope.sendbkBtn = true
    } else {
      $scope.approveBtn = false
      $scope.sendbkBtn = false
    }
    $http.get('/api/projects/fieldValue/?project=' + projectpk + '&file=' + $scope.parentField.pk).
    then(function(response) {
      $scope.fieldValuesData = response.data
      if (qaCanEdit) {
        for (var i = 0; i < $scope.fieldValuesData.length; i++) {
          $scope.fieldValuesData[i].editing = true
          // if ($scope.fieldValuesData[i].field.type=='date' || $scope.fieldValuesData[i].field.type=='datetime') {
          // }
        }
      }

    })
  }

  $scope.multiCountMap = {}
  $scope.addMore = function(obj,idx){
    if (  $scope.multiCountMap[obj.field.pk + '']) {
      $scope.multiCountMap[obj.field.pk + ''] += 1
    }else{
      $scope.multiCountMap[obj.field.pk + ''] = 2
    }

    if ($scope.multiCountMap[obj.field.pk + '']> obj.field.multiLimit) {
      Flash.create('warning' , "You can not add more than " + obj.field.multiLimit)
      $scope.multiCountMap[obj.field.pk + ''] -= 1
      return;
    }
    $scope.selector.idx =-1;
    objCp = JSON.parse(JSON.stringify(obj))
    objCp.field.multi = true
    objCp.dt = new Date()
    objCp.dtTime= new Date()
    objCp.bool = false;
    objCp.prefix = ''
    objCp.char = null
    objCp.email = null
    objCp.number = null
    objCp.txt = null
    objCp.fname = null
    objCp.lname = null
    objCp.mName = null
    objCp.compName = null
    objCp.needCorrection = true;
    objCp.dtMode='fullDate'

    objCp.showDelete = true
    // console.log(obj,idx);
    if (objCp.pk != undefined) {
      delete objCp.pk
    }

    $scope.fieldValuesData.splice(idx+1, 0, objCp)

    // $scope.fieldValuesData.push(objCp)
  }

  $scope.deleteMulti = function(idx){

    if (typeof($scope.fieldValuesData[idx].pk) == 'number') {
      $http({method : 'DELETE' , url : '/api/projects/fieldValue/' + $scope.fieldValuesData[idx].pk + '/' }).
      then(function(response) {

      })
    }
    $scope.multiCountMap[  $scope.fieldValuesData[idx].field.pk  + ''] -= 1
    $scope.fieldValuesData.splice(idx,1)
  }

  $scope.resubmit = function() {

    if ($scope.saving) {
      return;
    }
    $scope.saving = true;
    for (var i = 0; i < $scope.fieldValuesData.length; i++) {
      var toSend = $scope.fieldValuesData[i];

      if ($scope.fieldValuesData[i].field.type == 'date' && $scope.fieldValuesData[i].dt != null) {
        try {
          if ($scope.fieldValuesData[i].dt.getHours()==0) {
            toSend.dt =  new Date($scope.fieldValuesData[i].dt.setHours($scope.fieldValuesData[i].dt.getHours() + 6)).toJSON().split('T')[0]
          }else {
            toSend.dt = $scope.fieldValuesData[i].dt.toJSON().split('T')[0]
          }
        } catch (e) {
          console.log('date type is ', typeof $scope.fieldValuesData[i].dt);
        }
      }else{
        if ($scope.fieldValuesData[i].dt != null) {
          try {
            toSend.dt = $scope.fieldValuesData[i].dt.toJSON().split('T')[0]
          } catch (e) {
          } finally {
          }
        }
      }

      if ($scope.fieldValuesData[i].field.type == 'datetime' && $scope.fieldValuesData[i].dtTime != null) {
        try {
          toSend.dtTime = $scope.fieldValuesData[i].dtTime.toJSON()
        } catch (e) {
          console.log('date type is ', typeof $scope.fieldValuesData[i].dtTime);
        }
      }
      if (toSend.pk) {
        var method = 'PATCH'
        var url = '/api/projects/fieldValue/' + $scope.fieldValuesData[i].pk +'/'
      }else {
        var method = 'POST'
        var url = '/api/projects/fieldValue/'
        toSend.field = toSend.field.pk
      }
      $http({method : method , url : url , data : toSend}).
      then(function(response) {
        Flash.create('success' , 'Saved')
      })
    }
    var comment = $scope.comment.text;
    if ($scope.comment.text.length == 0) {
      comment = 'NO COMMENT';
    }

    $http({
      method: 'PATCH',
      url: '/api/projects/fileupload/' + $scope.parentField.pk + '/',
      data: {
        'recoderComment': comment,
        'status': 'revised',
        'recoded' : true,
        'reCodeTime':$scope.timeInSec
      },
    }).
    then(function(response) {
      Flash.create('success', 'Sent Successfully');
      if (response.data.status == 'rejected') {
        $scope.sendbkBtn = false
      }
      $('#codingWindow').scrollTop(0);
      $scope.saving = false;
    })
  }

});
