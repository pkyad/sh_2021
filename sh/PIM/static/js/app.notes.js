app.controller("controller.home.notes", function($scope, $state, $users, $stateParams, $http, Flash) {

  //--------------------fetch notebooks-------------
  $http({
    method: 'GET',
    url: '/api/PIM/notebook/'
  }).
  then(function(response) {
    $scope.notebooks = response.data;
    if (response.data.length != 0) {
      $scope.bookInView = 0;
    } else {
      dataToSend = {
        user: $scope.me.pk,
        title: 'untitled',
      }
      $http({
        method: 'POST',
        url: '/api/PIM/notebook/',
        data: dataToSend
      }).
      then(function(response) {
        $scope.notebooks.push(response.data);
        console.log($scope.notebooks);
        $scope.bookInView = 0;
      })
    }
  })

  //--------------------------open book and view pages----
  $scope.pages = [];
  $scope.openBook = function(pid) {
    // console.log(pid, '---------parent');
    $http({
      method: 'GET',
      url: '/api/PIM/page/?parent=' + pid,
    }).
    then(function(response) {
      $scope.pages = response.data;
      console.log($scope.pages, '-------opened page is');
      setTimeout(function() {
        for (var i = 0; i < $scope.pages.length; i++) {
          $scope.createCanvas(i, $scope.pages[i].source)
        }
      }, 700);

    })
  }

  $scope.activeTab = 0;
  $scope.openPage = function(id, pid, indx) {
    $scope.activeTab = indx
  }

  $scope.notebooks = [];
  $scope.canvas = [];
  $scope.editor = {
    pencil: false
  };



  $scope.createCanvas = function(i, src) {

    $scope.canvas.push(new fabric.Canvas('canvas' + i))
    $scope.canvas[i].loadFromJSON(src, $scope.canvas[i].renderAll.bind($scope.canvas[i]));

    $scope.color = '#000'

    $scope.pencil = function(indx) {
      $scope.textOn = false
      console.log('pencil');
      $scope.canvas[indx].isDrawingMode = true
      $scope.canvas[indx].freeDrawingBrush.color = $scope.color;
    }

    $scope.setColor = function(col, indx) {
      console.log(col, '------is the color');
      $scope.color = col;
      $scope.canvas[indx].freeDrawingBrush.color = col;
    }

    $scope.clearAll = function(indx) {
      $scope.canvas[indx].clear().renderAll();
    }

    $scope.startx;
    $scope.starty;
    $scope.endx;
    $scope.endy;

    $scope.canvas[i].on('mouse:down', function(options) {
      if ($scope.textOn) {
        if (!$scope.canvas[i].isDrawingMode) {
          $scope.addText(i);
        }
      }
      $scope.pointer = $scope.canvas[i].getPointer(options.e);
      $scope.startx = $scope.pointer.x;
      $scope.starty = $scope.pointer.y;
    });

    $scope.canvas[i].on('mouse:move', function(options) {
      $scope.pointer = $scope.canvas[i].getPointer(options.e);
      $scope.endx = $scope.pointer.x;
      $scope.endy = $scope.pointer.y;
    });

    $scope.shape = function(indx, ob) {
      $scope.canvas[indx].isDrawingMode = false;
      console.log($scope.color);
      // $scope.setColor('black',indx);
      console.log(indx, '---------', ob);
      if (ob == 0) {
        var rect = new fabric.Rect({
          top: $scope.starty,
          left: $scope.startx,
          width: 60,
          height: 70,
          fill: false,
          stroke: $scope.color
        });
        $scope.canvas[indx].add(rect).setActiveObject(rect);
      } else if (ob == 1) {
        var circle = new fabric.Circle({
          radius: 30,
          fill: false,
          stroke: $scope.color,
          left: $scope.startx,
          top: $scope.starty
        });
        $scope.canvas[indx].add(circle).setActiveObject(circle);
      } else if (ob == 2) {
        var triangle = new fabric.Triangle({
          width: 60,
          height: 60,
          fill: false,
          stroke: $scope.color,
          left: $scope.startx,
          top: $scope.starty
        });
        $scope.canvas[indx].add(triangle).setActiveObject(triangle);
      }

    }

    $scope.addImage = function(indx) {
      fabric.Image.fromURL('/static/images/about/2.jpg', function(img) {
        img.scale(0.5).set({
          left: $scope.startx,
          top: $scope.starty,
        });
        $scope.canvas[indx].add(img).setActiveObject(img);
      });
    }


    $scope.addText = function(indx) {
      console.log('text');
      $scope.textOn = true
      $scope.canvas[indx].isDrawingMode = false

      // console.log("will add text");
      newText = new fabric.IText('', {
        fontFamily: 'arial black',
        left: $scope.startx,
        top: $scope.starty,
        fontSize: 14,
        fill: $scope.color
      });
      $scope.canvas[indx].add(newText);
      $scope.canvas[indx].setActiveObject(newText);
      newText.enterEditing();
      newText.hiddenTextarea.focus();
    }

    $scope.save = function(indx) {
      console.log($scope.pages[indx].pk, '----------pk');
      dataToSend = {
        source: JSON.stringify($scope.canvas[indx]),
        parent: $scope.pages[indx].parent,
        title: $scope.pages[indx].title,
        user: $scope.me.pk,
      }
      $http({
        method: 'PATCH',
        url: '/api/PIM/page/' + $scope.pages[indx].pk + '/',
        data: dataToSend
      }).
      then(function(response) {
        Flash.create('success', response.status + ' : ' + response.statusText);
      }, function(response) {
        Flash.create('danger', response.status + ' : ' + response.statusText);
      })
    }

  } //========create canvas ends

});
