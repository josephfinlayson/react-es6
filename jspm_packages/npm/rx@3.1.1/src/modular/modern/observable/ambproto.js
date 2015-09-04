/* */ 
var AnonymousObservable = require("../internal/anonymousobservable");
var SingleAssignmentDisposable = require("../singleassignmentdisposable");
var CompositeDisposable = require("../compositedisposable");
var observableFromPromise = require("./frompromise");
var isPromise = require("../helpers/ispromise");
module.exports = function(leftSource, rightSource) {
  var leftSource = this;
  return new AnonymousObservable(function(observer) {
    var choice,
        leftChoice = 'L',
        rightChoice = 'R',
        leftSubscription = new SingleAssignmentDisposable(),
        rightSubscription = new SingleAssignmentDisposable();
    isPromise(rightSource) && (rightSource = observableFromPromise(rightSource));
    function choiceL() {
      if (!choice) {
        choice = leftChoice;
        rightSubscription.dispose();
      }
    }
    function choiceR() {
      if (!choice) {
        choice = rightChoice;
        leftSubscription.dispose();
      }
    }
    leftSubscription.setDisposable(leftSource.subscribe(function(left) {
      choiceL();
      choice === leftChoice && observer.onNext(left);
    }, function(err) {
      choiceL();
      choice === leftChoice && observer.onError(err);
    }, function() {
      choiceL();
      choice === leftChoice && observer.onCompleted();
    }));
    rightSubscription.setDisposable(rightSource.subscribe(function(right) {
      choiceR();
      choice === rightChoice && observer.onNext(right);
    }, function(err) {
      choiceR();
      choice === rightChoice && observer.onError(err);
    }, function() {
      choiceR();
      choice === rightChoice && observer.onCompleted();
    }));
    return new CompositeDisposable(leftSubscription, rightSubscription);
  });
};
