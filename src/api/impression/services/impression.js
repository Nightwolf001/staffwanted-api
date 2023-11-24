'use strict';

/**
 * impression service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::impression.impression');
