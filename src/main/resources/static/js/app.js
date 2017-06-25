angular
		.module('inputBasicDemo', [ 'ngMaterial', 'ngMessages', 'ngResource' ])
		.controller(
				'DemoCtrl',
				function($scope, $resource, $q) {
					var mlsPromise = $q((resolve, reject) => {
						$resource("mock/mls.json").get(data =>{
							resolve(data);
						});
					});
					
					var memberPromise = $q((resolve, reject) => {
						$resource("mock/members.json").get(data =>{
							resolve(data);
						});						
					});
					
					$scope.mls = [];
					
					$q.all([mlsPromise, memberPromise]).then((values) => {
						const mls = values[0].mls;
						const members = values[1].mls
						$scope.mls = mls;
						mls.forEach(ml => {
							ml.members.forEach(address => {
								// TODO membersにどういう形でもたせたらいいかね…
							});
						});
					});

					$scope.members = [ {
						name : "一郎",
						address : "ichiro@example.com",
						status : [ {
							value : true,
							before: true,
							enabled : false
						}, {
							value : true,
							before: true,
							enabled : false
						}, {
							value : false,
							before: false,
							enabled : false
						}, {
							value : false,
							before: false,
							enabled : false
						} ]
					}, {
						name : "二郎",
						address : "jiro@example.com",
						status : [ {
							value : true,
							before: true,
							enabled : false
						}, {
							value : false,
							before: false,
							enabled : false
						}, {
							value : false,
							before: false,
							enabled : false
						}, {
							value : false,
							before: false,
							enabled : false
						} ]
					} ];
					
					$scope.onLockChange = function(index, locked){
						$scope.members.forEach((member) => {
							member.status[index].enabled = !locked;
						});
					}
					
				}).config(
				function($mdThemingProvider) {

					// Configure a dark theme with primary foreground yellow

					$mdThemingProvider.theme('docs-dark', 'default')
							.primaryPalette('yellow').dark();

				});
