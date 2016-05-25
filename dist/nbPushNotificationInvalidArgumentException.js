'use strict';

/**
 * @param {string} message
 * @returns {nbPushNotificationInvalidArgumentException}
 */
var nbPushNotificationInvalidArgumentException = function(message) {
  this.message = message;
  this.name = 'nbPushNotificationInvalidArgumentException';
};