(function(){

    angular.module("ones.detailView", [])
        .service("detailViewService", ["ComView", "$location", "$routeParams", function(ComView, $location, $routeParams){
            var self = this;

            this.init = function($scope, config){
                this.config = config;
                this.scope = $scope;
                this.parentScope = $scope.$parent;

                this.parentScope.config = {
                    editAble: false === this.config.model.editAble ? false : true,
                    isBill: this.config.model.isBill ? true : false
                };

                if(self.config.model.isBill) {
                    this.loadBillData();
                } else {
                    this.loadCommonData();
                }

                this.parentScope.doEditDetail = function(){
                    var url = $location.url().replace("/viewDetail/", self.parentScope.config.isBill ? "/editBill/" : "/edit/");
                    $location.url(url);
                };

            };

            this.loadCommonData = function(){

                var doDefine = function(structure){

                    /**
                     * 字段名称
                     * */
                    var fieldsDefine = [];
                    angular.forEach(structure, function(item, k){
                        if(item.hideInDetail) {
                            return;
                        }

                        if(!item.field) {
                            item.field = k;
                        }
                        if(!item.displayName) {
                            item.displayName = ComView.toLang(k);
                        }

                        fieldsDefine.push(item);
                    });

                    self.parentScope.detailViewStructure = fieldsDefine;

                    var promise = getDataApiPromise(self.config.resource, "get", {
                        id: $routeParams.id
                    })

                    promise.then(function(defaultData) {
                        self.parentScope.detailViewData = dataFormat(structure, defaultData);
                    });

                };

                var columns = self.config.model.columns || 1;
                columns = columns > 4 ? 4 : columns;
                self.parentScope.columnWidth = parseInt(12/columns);
                var field = self.config.model.getStructure();
                if(("then" in field && typeof(field.then) === "function")) { //需要获取异步数据
                    field.then(function(data){
                        doDefine(data);
                    }, function(msg){
                        ComView.alert(msg);
                    });
                } else {
                    doDefine(field);
                }

            };
        }])
        .directive("detailView", ["detailViewService", function(detailViewService){
            return {
                restrict: "AE",
                transclusion: true,
                scope: {
                    config: "="
                },
                compile: function(element, attrs, transclude){
                    return {
                        pre: function($scope, iElement, iAttrs, controller) {
                            detailViewService.init($scope, $scope.$parent.$eval(iAttrs.config));
                        }
                    };
                }
            };
        }])
    ;

})();