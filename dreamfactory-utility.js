'use strict';



angular.module('dfUtility', [])
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
    .service('dfObjectService', [function () {

        return {

            mergeObjects: function (obj1, obj2) {


                for (var key in obj1) {
                    obj2[key] = obj1[key]
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
    }]);