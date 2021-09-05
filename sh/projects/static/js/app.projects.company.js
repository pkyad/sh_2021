app.controller('projectManagement.projects.company', function($scope, $http, $aside, $state, Flash, $users, $filter, $permissions) {
  $scope.data = {
    tableData: []
  };

  views = [{
    name: 'list',
    icon: 'fa-th-large',
    template: '/static/ngTemplates/genericTable/genericSearchList.html',
    itemTemplate: '/static/ngTemplates/app.projects.company.item.html',
  }, ];


  $scope.config = {
    views: views,
    url: '/api/ERP/service/',
    filterSearch: true,
    searchField: 'name or web',
    deletable: true,
    itemsNumPerView: [12, 24, 48],
    // getParams: [{
    //   key: 'vendor',
    //   value: false
    // }]
  }


  $scope.tableAction = function(target, action, mode) {
    console.log(target, action, mode);
    console.log($scope.data.tableData);

    for (var i = 0; i < $scope.data.tableData.length; i++) {
      if ($scope.data.tableData[i].pk == parseInt(target)) {
        if (action == 'edit') {
          var title = 'Edit Customer :';
          var appType = 'customerEditor';
        } else if (action == 'details') {
          var title = 'Details :';
          var appType = 'customerExplorer';
        }


        console.log({
          title: title + $scope.data.tableData[i].name,
          cancel: true,
          app: appType,
          data: {
            pk: target,
            index: i
          },
          active: true
        });


        $scope.addTab({
          title: title + $scope.data.tableData[i].name,
          cancel: true,
          app: appType,
          data: {
            pk: target,
            index: i
          },
          active: true
        })
      }
    }

  }


  $scope.tabs = [];
  $scope.searchTabActive = true;

  $scope.closeTab = function(index) {
    $scope.tabs.splice(index, 1)
  }

  $scope.addTab = function(input) {
    console.log(JSON.stringify(input));
    $scope.searchTabActive = false;
    alreadyOpen = false;
    for (var i = 0; i < $scope.tabs.length; i++) {
      if ($scope.tabs[i].data.pk == input.data.pk && $scope.tabs[i].app == input.app) {
        $scope.tabs[i].active = true;
        alreadyOpen = true;
      } else {
        $scope.tabs[i].active = false;
      }
    }
    if (!alreadyOpen) {
      $scope.tabs.push(input)
    }
  }

  $scope.$on('exploreCustomer', function(event, input) {
    console.log("recieved");
    console.log(input);
    $scope.addTab({
      "title": "Details :" + input.customer.name,
      "cancel": true,
      "app": "customerExplorer",
      "data": {
        "pk": input.customer.pk
      },
      "active": true
    })
  });


  $scope.$on('editCustomer', function(event, input) {
    console.log("recieved");
    console.log(input);
    $scope.addTab({
      "title": "Edit :" + input.customer.name,
      "cancel": true,
      "app": "customerEditor",
      "data": {
        "pk": input.customer.pk,
        customer: input.customer
      },
      "active": true
    })
  });


});


app.controller("projectManagement.projects.company.form", function($scope, $state, $users, $stateParams, $http, Flash) {


  $scope.resetForm = function() {
    $scope.form = {
      name: '',
      // user: '',
      mobile: '',
      about: '',
      telephone: '',
      cin: '',
      tin: '',
      logo: '',
      web: '',
      address: {
        street: '',
        city: '',
        state: '',
        country: '',
        pincode: ''
      }
    }
  }


  if (typeof $scope.tab == 'undefined') {
    $scope.mode = 'new';
    $scope.resetForm()
  } else {
    $scope.mode = 'edit';
    $scope.form = $scope.data.tableData[$scope.tab.data.index]
  }


  // $scope.userSearch = function(query) {
  //   //search for the user
  //   return $http.get('/api/HR/userSearch/?username__contains=' + query).
  //   then(function(response) {
  //     return response.data;
  //   })
  // }

  $scope.createCompany = function() {
    console.log('jbvjbdvjbdjfvbfd................');
    if (typeof $scope.form.name != "string" || $scope.form.name.length == 0) {
      Flash.create('warning', 'Company name is Required')
      return
    }
    // if (typeof $scope.form.user != "object") {
    //   Flash.create('warning', 'Please Select Suggested User')
    //   return
    // }
    var method = 'POST'
    var addUrl = '/api/ERP/address/'
    var serviceUrl = '/api/ERP/service/'

    if ($scope.mode == 'edit') {
      method = 'PATCH'
      addUrl = addUrl + $scope.form.address.pk + '/'
      serviceUrl = serviceUrl + $scope.form.pk + '/'
    }
    console.log(addUrl, serviceUrl);
    $http({
      method: method,
      url: addUrl,
      data: $scope.form.address
    }).
    then(function(response) {
      var dataToSend = {
        name: $scope.form.name,
        mobile: $scope.form.mobile,
        about: $scope.form.about,
        address: response.data.pk,
        telephone: $scope.form.telephone,
        cin: $scope.form.cin,
        tin: $scope.form.tin,
        logo: $scope.form.logo,
        web: $scope.form.web,
      };
      $http({
        method: method,
        url: serviceUrl,
        data: dataToSend
      }).
      then(function(response) {
        Flash.create('success', 'Created');
        if ($scope.mode == 'new') {
          $scope.resetForm()
        }
      });
    })

  }

})



app.controller("projectManagement.projects.company.explore", function($scope, $state, $users, $stateParams, $http, Flash) {




  console.log('ssssssssssssss');
  if ($scope.data != undefined) {
    $scope.customerData = $scope.data.tableData[$scope.tab.data.index]
  }
  console.log($scope.data, $scope.contact);

  $http({
    method: 'GET',
    url: '/api/clientRelationships/contact/?company=' + $scope.customerData.pk
  }).
  then(function(response) {
    // console.log(response.data);
    $scope.contactItems = response.data;
    // console.log($scope.contactItems,'fhsdvfhsdvfhvsdh');
  })

  $http({
    method: 'GET',
    url: '/api/projects/project/?company=' + $scope.customerData.pk
  }).
  then(function(response) {
    console.log( response.data,'bbbbbbbbb');
    // console.log(response.data);
    $scope.projects = response.data;
    // console.log($scope.contactItems,'fhsdvfhsdvfhvsdh');
  })



})
