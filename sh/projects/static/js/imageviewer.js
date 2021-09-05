var app = angular.module('app', [ 'ui.bootstrap', 'ngSanitize', 'ngAside' , 'flash']);

app.config(function($httpProvider,) {
  $httpProvider.defaults.xsrfCookieName = 'csrftoken';
  $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
  $httpProvider.defaults.withCredentials = true;
});

app.controller("imageViewerCont", function($scope, Flash, $http) {

  $scope.imageViewerUrl = '/static/ngTemplates/imageViewer.html'

})

app.controller("controller.imageViewer", function($scope, Flash, $http, $uibModal,$rootScope) {

  $scope.form = {
    fil: emptyFile,
    jpfil: emptyFile,
    showloder:true
  }

    // event listener for keyup
  function checkTabPress(e) {
      "use strict";
      // pick passed event or global event object if passed one is empty
      e = e || event;
      var activeElement;
      if (e.keyCode == 9) {
          // Here read the active selected link.
          parent.postMessage('tabbed', "*");
      }
  }

  var body = document.querySelector('body');
  body.addEventListener('keyup', checkTabPress)



  $scope.imageList = []

  $scope.next = function() {
    console.log($scope.flags.imageIndex);
    $scope.flags.imageIndex += 1;
    if ($scope.flags.imageIndex >= $scope.imageList.length) {
      $scope.flags.imageIndex -= 1;
      return
    }
    $scope.imgAngle = 0
    $scope.loadImage($scope.imageList[$scope.flags.imageIndex])
    for (key in $scope.ddData) {
      if ($scope.ddData[key].indexOf($scope.flags.imageIndex) !== -1) {
        $scope.flags.ddValue = key
      }
    }
  }

  $scope.prev = function() {
    console.log('preeeeeeeevviioo',$scope.flags.imageIndex);
    $scope.flags.imageIndex -= 1;
    if ($scope.flags.imageIndex <0) {
      $scope.flags.imageIndex += 1;
      return
    }
    $scope.imgAngle = 0
    $scope.loadImage($scope.imageList[$scope.flags.imageIndex])
    for (key in $scope.ddData) {
      if ($scope.ddData[key].indexOf($scope.flags.imageIndex) !== -1) {
        $scope.flags.ddValue = key
      }
    }

  }


  $scope.scale = 1;

  $scope.flags = {panning : false , imageIndex : 0,ddValue:"0"}
  $scope.ddChange = function(){
    var ddArray = $scope.ddData[$scope.flags.ddValue]
    console.log(ddArray[0]);
    $scope.flags.imageIndex = ddArray[0]
    $scope.imgAngle = 0
    $scope.loadImage($scope.imageList[$scope.flags.imageIndex])
  }


  $scope.sendPDF = function(fileUrl,typ) {
    // console.log("172--");
    $scope.form.showloder = true;
    var prts = fileUrl.split('/')
    $scope.currentFileNameInView  = prts[prts.length -1]
    // console.log("Loading the image : " , fileUrl);
    $scope.ddData = {}
    $scope.ddSelectionData = []
    $scope.dpIdx = 0
    $scope.stN = 0
    $scope.edN = 0
    var fd = new FormData()

    // if ($scope.form.fil == emptyFiles && fileUrl == undefined) {
    //   Flash.create('danger', 'Please Upload The File')
    //   return
    // }
    console.log('sending url to backendd');

    if ($scope.form.fil != emptyFile) {
      fd.append('fil', $scope.form.fil)
    }else {
      if (typ!=undefined&&typ=='imageurl') {
        fd.append('fileUrl',fileUrl)
        var extPrts = fileUrl.split('.')
        var ext = extPrts[extPrts.length -1]
        if (['jpg', 'jpeg', 'png', 'JPG'].indexOf(ext)!= -1) {

          $scope.form.showloder = false
          $scope.imageList = [{"flpath": fileUrl,"idx":0,"imgpath": fileUrl}];
          for (var i = 0; i < $scope.imageList.length; i++) {
            if (i%10==0) {
              $scope.dpIdx = Math.floor(i/10)
              $scope.stN = i+1
              $scope.ddData[$scope.dpIdx] = []
            }
            $scope.edN = i+1
            $scope.ddSelectionData[$scope.dpIdx] = $scope.stN + ' - ' + $scope.edN
            $scope.ddData[$scope.dpIdx].push(i)
          }
          $scope.loadImage($scope.imageList[$scope.flags.imageIndex])
          $scope.$apply()

          return;
        }


      }else {
        fd.append('docId',fileUrl)
      }
    }

    if (fileUrl.length == 0) {
      return;
    }


    $http({
      method: 'POST',
      url: '/api/tools/convertPDFtoImage/',
      data: fd,
      transformRequest: angular.identity,
      headers: {
        'Content-Type': undefined
      }
    }).
    then(function(response) {
      console.log(response.data);
      $scope.form.showloder = false
      $scope.flags.imageIndex = 0;
      $scope.imageList = response.data.imagesData;
      for (var i = 0; i < $scope.imageList.length; i++) {
        if (i%10==0) {
          $scope.dpIdx = Math.floor(i/10)
          $scope.stN = i+1
          $scope.ddData[$scope.dpIdx] = []
        }
        $scope.edN = i+1
        $scope.ddSelectionData[$scope.dpIdx] = $scope.stN + ' - ' + $scope.edN
        $scope.ddData[$scope.dpIdx].push(i)
      }
      console.log($scope.ddSelectionData);
      console.log($scope.ddData);

      console.log("loading : ");
      console.log($scope.imageList[$scope.flags.imageIndex]);
      $scope.loadImage($scope.imageList[$scope.flags.imageIndex])
    }, function(err) {
      $uibModal.open({
          templateUrl: '/static/ngTemplates/app.fileError.html',
          size: 'lg',
          backdrop: false,
          controller: function($scope, $uibModalInstance) {

            window.addEventListener("message", function(event) {
              if (event.data == 'closeFileError') {
                $uibModalInstance.dismiss();
              }
            })

          },
        }).result.then(function() {

        }, function() {

        });
    })
  }


  console.log(window.location);
  try {
    var loc = window.location.href
    console.log(loc);
    var args = loc.split('/?')[1].split('=')
    $scope.imgUrl = args[1].replace('&Pgcnt','')
    var fstarg = args[0]
    console.log(fstarg,$scope.imgUrl);
    if (fstarg=='imageurl') {
      console.log("171--");
      $scope.sendPDF($scope.imgUrl,'imageurl');
    }else {
      // $scope.sendPDF('http://127.0.0.1:8080/static/images/multiFile.pdf');
      $scope.sendPDF($scope.imgUrl);
    }

  } catch (e) {
    $scope.imgUrl = null
  }

  $scope.apiMode= true;

  window.addEventListener("message", function(event) {

    if (typeof event.data == 'object' && event.data.typ == 'apiMode') {
      $scope.apiMode = event.data.val;
      $scope.$apply()
    }else if (typeof event.data == 'object' && event.data.typ == 'url') {
      $scope.sendPDF( event.data.url,'imageurl' );
      $scope.showSendBtn = event.data.coder == true
      console.log("loading new image from the windows event" , $scope.currentFileNameInView);
    }else if (typeof event.data == 'object' && event.data.typ == 'autocapture') {

      rectMarker.width = ( event.data.w * canvas.getWidth()   ) / (100);
      rectMarker.height = ( event.data.h * canvas.getHeight()   )/ (100)
      rectMarker.left = ( event.data.x * canvas.getWidth()   ) / (100);
      rectMarker.top = ( event.data.y * canvas.getHeight()  ) / (100);
      rectMarker.visible = true;

      canvas.bringToFront(rectMarker);

      var cropped = new Image();
      cropped.src = bigCanvas.toDataURL({
        left: ( event.data.x * bigCanvas.getWidth()   ) / (100),
        top: ( event.data.y * bigCanvas.getHeight()  ) / (100),
        width: ( event.data.w * bigCanvas.getWidth()   ) / (100) ,
        height: (  event.data.h * bigCanvas.getHeight()   )/ (100)
      });



      cropped.onload = function() {
        // bigCanvas.clear();
        cimage = new fabric.Image(cropped);
        cimage.left =  ( event.data.x * bigCanvas.getWidth()   ) / (100);
        cimage.top =  ( event.data.y * bigCanvas.getHeight()  ) / (100);
        cimage.setCoords();

        var dataURL = cimage.toDataURL();
        $http({
          method: 'POST',
          url: '/api/tools/getTextFromImage/',
          data: {
            imgUrl: dataURL,
            ctrlTyp:ctrlTyp
          },
        }).
        then(function(response) {
          parent.postMessage({txt: response.data.imageText  ,typ:'autofill' } , '*')
        })
      };
    }else if (typeof event.data == 'object' && event.data.typ == 'marker') {

      rectMarker.width = ( event.data.w * canvas.getWidth()   ) / (100);
      rectMarker.height = ( event.data.h * canvas.getHeight()   )/ (100)
      rectMarker.left = ( event.data.x * canvas.getWidth()   ) / (100);
      rectMarker.top = ( event.data.y * canvas.getHeight()  ) / (100);
      rectMarker.visible = true;
      canvas.bringToFront(rectMarker);
    }
  })



  // set to the event when the user pressed the mouse button down
  var mouseDown;
  // only allow one crop. turn it off after that
  var disabled = false;
  var PanModeByMouse = false;
  var rectangle = new fabric.Rect({
    fill: 'transparent',
    stroke: '#ff0000',
    strokeWidth: 2,
    strokeDashArray: [5, 5],
    selectable:false,
    // visible: false
  });
  // console.log(rectangle);
  var container = document.getElementById('canvas').getBoundingClientRect();
  var bigContainer = document.getElementById('bigCanvas').getBoundingClientRect();
  console.log(bigContainer);
  var canvas = new fabric.Canvas('canvas');
  var bigCanvas = new fabric.Canvas('bigCanvas');
  canvas.add(rectangle);
  var image;


  var rectMarker = new fabric.Rect({
    fill: 'transparent',
    stroke: '#0075ff',
    strokeWidth: 2,
    strokeDashArray: [5, 5],
    selectable:false,
    visible: true
  });

  canvas.add(rectMarker);


  $scope.rotateLeft = function(){
    if ($scope.imgAngle==0) {
      $scope.imgAngle = 270
    }else {
      $scope.imgAngle -= 90
    }
    $scope.loadImage($scope.imageList[$scope.flags.imageIndex])
  }
  $scope.rotateRight = function(){
    if ($scope.imgAngle==270) {
      $scope.imgAngle = 0
    }else {
      $scope.imgAngle += 90
    }
    $scope.loadImage($scope.imageList[$scope.flags.imageIndex])
  }

  $scope.imgAngle = 0
  $scope.bigImgZoom = 2
  console.log(screen.width,'screen.widthscreen.widthscreen.widthscreen.widthscreen.widthscreen.width',screen.height);
  console.log($(window).width());
  $scope.screenWidth = screen.width - 30
  $scope.screenHeight = screen.height - 30
  $scope.currentImgPath = null
  $scope.loadcurrentimg = function(imgUrl,typ){

    if (typ == undefined) {
      typ = 'width';
    }

    if (typ!=undefined) {
      var imgWidth = Math.round($(window).width()-10)
      var imgHeight = Math.round($(window).height()-100)
      $scope.hederWidth = imgWidth + 10
    }else {
      var imgWidth = $scope.screenWidth
      var imgHeight = $scope.screenHeight
      $scope.hederWidth = imgWidth + 15
    }
    console.log(Math.round($(window).width()), Math.round($(window).height()),'browserrrrrrrrrr');
    $scope.currentImgPath = imgUrl
    fabric.util.loadImage(imgUrl, function(img) {
      canvas.clear()
      bigCanvas.clear()
      try {
        canvas.remove(image);
        bigCanvas.remove(image);
        console.log('old img removedddddddd');
      } catch (e) {
        console.log('no imgggggggggggggg');
      }
      image = new fabric.Image(img);
      console.log(imgWidth,'imgWidthimgWidthimgWidthimgWidthimgWidth',imgHeight);
      image.scaleToWidth(imgWidth)
      if (typ!=undefined&&typ=='height') {
        image.scaleToHeight(imgHeight)
      }
      // image.setAngle(90);
      image.setAngle($scope.imgAngle);
      console.log(image.getWidth(),image.getHeight());
      if ($scope.imgAngle==90||$scope.imgAngle==270) {
        if (typ!=undefined && typ=='width') {
          image.scaleToHeight(imgWidth)
        }
        if (typ!=undefined && typ=='height') {
          image.scaleToWidth(imgHeight)
        }
        var wd = image.getHeight()
        var ht = image.getWidth()
      }else {
        var wd = image.getWidth()
        var ht = image.getHeight()
      }
      console.log(image);
      console.log(wd,ht);
      // console.log(image.getHeight(),'imgggggggggggggg');
      image.selectable = false;
      canvas.setWidth(wd);
      canvas.setHeight(ht);
      canvas.setZoom(1);
      canvas.add(image);
      canvas.centerObject(image);
      canvas.renderAll();
      // big canvassssssss
      bigCanvas.setWidth(wd);
      bigCanvas.setHeight(ht);
      bigCanvas.setZoom(1);
      bigCanvas.add(image);
      bigCanvas.centerObject(image);
      bigCanvas.renderAll();
      bigCanvas.setZoom(bigCanvas.getZoom() * $scope.bigImgZoom);
      bigCanvas.setHeight(bigCanvas.getHeight() * $scope.bigImgZoom);
      bigCanvas.setWidth(bigCanvas.getWidth() * $scope.bigImgZoom);
      bigCanvas.renderAll();
      $scope.scale = 1;
    }, null, {
      crossOrigin: "Anonymous"
    });

  }
  $scope.loadImage = function(idxObj) {
    console.log(idxObj);
    if (idxObj.imgpath!='') {
      $scope.loadcurrentimg(idxObj.imgpath)
      ///getCurrentImage/?path=/home/pradeep/Documents/bacup/libreERP-main/media_root/accord6.pdf&page=1
    }else {
      $scope.loadcurrentimg('/getCurrentImage/?path='+ idxObj.flpath +'&page=' + idxObj.idx )
      return
      $http({
        method: 'POST',
        url: '/api/tools/getCurrentPage/',
        data: {
          flPath: idxObj.flpath,
          idx:idxObj.idx
        },
      }).
      then(function(response) {
        console.log(response.data);
        $scope.imageList[$scope.flags.imageIndex].imgpath = response.data.imageUrl
        $scope.loadcurrentimg(response.data.imageUrl)
      })
    }
  }

  // $scope.loadImage($scope.imgUrl);

  $scope.flags.panning = false;
  // capture the event when the user clicks the mouse button down
  $scope.imgMove = false
  canvas.on("mouse:down", function(event) {
    console.log('clickedddddddddd');

    rectMarker.width = 1;
    rectMarker.height = 1;
    rectangle.width = 1;
    rectangle.height = 1;

    $scope.imgMove = true
    if (!disabled) {
      rectangle.left = (event.e.pageX - container.left) * $scope.scale;
      rectangle.top = (event.e.pageY - container.top) * $scope.scale;
      rectangle.visible = true;
      mouseDown = event.e;
      canvas.bringToFront(rectangle);
    }
  });
  $scope.dragged = false
  // draw the rectangle as the mouse is moved after a down click
  canvas.on("mouse:move", function(event) {

    // console.log(event);
    $scope.norm = { x : (event.e.pageX*100)/canvas.getWidth() , y : (event.e.pageY*100)/canvas.getHeight() }

    $scope.$apply()

    if (mouseDown && !disabled && !$scope.flags.panning) {
      rectangle.width = (event.e.pageX - mouseDown.pageX) * $scope.scale;
      rectangle.height = (event.e.pageY - mouseDown.pageY) * $scope.scale;
      if (rectangle.width >= 50 && rectangle.height >= 20) {
        $scope.dragged = true
      }
      canvas.renderAll();
      // bigCanvas.renderAll();
    }

    if ($scope.flags.panning&&$scope.imgMove&&$scope.zoomedCanvas) {
      console.log('pressssseedd');
      zoomInByMouse = zoomOutByMouse = false;
      zoomCanvasSelection(PanModeByMouse);
      console.log("btnPanModeByMouse: " + PanModeByMouse);
    }




  });
  // when mouse click is released, end cropping mode
  canvas.on("mouse:up", function() {
    console.log('releaseddddddddddd');
    $scope.imgMove = false
    if ($scope.dragged) {
      geturl();
    }
    mouseDown = null;
  });

   var ctrlTyp = false
  function geturl() {
    image.selectable = false;
    disabled = true;
    if (PanModeByMouse) {
      ctrlTyp = true;
    }else {
      ctrlTyp = false;
    }
    rectangle.visible = false;
    var cropped = new Image();
    console.log(rectangle.left / $scope.scale,rectangle.top / $scope.scale,rectangle.width / $scope.scale,rectangle.height / $scope.scale);
    console.log(canvas.width,bigCanvas.width,canvas.height,bigCanvas.height);
    if ($scope.zoomedCanvas||$scope.zoomeOutCanvas) {
      cropped.src = canvas.toDataURL({
        left: (rectangle.left / $scope.scale),
        top: (rectangle.top / $scope.scale),
        width: (rectangle.width / $scope.scale),
        height: (rectangle.height / $scope.scale)
      });
    }else {
      cropped.src = bigCanvas.toDataURL({
        left: (rectangle.left / $scope.scale)*$scope.bigImgZoom,
        top: (rectangle.top / $scope.scale)*$scope.bigImgZoom,
        width: (rectangle.width / $scope.scale)*$scope.bigImgZoom,
        height: (rectangle.height / $scope.scale)*$scope.bigImgZoom
      });
    }
    cropped.onload = function() {
      // canvas.clear();
      cimage = new fabric.Image(cropped);
      cimage.left = rectangle.left;
      cimage.top = rectangle.top;
      cimage.setCoords();
      // canvas.add(image);
      // canvas.renderAll();
      var dataURL = cimage.toDataURL();
      // console.log(dataURL);
      $scope.sendImageUrl(dataURL)
      disabled = false;

    };
  }





  function myFunction() {
    var copyText = document.getElementById("myInput");
    copyText.select();
    document.execCommand("copy", false, null);
    console.log(copyText, 'saaaaaaaaaaa');
  }

  $scope.modelWindow = false
  $scope.showSelectedText = function(text,url,ocrModelPk) {
    $scope.modelWindow = true
    $uibModal.open({
      // template: '<div style="padding:10px;font-size:20px">' +
      //   // '<span>{{text}}</span>' + '<br>' +
      //   '<div style="padding:10px"><textarea type="text" rows="4" class="form-control" ng-model="text" placeholder="Selected Text" style="font-size:18px" id="txtInput"> </textarea> </div>' +
      //   '<div style="padding:10px"><img src="{{imgUrl}}" alt="Cropped Image" width="100%"/> </div>' +
      //   // '<button type="button" class="btn btn-default" ng-click="copyToClipboard()">copy</button>' +
      //   '</div>',
      templateUrl: '/static/ngTemplates/imageViewerCropedText.html',
      size: 'md',
      resolve: {
        data: function() {
          return text;
        },
        imgUrl: function() {
          return url;
        },
        ocrModelPk: function() {
          return ocrModelPk;
        },
        showSendBtn : function() {
          return $scope.showSendBtn;
        }
      },
      controller: function($scope, data,imgUrl,ocrModelPk, $uibModalInstance,$rootScope,$timeout , showSendBtn) {
        $scope.text = data;
        $scope.imgUrl = imgUrl
        $scope.ocrModelPk = ocrModelPk
        $scope.showSendBtn = showSendBtn;
        $scope.keepFocus = function(){
          $timeout(function () {
            document.getElementById("txtInput").focus()
          }, 500);
        }
        $scope.titleCase = function(str){
          var splitStr = str.toLowerCase().split(' ');
          for (var i = 0; i < splitStr.length; i++) {
            splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
          }
          return splitStr.join(' ');
        }
        $scope.formatDate = function(date) {
          var d = new Date(date)
          if (!isNaN(d.getMonth())) {
            console.log(d,d.toISOString(),new Date());
            $scope.text = d.toISOString()
          }else {
            console.log('invalid dateeeeeeeeee');
          }
        }
        $scope.changeText = function(typ){
          if ($scope.text.length==0) {
            return
          }
          if (typ=='cap') {
            $scope.text = $scope.text.toUpperCase()
          }else if (typ=='small') {
            $scope.text = $scope.text.toLowerCase()
          }else if (typ=='cam') {
            $scope.text = $scope.text.charAt(0).toUpperCase() + $scope.text.slice(1).toLowerCase()
          }else if (typ=='fstCap') {
            $scope.text = $scope.titleCase($scope.text)
          }
          // else {
          //   $http({
          //     method: 'GET',
          //     url: '/api/tools/spellCheck/?txt='+$scope.text,
          //   }).
          //   then(function(response) {
          //     console.log(response.data);
          //     $scope.text = response.data.txt;
          //   })
          // }
        }
        $rootScope.copyToClipboard = function(format) {
          // console.log($scope.text, '--------', data);
          var copyText = document.getElementById("txtInput");
          copyText.select();
          document.execCommand("copy");
          if ($scope.ocrModelPk>0) {
            $http({
              method: 'PATCH',
              url: '/api/tools/ocrModel/'+$scope.ocrModelPk+'/',
              data: {userValue: $scope.text},
            }).
            then(function(response) {
              console.log(response.data);
            })
          }
          $uibModalInstance.dismiss({txt:copyText.value,typ:'autofill' , format : format});
        }
      },
    }).result.then(function() {
    //
  }, function(a) {
        $scope.modelWindow = false
        if (typeof a == 'object' && a.format) {
          console.log(a);
          parent.postMessage(a, "*");
        }
      });
  }
  $scope.zoomedCanvas = false
  $scope.zoomeOutCanvas = false

  var SCALE_FACTOR = 1.3;
  var zoomMax = 10;
  $scope.zoom = function(value) {
    if (value == 'zoomin') {
      zoomIn();
    } else if (value == 'zoomout') {
      zoomOut();
    } else if (value == 'reset') {
      resetZoom();
    } else if (value == 'fitToWidth') {
      fitToWidth();
    } else if (value == 'fitToHeight') {
      fitToHeight();
    }
    console.log(value);
  }
  // Zoom In
  function zoomIn() {
    if (canvas.getZoom().toFixed(5) > 1) {
      $scope.zoomeOutCanvas = false
    }
    if (canvas.getZoom().toFixed(5) > zoomMax) {
      console.log("zoomIn: Error: cannot zoom-in anymore");
      Flash.create('warning', 'cannot zoom-in anymore');
      return;
    }
    canvas.setZoom(canvas.getZoom() * SCALE_FACTOR);
    canvas.setHeight(canvas.getHeight() * SCALE_FACTOR);
    canvas.setWidth(canvas.getWidth() * SCALE_FACTOR);
    canvas.renderAll();
    $scope.scale = $scope.scale / SCALE_FACTOR;
    $scope.zoomedCanvas = true
  }
  // Zoom Out
  function zoomOut() {
    if (canvas.getZoom().toFixed(5) <= 1) {
      $scope.zoomedCanvas = false
      $scope.zoomeOutCanvas = true
      // console.log("zoomOut: Error: cannot zoom-out anymore");
      // Flash.create('warning', 'cannot zoom-out anymore');
      // return;
    }
    canvas.setZoom(canvas.getZoom() / SCALE_FACTOR);
    canvas.setHeight(canvas.getHeight() / SCALE_FACTOR);
    canvas.setWidth(canvas.getWidth() / SCALE_FACTOR);
    canvas.renderAll();
    $scope.scale = $scope.scale * SCALE_FACTOR;
  }

  // Reset Zoom
  function resetZoom() {

    $scope.loadcurrentimg($scope.currentImgPath);

    // canvas.setHeight(canvas.getHeight() / canvas.getZoom());
    // canvas.setWidth(canvas.getWidth() / canvas.getZoom());
    // canvas.setZoom(1);
    // canvas.centerObject(image);
    // canvas.renderAll();
    // $scope.scale = 1;
    // $scope.zoomedCanvas = false
    // $scope.zoomeOutCanvas = false
  }


  $scope.logout = function() {
    parent.postMessage('logout', "*");
  }

  // Fit To Width
  function fitToWidth() {
    if ($scope.currentImgPath) {
      $scope.loadcurrentimg($scope.currentImgPath,'width')
    }
  }

  // Fit To Height
  function fitToHeight() {
    if ($scope.currentImgPath) {
      $scope.loadcurrentimg($scope.currentImgPath,'height')
    }
  }


  document.addEventListener('keydown', keyDownHandler, false);
  document.addEventListener('keyup', keyUpHandler, false);

  function keyDownHandler(event) {
    if (event.ctrlKey && event.keyCode==67 && $scope.modelWindow) {
      console.log('copy and close');
      $rootScope.copyToClipboard(false)
    }else if (event.ctrlKey && event.keyCode==37 && !$scope.modelWindow) {
      console.log('rotateLeft','ctrl + leftarrow');
      $scope.rotateLeft()
    }else if (event.ctrlKey && event.keyCode==39 && !$scope.modelWindow) {
      console.log('rotateRight','ctrl + rightarrow');
      $scope.rotateRight()
    }else if (event.ctrlKey && event.keyCode==38 && !$scope.modelWindow) {
      console.log('zoomin','ctrl + uparrow');
      $scope.zoom('zoomin')
    }else if (event.ctrlKey && event.keyCode==40 && !$scope.modelWindow) {
      console.log('zoomout','ctrl + downarrow');
      $scope.zoom('zoomout')
    }else if (event.ctrlKey && event.keyCode==32 && !$scope.modelWindow) {
      console.log('reset','ctrl + space');
      $scope.zoom('reset')
    }
    // else if (event.ctrlKey && event.keyCode==87 && !$scope.modelWindow) {
    //   console.log('fitToWidth','ctrl + w');
    //   $scope.zoom('fitToWidth')
    // }else if (event.ctrlKey && event.keyCode==72 && !$scope.modelWindow) {
    //   console.log('fitToHeight','ctrl + h');
    //   $scope.zoom('fitToHeight')
    // }
    else if (event.ctrlKey) {
      console.log('draggingggg','ctrl + draggg');
      $scope.flags.panning = false;
      PanModeByMouse = true
    }
  }


  function zoomCanvasSelection(isSelectable) {
    $scope.dragged = false;
    rectangle.visible = false;
    isSelectable = (isSelectable == true);
    canvas.selection = isSelectable;
    console.log(isSelectable,'cannnnnnnnnn');
    canvas.forEachObject(function(o) {
      o.selectable = isSelectable;
    });
  }

  function keyUpHandler(event) {
    $scope.flags.panning = false;
    if (event.ctrlKey) {
      PanModeByMouse = true
    }else {
      console.log('ctrl uppppppppppp');
      PanModeByMouse = false
    }

  }

  $scope.sendImageUrl = function(url) {
    console.log(ctrlTyp,'controllllll typpppppppppppppp');
    $http({
      method: 'POST',
      url: '/api/tools/getTextFromImage/',
      data: {
        imgUrl: url,
        ctrlTyp:ctrlTyp
      },
    }).
    then(function(response) {
      console.log(response.data);
      $scope.txtData = response.data;
      $scope.dragged = false;
      $scope.showSelectedText(response.data.imageText,url,response.data.ocrModelPk)
    })
  }

})
