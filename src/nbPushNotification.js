/* global nbPushNotification, angular */

/**
 * nbnbPushNotification - service wrapper for nbPushNotification plugin
 */

'use strict';

/**
 * @param {string} message
 * @returns {nbPushNotificationInvalidArgumentException}
 */
var nbPushNotificationInvalidArgumentException = function(message) {
  this.message = message;
  this.name = 'nbPushNotificationInvalidArgumentException';
};

/**
 * @returns {nbPushNotificationPluginNotFoundException}
 */
var nbPushNotificationPluginNotFoundException = function() {
  this.message = 'Plugin nbPushNotification was not found!';
  this.name = 'nbPushNotificationPluginNotFoundException';
};

/**
 * @param {Object} initData
 * @returns {nbPushNotificationService}
 */
var nbPushNotificationService = function(initData) {
  
  var callbacks = {
    registration: null,
    notification: null,
    error: null
  },
  scope = this;
  
  /**
   * Returns true if plugin nbPushNotification exists.
   */
  scope.pluginExists = window['nbPushNotification'] != undefined;
  
  var push = scope.pluginExists ? PushNotification.init(initData) : null,
  reinit = function() {
    scope.pluginExists = window['nbPushNotification'] != undefined;
    push = scope.pluginExists && push === null ? PushNotification.init(initData) : null;
  };
  
  /**
   * Device registration ID
   */
  scope.registrationId = null;
  
  /**
   * Is this device already registered
   */
  scope.isRegistered = false;
  
  reinit();
  
  scope.init = function(data) {
    initData = data;
    reinit();
  };
  
  /**
   * Checks whether the push notification permission has been granted.
   * 
   * @param {Function} successHandler Receives data object.
   * @param {Function} errorHandler Receives data object.
   * @returns {nbPushNotificationService}
   */
  scope.hasPermission = function(successHandler, errorHandler) {
    if (scope.pluginExists) {
      nbPushNotification.hasPermission(function(data) {
        if (data.isEnabled) {
          data.reason = null;
          successHandler.call(scope, data);
        } else {
          data.reason = 'nopermission';
          errorHandler.call(scope, data);
        }
      });
    } else {
      if (typeof errorHandler == 'function') {
        errorHandler.call(scope, {isEnabled: false, reason: 'noplugin'});
      }
    }
    return this;
  };
  
  /**
   * The event registration will be triggered on each successful registration with the 3rd party push service.
   * 
   * @param {Function} callback Receives registration ID and data object.
   * @returns {nbPushNotificationService}
   */
  scope.registration = function(callback) {
    if (!scope.pluginExists) {
      throw new nbPushNotificationPluginNotFoundException();
    }
    if (typeof callback == 'function') {
      callbacks.registration = callback;
      push.on('registration', function(data) {
        scope.registrationId = data.registrationId;
        scope.isRegistered = true;
        callbacks.registration.call(scope, data.registrationId, data);
      });
    } else if (callback === null) {
      scope.off('registration');
    } else {
      throw new nbPushNotificationInvalidArgumentException('Invalid argument for event `registration`');
    }
    return this;
  };
  
  /**
   * The event notification will be triggered each time a push notification is received by a 3rd party push service on the device.
   * 
   * @param {Function} callback Receives data object.
   * @returns {nbPushNotificationService}
   */
  scope.notification = function(callback) {
    if (!scope.pluginExists) {
      throw new nbPushNotificationPluginNotFoundException();
    }
    if (typeof callback == 'function') {
      callbacks.notification = callback;
      push.on('notification', function(data) {
        callbacks.notification.call(scope, data);
      });
    } else if (callback === null) {
      scope.off('notification');
    } else {
      throw new nbPushNotificationInvalidArgumentException('Invalid argument for event `notification`');
    }
    return this;
  };
  
  /**
   * The event error will trigger when an internal error occurs and the cache is aborted.
   * 
   * @param {Function} callback Receives event object
   * @returns {nbPushNotificationService}
   */
  scope.error = function(callback) {
    if (!scope.pluginExists) {
      throw new nbPushNotificationPluginNotFoundException();
    }
    if (typeof callback == 'function') {
      callbacks.error = callback;
      push.on('error', function(e) {
        callbacks.error.call(scope, e);
      });
    } else if (callback === null) {
      scope.off('error');
    } else {
      throw new nbPushNotificationInvalidArgumentException('Invalid argument for event `error`');
    }
    return this;
  };
  
  /**
   * Removes a previously registered callback for an event.
   * 
   * @param {Function|string} callback
   * @returns {nbPushNotificationService}
   */
  scope.off = function(callback) {
    if (!scope.pluginExists) {
      throw new nbPushNotificationPluginNotFoundException();
    }
    if (callback === 'registration' || callback === scope.registration || callback === callbacks.registration) {
      push.off('registration', callbacks.registration);
      callbacks.registration = null;
      scope.registrationId = null;
      scope.isRegistered = false;
    } else if (callback === 'notification' || callback === scope.notification || callback === callbacks.notification) {
      push.off('notification', callbacks.notification);
      callbacks.notification = null;
    } else if (callback === 'error' || callback === scope.error || callback === callbacks.error) {
      push.off('error', callbacks.error);
      callbacks.error = null;
    } else {
      throw new nbPushNotificationInvalidArgumentException('Invalid event name, callback or handler to remove');
    }
    return this;
  };
  
  /**
   * The unregister method is used when the application no longer wants to receive push notifications. 
   * Beware that this cleans up all event handlers previously registered, so you will need to re-register 
   * them if you want them to function again without an application reload. 
   * 
   * If you provide a list of topics as an optional parameter then the application will unsubscribe 
   * from these topics but continue to receive other push messages.
   * 
   * @param {Function} successHandler
   * @param {Function} errorHandler
   * @param {Array} topics
   * @returns {nbPushNotificationService}
   */
  scope.unregister = function(successHandler, errorHandler, topics) {
    scope.off('registration');
    push.unregister(successHandler, errorHandler, topics);
    return this;
  };
  /**
   * Tells the OS that you are done processing a background push notification. - iOS only
   * 
   * @param {Function} successHandler
   * @param {Function} errorHandler
   * @param {String} id
   * @returns {nbPushNotificationService}
   */
  scope.finish = function(successHandler, errorHandler, id) {
    push.finish(successHandler, errorHandler, id);
    return this;
  };
};

(function(angular) {
  angular.module('nb.pushnotification', []).provider('$pushNotification', [function() {
    
    var initData = {};
    
    this.init = function(data) {
      initData = data;
    };
    
    this.$get = [function() {
      return new nbPushNotificationService(initData);
    }];
  }]);
})(angular);