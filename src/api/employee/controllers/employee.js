'use strict';
var _ = require('lodash');
const axios = require('axios');
var moment = require('moment');

/**
 * employee controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::employee.employee', ({strapi}) =>({

    async createAccount(ctx) {

        const { body } = ctx.request
        console.log('body', body)
        const { email, password, coord } = body

        let find = await strapi.entityService.findMany('api::employee.employee', {
            filters: {
                email: email
            }
        });

        if (find.length === 0) { 
            console.log('user does not exist')
            const entry = await strapi.entityService.create('api::employee.employee', {
                data: {
                    email: email,
                    password: password,
                    account_complete: false,
                    coord :  coord,
                },
            });
    
        try {
            const user = await strapi.plugins['users-permissions'].services.user.add({
                username: email,
                email: email,
                provider: 'local',
                password: password,
                confirmed: true,
                blocked: false,
                role: 1,
                user_type: 'employee',
                profile_id: entry.id,
                password_set: true,
                created_by: 1,
                updated_by: 1
            })

        console.log('user', user)
        } catch (error) {
            console.log('error', error)
            if(error.message.includes("attribute must be unique")) {
            return false
            }
        }
            const sanitizedEntity = await this.sanitizeOutput(entry, ctx);
            console.log('sanitizedEntity', sanitizedEntity)
            return this.transformResponse(sanitizedEntity);

        } else {
            return 9001
        }
    },

    async findOne(ctx) {

        const { id } = ctx.params;
        let entry = await strapi.entityService.findOne('api::employee.employee', id, {
            fields: ['*'],
            populate: { 
                gender: true,
                preferred_hours: true,
                job_roles: true,
                experience: true,
             },
        });

        if(entry) {
            
            const video_ = await strapi.query("plugin::upload.file").findOne({
                where: { id: entry.video_id },
            });

            const avatar_ = await strapi.query("plugin::upload.file").findOne({
                where: { id: entry.avatar_id },
            });

            entry.video_id = video_
            entry.avatar_id = avatar_

        } 

        return this.transformResponse(entry);
    },

    async googlePlacesPredictions(ctx){

    const {query} = ctx;
    let {search} = query;

    let response = await axios.get(`https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${search}&key=${process.env.MAPS_API_KEY}&region=za`)

    console.log(response.data)

    const predictions = response.data.predictions;

    let places = [];

    for await(const prediction of predictions){
      places.push(prediction.description)
    }

    return places
  },

  async googlePlacesDetails(ctx){

    const {query} = ctx;
    let {place_id} = query;

    let response = await axios.get(`https://maps.googleapis.com/maps/api/place/details/json?place_id=${place_id}&key=${process.env.MAPS_API_KEY}`)
    return response.data
  }

}));

