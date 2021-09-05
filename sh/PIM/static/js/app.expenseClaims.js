app.controller('controller.home.expense.claims', function($scope, $http, $aside, $state, Flash, $users, $filter, $permissions) {
  // settings main page controller

  $scope.loadTags = function(query) {
    return $http.get('/api/HR/userSearch/?username__contains=' + query)
  };

  $scope.createExpense = function() {

    var dataToSend = {
      title: 'a sample title',
      title: 'a sample title',
    }

    $http({
      method: 'post',
      url: '/api/finance/expenseSheet/',
      data: dataToSend
    }).
    then(function(response) {
      var pk = response.data.pk;
      $scope.users = []
    }, function(error) {

    })
  }

  $scope.users = [];

  $scope.data = {
    tableData: []
  };
  views = [{
    name: 'list',
    icon: 'fa-th-large',
    template: '/static/ngTemplates/genericTable/genericSearchList.html',
    itemTemplate: '/static/ngTemplates/app.home.expenseClaims.item.html',
  }, ];
  var options = {
    main: {
      icon: 'fa-pencil',
      text: 'edit'
    },
  };

  $scope.config = {
    views: views,
    url: '/api/finance/expenseSheet/',
    searchField: 'notes',
    deletable: true,
    itemsNumPerView: [10, 20, 25],
  }

  $scope.tableAction = function(target, action, mode) {
    console.log(target, action, mode);
    console.log($scope.data.tableData);

    for (var i = 0; i < $scope.data.tableData.length; i++) {
      if ($scope.data.tableData[i].pk == parseInt(target)) {
        if (action == 'edit') {
          var title = 'Edit expense sheet : ';
          var myapp = 'expenseSheetEdit';
        } else if (action == 'expenseSheetBrowser') {
          var title = 'Browse expense sheet : ';
          var myapp = 'expenseSheetBrowser';
        }
        $scope.addTab({
          title: title + $scope.data.tableData[i].pk,
          cancel: true,
          app: myapp,
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


})

app.controller('home.expense.claims.item', function($scope, $http) {

});


app.controller('home.expenseSheet.invoiceView', function($scope, $http, input) {
  console.log(input);
  $scope.invoice = input;
  $scope.$watch('invoice.approved', function(newValue, oldValue) {
    console.log($scope.invoice.pk);
    $http({
      method: 'PATCH',
      url: '/api/finance/invoices/' + $scope.invoice.pk + '/',
      data: {
        approved: newValue
      }
    }).
    then(function(response) {})
  })
});

app.controller('home.expenses.claims.explore', function($scope, $http, $aside, Flash) {

  $scope.expense = $scope.data.tableData[$scope.tab.data.index]

  // $http({
  //   method: 'GET',
  //   url: '/api/finance/invoices/?sheet=' + $scope.expense.pk
  // }).
  // then(function(response) {
  //   console.log('sssssssssssssssss', response.data);
  //   $scope.invoices = response.data;
  // })

  $scope.viewInvoice = function(ind) {
    $aside.open({
      templateUrl: '/static/ngTemplates/app.home.aside.expenseClaims.invoiceView.html',
      position: 'right',
      size: 'xl',
      backdrop: true,
      resolve: {
        input: function() {
          return $scope.expense.invoices[ind];
        }
      },
      controller: 'home.expenseSheet.invoiceView',
    })
  }
  // $scope.form = {
  //   'approved': 'No'
  // }
  console.log("fbh", $scope.expense.pk);
  $scope.save = function(value) {
    var toSend = {
      approved: $scope.expense.approved,
    }
    console.log("fff", toSend);
    $http({
      method: 'PATCH',
      url: '/api/finance/expenseSheet/' + value + '/',
      data: toSend
    }).
    then(function(response) {
      Flash.create('success', 'Saved');
      $scope.expense = response.data
    })
  }


})


app.controller('home.expense.claims.form', function($scope, $http, Flash) {
  $scope.projectSearch = function(query) {
    return $http.get('/api/projects/project/?title__icontains=' + query).
    then(function(response) {
      return response.data;
    })
  };
  $scope.codeSearch = function(query) {
    return $http.get('/api/finance/expenseHeading/?limit=10&title__icontains=' + query).
    then(function(response) {
      return response.data.results;
    })
  };

  // $scope.expenseCodes = []
  //
  // $scope.$watch('invoiceForm.service', function(newValue, oldValue) {
  //   if (newValue.pk != undefined) {
  //     $http({
  //       method: 'GET',
  //       url: '/api/finance/vendorservice/?vendorProfile__service=' + newValue.pk
  //     }).
  //     then(function(response) {
  //       $scope.expenseCodes = response.data;
  //     })
  //   }
  // })

  $scope.resetForm = function() {
    $scope.mode = 'new';
    $scope.form = {
      'notes': '',
      'projects': ''
    }
  }
  if (typeof $scope.tab != 'undefined' && $scope.tab.data.pk != -1) {
    if ($scope.tab.data.index == undefined) {
      $scope.form = $scope.tab.data.expense;
    } else {
      $scope.form = $scope.data.tableData[$scope.tab.data.index];
    }
    $scope.mode = 'edit';
    $scope.form.projects = $scope.form.project[0]
    console.log($scope.form)
  } else {
    $scope.resetForm();
  }

  // $scope.invoiceForm = {
  //   'service': '',
  //   'code': '',
  //   'amount': '',
  //   'currency': '',
  //   'dated': '',
  //   'attachment': emptyFile,
  //   'description': '',
  // }
  // $scope.$watch('form.project', function(newValue, oldValue) {
  //   console.log('cecking', newValue.pk);
  //   if (typeof newValue == 'object') {
  //     $scope.projectData = true;
  //     $scope.projectData = newValue;
  //
  //   } else {
  //     $scope.projectData = false;
  //   }
  // })
  // $scope.$watch('invoiceForm.service', function(newValue, oldValue) {
  //   console.log('cecking', newValue.pk);
  //   if (typeof newValue == 'object') {
  //     $scope.serviceData = true;
  //     $scope.serviceData = newValue;
  //
  //   } else {
  //     $scope.serviceData = false;
  //   }
  // })


  $scope.saveExpenseSheet = function() {
    var f = $scope.form;
    if (f.notes.length==0) {
      Flash.create('danger', 'Title Is Required');
      return
    }
    if (f.projects.pk==undefined) {
      Flash.create('danger', 'Project Is Required');
      return
    }
    var toSend = {
      notes: f.notes,
      projects: f.projects.pk
    }
    console.log(toSend);
    var url = '/api/finance/expenseSheet/';
    if ($scope.form.pk == undefined) {
      var method = 'POST';
    } else {
      var method = 'PATCH';
      url += $scope.form.pk + '/';
    }
    $http({
      method: method,
      url: url,
      data: toSend
    }).
    then(function(response) {
      $scope.form = response.data;
      $scope.form.projects = $scope.form.project[0]
      $scope.mode = 'edit'
      Flash.create('success', 'Saved');
    })
  }
  // if ($scope.mode == 'edit') {
  //   $http({
  //     method: 'GET',
  //     url: '/api/finance/invoices/?sheet=' + $scope.form.pk
  //   }).
  //   then(function(response) {
  //     $scope.invoiceData = response.data;
  //   })
  // }

  $scope.deleteInvoice = function(pk, ind) {
    $http({
      method: 'DELETE',
      url: '/api/finance/invoices/' + pk + '/'
    }).
    then((function(ind) {
      return function(response) {
        $scope.form.invoices.splice(ind, 1);
      }
    })(ind))

  }
  $scope.refreshInvoice = function() {
    $scope.invoiceForm = {
      'code': '',
      'amount': 0,
      'currency': 'INR',
      'dated': new Date(),
      'attachment': emptyFile,
      'gstVal':0,
      'gstIN':'',
      'description': '',
    }
  }
  $scope.refreshInvoice();
  $scope.saveInvoice = function() {
    var f = $scope.invoiceForm;
    console.log(f);
    if (f.code.length==0) {
      Flash.create('danger', 'Expense Title Is Required');
      return
    }
    if (f.amount.length==0) {
      Flash.create('danger', 'Amount Is Required');
      return
    }
    if (f.gstVal.length==0) {
      Flash.create('danger', 'GST Amount Is Required');
      return
    }
    if (f.description.length==0) {
      Flash.create('danger', 'Description Is Required');
      return
    }
    var url = '/api/finance/invoices/';
    var method = 'POST';
    if ($scope.invoiceForm.pk) {
      method = 'PATCH';
      url += $scope.invoiceForm.pk + '/';
    }
    var fd = new FormData();
    if (f.attachment != emptyFile && typeof f.attachment != 'string') {
      fd.append('attachment', f.attachment)
    }
    if (f.gstIN!=null&&f.gstIN.length>0) {
      fd.append('gstIN', f.gstIN);
    }
    // fd.append('service', f.service.pk);
    if (f.code!=null&&f.code.pk!=undefined) {
      fd.append('code', f.code.title);
    }else {
      fd.append('code', f.code);
    }
    fd.append('amount', f.amount);
    fd.append('gstVal', f.gstVal);
    fd.append('currency', f.currency);
    fd.append('dated', f.dated.toJSON().split('T')[0]);
    fd.append('sheet', $scope.form.pk);
    fd.append('description', f.description);
    $http({
      method: method,
      url: url,
      data: fd,
      transformRequest: angular.identity,
      headers: {
        'Content-Type': undefined
      }
    }).
    then(function(response) {
      $scope.form.invoices.push(response.data);
      Flash.create('success', 'Saved');
      $scope.refreshInvoice();
    })
  }


});
