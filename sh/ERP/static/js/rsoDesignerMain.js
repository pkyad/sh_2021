var app = angular.module('app', ['ui.bootstrap']);

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

app.directive("contenteditable", function() {
  return {
    restrict: "A",
    require: "ngModel",
    link: function(scope, element, attrs, ngModel) {

      function read() {
        ngModel.$setViewValue(element.html());
      }

      ngModel.$render = function() {
        element.html(ngModel.$viewValue || "");
      };

      element.bind("blur keyup change", function() {
        scope.$apply(read);
      });
    }
  };
});


function getConnectorDimension(p1 , p2, arrowElem , labelElem) {

  if (p1.centerX < p2.centerX) {
    pointX = p1.centerX;
  }else{
    pointX = p2.centerX;
  }

  if (p1.centerY < p2.centerY) {
    pointY = p1.centerY;
  }else{
    pointY = p2.centerY;
  }

  width = Math.abs(p1.centerX-p2.centerX)
  height = Math.abs(p1.centerY-p2.centerY)



  if (p1.centerY > p2.centerY && p1.centerX > p2.centerX) {
    css = {"border-top":"solid 2px rgb(41, 157, 142)", "border-right":"solid 2px rgb(41, 157, 142)","border-bottom":"none", "border-left":"none" };

    if (pointX + width < (p2.centerX + p2.w/2)) {
      // console.log(1);
      arrowElem.css({"margin-top": (p2.h/2+10) +"px","position": "absolute","right": "-5px", "transform": "rotate(-90deg)", "left" : "unset", "bottom": "unset" })

      labelElem.css({"margin-top": (p2.h/2+10)+"px","right": "10px", "left" : "unset", "bottom": "unset"})

    }else{
      // console.log(2);
      arrowElem.css({"margin-top": "-13px","position": "absolute","right": "initial", "transform": "rotate(180deg)", "left": (p2.w/2 + 10) +"px", "bottom": "unset" })
    }

  }else if (p1.centerY > p2.centerY && p1.centerX > p2.centerX) {
    css = {"border-top":"solid 2px rgb(41, 157, 142)", "border-left":"solid 2px rgb(41, 157, 142)","border-bottom":"none", "border-right":"none" };
    if (pointX > (p2.centerX - p2.w/2)) {
      // console.log(3);
      arrowElem.css({"margin-top": "-16px","position": "absolute","right": p2.w/2 +"px", "transform": "rotate(90deg)", "left" : "unset", "bottom": "unset"})
    }else{
      // console.log(4);
      arrowElem.css({"margin-top": "-16px","position": "absolute","right": p2.w/2 +"px", "transform": "rotate(0deg)", "left" : "unset", "bottom": "unset"})
    }

  }else if (p1.centerY < p2.centerY && p1.centerX < p2.centerX) {
    css = {"border-top":"solid 2px rgb(41, 157, 142)", "border-right":"solid 2px rgb(41, 157, 142)","border-bottom":"none", "border-left":"none" };
    if (pointY > (p2.centerY - p2.h/2)) {
      // console.log(5);
      arrowElem.css({"margin-top": "-16px","position": "absolute","right": p2.w/2 +"px", "transform": "rotate(0deg)", "left" : "unset", "bottom": "unset"})

      labelElem.css({"margin-top": "4px","right": (p2.w/2+20) +"px", "left" : "unset", "bottom": "unset"})

    }else{
      // console.log(6);
      arrowElem.css({"margin-top": "unset","position": "absolute","right": "-7px", "transform": "rotate(90deg)" , "left" : "unset", "bottom" : p2.h/2 +"px"})

      labelElem.css({"margin-top": "4px","right": "15px", "left" : "unset", "bottom": p2.h/2 +"px"})


    }
  }else{
    css = {"border-top":"solid 2px rgb(41, 157, 142)", "border-left":"solid 2px rgb(41, 157, 142)","border-bottom":"none", "border-right":"none" };
    if (pointX > (p2.centerX - p2.w/2)  && pointY < (p2.centerY - p2.h/2)) {

      if (p2.centerY<p1.centerY) {
        // console.log(7);
        arrowElem.css({"margin-top": p2.h/2 +"px","position": "absolute","right": "unset", "transform": "rotate(-90deg)", "left" : "-7px", "bottom": "unset"})
      }else{
        // console.log(9);
        arrowElem.css({"margin-top": "unset","position": "absolute","right": "unset", "transform": "rotate(90deg)", "left" : "-5px", "bottom": p2.h/2 +"px"})

        labelElem.css({"margin-top": "unset","right": "unset", "left" : "15px", "bottom": p2.h/2 +"px"})


      }

    }else{
      if (p2.centerX-p2.w/2 > pointX) {
        // console.log(8);
        arrowElem.css({"margin-top": "-16px","position": "absolute","right": p2.w/2 +"px", "transform": "rotate(0deg)", "left" : "unset", "bottom": "unset"})

        labelElem.css({"margin-top": "4px","right": (p2.w/2+20) +"px", "left" : "unset", "bottom": "unset"})

      }else{
        if (pointX< p2.centerX) {
          // console.log(10);
          arrowElem.css({"margin-top": (p2.h/2 +10) +"px","position": "absolute","right": "unset", "transform": "rotate(-90deg)", "left" : "-6px", "bottom": "unset"})

          labelElem.css({"margin-top": (p2.h/2+10)+"px","right": "unset", "left" : "10px", "bottom": "unset"})


        }else{
          // console.log(11);
          arrowElem.css({"margin-top": "-13px","position": "absolute","right": "unset", "transform": "rotate(-180deg)", "left" : (p2.w/2 + 10) + "px", "bottom": "unset"})

          labelElem.css({"margin-top": "unset","right": "unset", "left" : (p2.w/2 + 30) + "px", "bottom": "unset"})
        }

      }


    }
  }

  return {x : pointX , y : pointY , w : width , h : height, css : css}
}

