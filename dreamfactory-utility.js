'use strict';



angular.module('dfUtility', [])
    .constant('DF_UTILITY_ASSET_PATH', 'admin_components/dreamfactory-utility/')
    .directive('dreamfactoryAutoHeight', ['$window', '$route', function ($window) {

        return {
            restrict: 'A',
            link: function (scope, elem, attrs) {

                // Return jQuery window ref
                scope._getWindow = function () {

                    return $(window);
                };

                // Return jQuery document ref
                scope._getDocument = function () {

                    return $(document);
                };


                // Return jQuery window or document.  If neither justreturn the
                // string value for the selector engine
                scope._getParent = function(parentStr) {

                    switch (parentStr) {
                        case 'window':
                            return scope._getWindow()
                            break;

                        case 'document':
                            return scope._getDocument();
                            break;

                        default:
                            return $(parentStr);
                    }
                };


                // TODO: Element position/offset out of whack on route change.  Set explicitly.  Not the best move.
                scope._setElementHeight = function () {
                    angular.element(elem).css({
                        height: scope._getParent(attrs.autoHeightParent).height() - 173 - attrs.autoHeightPadding
                    });


                    /*console.log(scope._getParent(attrs.autoHeightParent).height());
                    console.log($(elem).offset().top)
                    console.log(angular.element(elem).height())*/
                };


                scope._setElementHeight();

                // set height on resize
                angular.element($window).on('resize', function () {
                    scope._setElementHeight();
                });



            }
        }
    }])
    .directive('dfVerbPicker', ['DF_UTILITY_ASSET_PATH', function (DF_UTILITY_ASSET_PATH) {

        return {
            restrict: 'E',
            scope: {
                allowedVerbs: '=?',
                description: '=?'
            },
            templateUrl: DF_UTILITY_ASSET_PATH + 'views/verb-picker.html',
            link: function (scope, elem, attrs) {

                scope.verbs = {
                    GET: {name: 'GET', active: false, description: ' (read)'},
                    POST: {name: 'POST', active: false, description: ' (create)'},
                    PUT: {name: 'PUT', active: false, description: ' (replace)'},
                    PATCH: {name: 'PATCH', active: false, description: ' (update)'},
                    MERGE: {name: 'MERGE', active: false, description: ' (update)'},
                    DELETE: {name: 'DELETE', active: false, description: ' (remove)'}
                };

                scope. btnText = 'None Selected';
                scope.description = true;

                scope._setVerbState = function (nameStr, stateBool) {

                    var verb = scope.verbs[nameStr];
                    if (scope.verbs.hasOwnProperty(verb.name)) {
                        scope.verbs[verb.name].active = stateBool;
                    }
                };

                scope._toggleVerbState = function (nameStr, event) {

                    event.stopPropagation();

                    if (scope.verbs.hasOwnProperty(scope.verbs[nameStr].name)) {
                        scope.verbs[nameStr].active = !scope.verbs[nameStr].active;
                    }

                    scope.allowedVerbs = [];

                    angular.forEach(scope.verbs, function (_obj) {
                        if (_obj.active) {
                            scope.allowedVerbs.push(_obj.name);
                        }
                    });
                };

                scope._isVerbActive = function (verbStr) {

                    return scope.verbs[verbStr].active
                };

                scope._setButtonText = function () {

                    var verbs = scope.allowedVerbs;

                    scope.btnText = '';

                    if (verbs.length == 0) {
                        scope.btnText = 'None Selected';

                    }else if (verbs.length > 0 &&  verbs.length <= 3) {


                        angular.forEach(verbs, function (_value, _index) {
                            if (scope._isVerbActive(_value)) {
                                if (_index != verbs.length -1)
                                scope.btnText += (_value + ', ');
                                else {
                                    scope.btnText += _value
                                }
                            }
                        })

                    }else if (verbs.length > 3) {
                        scope.btnText = verbs.length + ' Selected';
                    }
                };

                scope.$watch('allowedVerbs', function (newValue, oldValue) {

                    if (!newValue) return false;

                    angular.forEach(scope.allowedVerbs, function (_value, _index) {

                        scope._setVerbState(_value, true);
                    });

                    scope._setButtonText();
                })

                elem.css({
                    'display': 'inline-block'
                })

            }
        }
    }])
    .service('dfObjectService', [function () {

        return {

            self: this,

            mergeObjects: function (obj1, obj2) {

                for (var key in obj1) {
                    obj2[key] = obj1[key]
                }

                return obj2;
            },

            deepMergeObjects: function (obj1, obj2) {

                var self = this;

                for (var _key in obj1) {
                    if (obj2.hasOwnProperty(_key)) {
                        if(typeof obj2[_key] === 'object') {

                            obj2[_key] = self.deepMergeObjects(obj1[_key], obj2[_key]);

                        }else {
                            obj2[_key] = obj1[_key];
                        }
                    }
                }

                return obj2;

            }
        }

    }])
    .filter('orderAndShowSchema', [ function () {

        return function (items, fields, reverse) {

            var filtered = [];

            angular.forEach(fields, function (field) {

                angular.forEach(items, function (item) {
                    if (item.name === field.name && field.active == true) {

                        filtered.push(item);
                    }
                });
            });

            if (reverse) filtered.reverse();
            return filtered;
        }
    }])
    .filter('orderAndShowValue', [ function () {

        return function (items, fields, reverse) {

            // Angular sometimes throws a duplicate key error.
            // I'm not sure why.  We were just pushing values onto
            // an array.  So I use a counter to increment the key
            // of our data object that we assign our filtered values
            // to.  Now they are extracted into the table in the correct
            // order.

            var filtered = [];

            // for each field
            angular.forEach(fields, function (field) {

                // search the items for that field
                for (var _key in items) {

                    // if we find it
                    if (_key === field.name && field.active == true) {

                        // push on to
                        filtered.push(items[_key]);
                    }
                }
            });

            if (reverse) filtered.reverse();
            return filtered;
        }
    }])
    .filter('orderObjectBy', [function () {
        return function (items, field, reverse) {
            var filtered = [];
            angular.forEach(items, function (item) {
                filtered.push(item);
            });
            filtered.sort(function (a, b) {
                return (a[field] > b[field]);
            });
            if (reverse) filtered.reverse();
            return filtered;
        };
    }])
    .filter('dfFilterBy', [function () {
        return function (items, options) {


            console.log(items);
            if (!options.on) return items;


            var filtered = [];

            // There is nothing to base a filter off of
            if (!options) {
                return items
            }
            ;

            if (!options.field) {
                return items
            }
            ;
            if (!options.value) {
                return items
            }
            ;
            if (!options.regex) {
                options.regex = new RegExp(options.value)
            }

            angular.forEach(items, function (item) {
                if (options.regex.test(item[options.field])) {

                    filtered.push(item)
                }
            });

            return filtered;
        }
    }])
    .filter('dfOrderExplicit', [function() {

        return function(items, order) {

            var filtered = [],
                i = 0;

            angular.forEach(items, function(value, index) {

                if (value.name === order[i]) {
                    filtered.push(value)

                }
                i++;
            })

            return filtered;

        }
    }]);