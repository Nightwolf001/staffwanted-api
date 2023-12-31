'use strict';
var _ = require('lodash');
const axios = require('axios');

/**
 * employee controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::employee.employee', ({strapi}) =>({

    async createAccount(ctx) {

        const { body } = ctx.request
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
                jobs: true,
                employee_job_matches: {
                    populate: {
                        job: true
                    }
                },
             },
        });

        return this.transformResponse(entry);
    },

    async getEmplyeesByEmployer(ctx) {

        const { id } = ctx.params;
        let entry = await strapi.entityService.findMany('api::employee.employee',{
            fields: ['*'],
            filters: {
                 employee_job_matches: { 
                    job: { 
                        employer: id
                    }
                },
            },
            populate: { 
                gender: true,
                preferred_hours: true,
                job_roles: true,
                experience: true,
                jobs: true,
                employee_job_matches: {
                    populate: {
                        job: {
                            populate: {
                                employer: true,
                            }
                        },
                        employer: true,
                    }
                },
             },
        });

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

