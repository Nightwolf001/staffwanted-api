'use strict';

/**
 * preferred-hour service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::preferred-hour.preferred-hour');
