/**
 * Created by tianhuyang on 11/3/15.
 */

function printPDF(url){
    var popup = window.open(url)
    popup.onload = function(evt){
        this.print()
    }
}

app.directive('initComment', function ($compile) {
    return function (scope, element, attrs) {
        scope.comment._form = element;
    };
});

app.controller('MainController', function(){

});

app.controller('commentsController', ['$scope', '$http', function ($scope, $http) {
    var next = null
    var baseURL = null
    $scope.comments = []
    $scope.comment = {_creating: false}

    $scope.init = function(url){
        baseURL = next = url
        $scope.loadMore()
    }

    $scope.initComment = function(comment){
        if(comment.creator.id == auth_user_id) {
            comment._edit = 'editable'
        }
        else{
            comment._edit = 'none'
        }
    }

    $scope.loadMore = function () {
        if (!next) return
        $http.get(next).then(function (response) {
            next = response.data.next
            $.each(response.data.results, function(i, comment) {
                $scope.initComment(comment)
            })
            $.merge($scope.comments, response.data.results)
        }, function (response) {
            if (response.status === 404) {
                next = null
            }
        });
    }

    $scope.create = function(form){
        if(form.$invalid){
            return
        }
        comment = $scope.comment
        form._creating = true
        $http.post(baseURL, data=comment)
            .then(function(response){
                $scope.initComment(response.data)
                $scope.comments.splice(0, 0, response.data)
                comment.title = comment.content = ''
                form._creating = false
            }, function(response){
                needLogin(response)
                form._creating = false
            });
    }

    $scope.startEdit = function(comment){
        comment._edit = 'editing'
        comment._title = comment.title
        comment._content = comment.content
    }

    $scope.cancelEdit = function(comment){
        comment.title = comment._title
        comment.content = comment._content
        comment._edit = 'editable'
    }

    $scope.update = function($scope){
        if($scope.form.$invalid){
            return
        }
        var comment = $scope.comment
        comment._updating = true
        $http.put(comment.url, data={title: comment.title, content: comment.content})
            .then(function(response){
                var updated_comment = response.data
                angular.extend(comment, updated_comment)
                comment._updating = false
                comment._edit = 'editable'
            }, function(response){
                needLogin(response)
                comment._updating = false
            });
    }

    $scope.delete = function(comment){
        var r = confirm("Are you sure to delete?")
        if(!r) return
        comment._deleting = true
        $http.delete(comment.url)
            .then(function(response){
                ArrayUtils.remove($scope.comments, comment)
            }, function(response){
                needLogin(response)
                comment._deleting = false
            });
    }

}]);

app.controller('ratingsController', ['$scope', '$http', function ($scope, $http) {
    $scope.ratingRate = function () {
        if (!next) return
        $http.get(next).then(function (response) {
            next = response.data.next
            $.merge($scope.comments, response.data.results)
        }, function (response) {
            if (response.status === 404) {
                next = null
            }
        });
    }
}]);