function getElementCenter(elem) {
  var offset = elem.offset();
  var width = elem.width();
  var height = elem.height();
  var centerX = offset.left + width / 2;
  var centerY = offset.top + height / 2;
  return {centerX : centerX , centerY : centerY, w : width , h : height}
}

app.controller('main', function($scope, $http, $timeout) {

  $scope.newID = 10

  $scope.addBlock = function(indx, from , evnt , typ) {
    console.log(evnt);

    var newID = $scope.newID;

    $scope.newID += 1;

    if (typ == 'action') {
      $scope.blocks.push({
        "type": "block",
        "name": "Send to Coder 1 group",
        "description": "Wait for correction",
        "width": 290,
        "height": 100,
        "x": evnt.clientX,
        "y": evnt.clientY,
        "color": "#424242",
        "id": newID,
        "label": "User Action",
        "icon": null,
        "hovering": false,
        "newx": evnt.clientX,
        "newy": evnt.clientY,
        "canAdd": true
      })
    }else if (typ == 'condition') {
      $scope.blocks.push({
        "type": "condition",
        "name": "Check for approval",
        "description": "",
        "width": 200,
        "height": 45,
        "x": evnt.clientX,
        "y": evnt.clientY,
        "color": "#607d8b",
        "id": newID,
        "label": "System",
        "icon": null,
        "hovering": false,
        "newx": evnt.clientX,
        "newy": evnt.clientY,
        "canAdd": true
      })
    }else if (typ == 'process') {
      $scope.blocks.push({
        "type": "block",
        "name": "Invoke UIPath",
        "description": "Run process ID 320187 with Prod env",
        "width": 290,
        "height": 100,
        "x": evnt.clientX,
        "y": evnt.clientY,
        "color": "#ab003c",
        "id": newID,
        "label": null,
        "icon": "/static/images/uipath.png",
        "hovering": false,
        "newx": evnt.clientX,
        "newy": evnt.clientY,
        "canAdd": true
      })
    }else if (typ == 'notification') {
      $scope.blocks.push({
        "type": "block",
        "name": "Notify users",
        "description": "Send email to HR",
        "width": 290,
        "height": 100,
        "x": evnt.clientX,
        "y": evnt.clientY,
        "color": "#ff5722",
        "id": newID,
        "label": "Notification",
        "icon": null,
        "hovering": false,
        "newx": evnt.clientX,
        "newy": evnt.clientY,
        "canAdd": true
      })
    }else if (typ == 'logic') {
      $scope.blocks.push({
        "type": "block",
        "name": "Update salesforce",
        "description": "Python code",
        "width": 290,
        "height": 100,
        "x": evnt.clientX,
        "y": evnt.clientY,
        "color": "#f8b721",
        "id": newID,
        "label": null,
        "icon": '/static/images/python.png',
        "hovering": false,
        "newx": evnt.clientX,
        "newy": evnt.clientY,
        "canAdd": true
      })
    }else if (typ == 'case') {
      $scope.blocks.push({
        "type": "conditionOption",
        "name": "",
        "description": "approved",
        "width": 200,
        "height": 45,
        "x": evnt.clientX,
        "y": evnt.clientY,
        "color": "#607d8b",
        "id": newID,
        "label": "System",
        "icon": null,
        "hovering": false,
        "newx": evnt.clientX,
        "newy": evnt.clientY,
        "canAdd": true
      })
    }

    if (typ != 'case') {
      $scope.blocks[indx].canAdd = false;
    }

    var lbl = '';

    if (typ == 'condition') {
      lbl = 'switch';
    }else if (typ == 'case') {
      lbl = 'case';
    }

    $scope.connectors.push({from : from.id , to : newID , label : lbl});

    $timeout(function() {
      var i = $scope.blocks.length -1;
      var elem = $('#draggable'+$scope.blocks[i].id)

      elem.css({top:$scope.blocks[i].newy + "px" , left: $scope.blocks[i].newx +"px" })

      elem.draggable({ handle:'.handle', drag: function(evt) {
        offsets = $( '#' + evt.target.id).offset();
        for (var i = 0; i < $scope.blocks.length; i++) {
          if ($scope.blocks[i].id == parseInt( evt.target.id.replace('draggable', '')) ) {
            $scope.blocks[i].newx = offsets.left;
            $scope.blocks[i].newy = offsets.top;
          }
        }

        $scope.updateConnector()
      }});
    },200)


  }


  $scope.blocks =[{
    "type": "start",
    "name": "Wait for email",
    "description": "Subscribe to info@cioc.in",
    "width": 290,
    "height": 100,
    "x": 121,
    "y": 23,
    "color": "#3f51b5",
    "id": 1,
    "label": "Event",
    "icon": null,
    "hovering": false,
    "newx": 15,
    "newy": 155,
    "canAdd": false
  }, {
    "type": "block",
    "name": "Notify users",
    "description": "Send email to HR",
    "width": 290,
    "height": 100,
    "x": 489,
    "y": 280.6000061035156,
    "color": "#ff5722",
    "id": 2,
    "label": "Notification",
    "icon": null,
    "hovering": false,
    "newx": 325,
    "newy": 441.6000061035156,
    "canAdd": true
  }, {
    "type": "block",
    "name": "Send to Coder 1 group",
    "description": "Wait for correction",
    "width": 290,
    "height": 100,
    "x": 1090,
    "y": 123.60000610351562,
    "color": "#424242",
    "id": 3,
    "label": "User Action",
    "icon": null,
    "hovering": false,
    "newx": 631,
    "newy": 262.6000061035156,
    "canAdd": false
  }, {
    "type": "block",
    "name": "Invoke UIPath",
    "description": "Run process ID 320187 with Prod env",
    "width": 290,
    "height": 100,
    "x": 1169,
    "y": -80.39999389648438,
    "color": "#ab003c",
    "id": 4,
    "label": null,
    "icon": "/static/images/uipath.png",
    "hovering": false,
    "newx": 810,
    "newy": 52.600006103515625,
    "canAdd": true
  }, {
    "type": "condition",
    "name": "Check for approval",
    "description": "",
    "width": 200,
    "height": 45,
    "x": 543,
    "y": 46,
    "color": "#607d8b",
    "id": 5,
    "label": "System",
    "icon": null,
    "hovering": false,
    "newx": 379,
    "newy": 175,
    "canAdd": true
  }, {
    "type": "conditionOption",
    "name": "",
    "description": "approved",
    "width": 200,
    "height": 45,
    "x": 858,
    "y": -54.399993896484375,
    "color": "#607d8b",
    "id": 6,
    "label": "System",
    "icon": null,
    "hovering": false,
    "newx": 549,
    "newy": 84.60000610351562,
    "canAdd": false
  }, {
    "type": "conditionOption",
    "name": "",
    "description": "need correction",
    "width": 200,
    "height": 45,
    "x": 848,
    "y": 42.600006103515625,
    "color": "#607d8b",
    "id": 7,
    "label": "System",
    "icon": null,
    "hovering": false,
    "newx": 667,
    "newy": 173.60000610351562,
    "canAdd": false
  }, {
    "type": "conditionOption",
    "name": "",
    "description": "not approved",
    "width": 200,
    "height": 45,
    "x": 533,
    "y": 187.60000610351562,
    "color": "#607d8b",
    "id": 8,
    "label": "System",
    "icon": null,
    "hovering": false,
    "newx": 373,
    "newy": 311.6000061035156,
    "canAdd": false
  }, {
    "type": "end",
    "name": "Update salesforce",
    "description": "Python code",
    "width": 290,
    "height": 100,
    "x": 533,
    "y": 187.60000610351562,
    "color": "#f8b721",
    "id": 9,
    "label": null,
    "icon": '/static/images/python.png',
    "hovering": false,
    "newx": 673,
    "newy": 500,
    "canAdd": false
  }]

  for (var i = 0; i < $scope.blocks.length; i++) {
    $scope.blocks[i].x = $scope.blocks[i].newx;
    $scope.blocks[i].y = $scope.blocks[i].newy-200;
  }


  // $scope.blocks = [
  //   {type : "block", name : "Invoke UIPath" , description : "Call invoice process",  width: 290 , height: 100 , x : 300 , y : 100 , color : "#3f51b5", id : 1 , label : "" , icon : '/static/images/uipath.png'},
  //   {type : "block", name : "Notify users" , description : "Send email to HR",  width: 290 , height: 100 , x : 200 , y : 100 , color : "#ff5722", id : 2, label : "User" , icon : null},
  //   {type : "block", name : "step1" , description : "",  width: 290 , height: 100 , x : 400 , y : 100 , color : "#424242", id : 3, label : "Approval" , icon : null},
  //   {type : "block", name : "step1" , description : "",  width: 290 , height: 100 , x : 500 , y : 100 , color : "#ab003c", id : 4, label : "System" , icon : null},
  //   {type : "condition", name : "Check for approval" , description : "",  width: 200 , height: 45 , x : 700 , y : 100 , color : "#607d8b", id : 5, label : "System" , icon : null},
  //   {type : "conditionOption", name : "" , description : "approved",  width: 200 , height: 45 , x : 700 , y : 100 , color : "#607d8b", id : 6, label : "System" , icon : null},
  //   {type : "conditionOption", name : "" , description : "need correction",  width: 200 , height: 45 , x : 700 , y : 100 , color : "#607d8b", id : 7, label : "System" , icon : null},
  //   {type : "conditionOption", name : "" , description : "not approved",  width: 200 , height: 45 , x : 700 , y : 100 , color : "#607d8b", id : 8, label : "System" , icon : null},
  // ]

  $scope.connectors = [
    {from : 8 , to : 2 , label : ""},
    {from : 7 , to : 3 , label : ""},
    {from : 6 , to : 4 , label : ""},
    {from : 1 , to : 5 , label : "switch"},
    {from : 5 , to : 6 , label : "case"},
    {from : 5 , to : 7 , label : "case"},
    {from : 5 , to : 8 , label : "case"},
    {from : 3 , to : 9 , label : ""},
  ]

  $scope.save = function() {
    console.log(JSON.stringify($scope.blocks));
  }

  $scope.delete = function(indx) {
    var id = $scope.blocks[indx].id;
    $scope.blocks.splice(indx , 1);
    var connectors = angular.copy($scope.connectors)
    $scope.connectors = []

    for (var i = 0; i < connectors.length; i++) {
      if (connectors[i].from == id || connectors[i].to == id) {
        continue;
      }

      $scope.connectors.push(connectors[i])

      $timeout(function() {
        $scope.updateConnector();
      },300)

    }
  }

  $scope.updateConnector = function() {
    for (var i = 0; i < $scope.connectors.length; i++) {
      p1 = getElementCenter($('#draggable'+ $scope.connectors[i].from ))
      p2 = getElementCenter($('#draggable' + $scope.connectors[i].to ))

      var arrowElem = $('#arrow'+ $scope.connectors[i].from+'-'+ $scope.connectors[i].to)
      var labelElem = $('#label'+ $scope.connectors[i].from+'-'+ $scope.connectors[i].to)
      var connectorDim = getConnectorDimension(p1 , p2, arrowElem , labelElem)
      var connector = $('#connector'+ $scope.connectors[i].from+'-'+ $scope.connectors[i].to)
      connector.css({top: connectorDim.y, left: connectorDim.x, width: connectorDim.w , height: connectorDim.h});
      connector.css(connectorDim.css)
    }
  }

  $timeout(function() {
    $('body').attr("spellcheck",false)

    for (var i = 0; i < $scope.blocks.length; i++) {
      var elem = $('#draggable'+$scope.blocks[i].id)

      elem.css({top:$scope.blocks[i].newy + "px" , left: $scope.blocks[i].newx +"px" })

      elem.draggable({handle:'.handle', drag: function(evt) {
        offsets = $( '#' + evt.target.id).offset();
        for (var i = 0; i < $scope.blocks.length; i++) {
          if ($scope.blocks[i].id == parseInt( evt.target.id.replace('draggable', '')) ) {
            $scope.blocks[i].newx = offsets.left;
            $scope.blocks[i].newy = offsets.top;
          }
        }

        $scope.updateConnector()
      }});

    }

    $scope.updateConnector()

  },2000)





});
