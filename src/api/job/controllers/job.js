'use strict';
var _ = require('lodash');
const axios = require('axios');
var moment = require('moment');
const geolib = require('geolib');


/**
 * job controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::job.job', ({strapi}) =>({
    // async find(ctx) {
    //     console.log('find', ctx)
    //     try {
      
    //         const entries = await strapi.entityService.findMany('api::job.job', {
    //             fields: ['title', 'description', 'location', 'place_id', 'coord', 'job_avatar_uri', 'job_avatar_id', 'salary'],
    //             sort: { createdAt: 'DESC' },
    //             populate: { 
    //                 employer: true,
    //                 job_roles: true,
    //                 preferred_hours: true,
    //                 experience: true,
    //             },
    //         });

    //         return this.transformResponse(entries);
            

            
    //     } catch (ex) {
    //         console.log('ex', ex)
    //     }
    // },

    async findFilterdJobs(ctx) {
        try {
    
            const { id } = ctx.params;
            const {query} = ctx;
            let {search, job_roles, experience, preferred_hours, distance, lat, lng, metric} = query;

            let employee = await strapi.entityService.findOne('api::employee.employee', id, {
                fields: ['coord', 'location', 'place_id'],
                populate: { 
                    preferred_hours: true,
                    job_roles: true,
                    experience: true,
                    employee_job_matches: {
                        populate: ['job']
                    },
                },
            });

           
        
            if(employee) {
                let entries
                if(search && search.length !== 0) {

                    entries = await strapi.entityService.findMany('api::job.job', {
                        fields: ['title', 'description', 'location', 'place_id', 'coord', 'job_avatar_uri', 'job_avatar_id', 'salary_type', 'salary_value', 'salary_currency'],
                        filters: {
                            title: search.length !== 0 ? { $contains: search } : { $notNull: true},
                            experience: experience,
                        },
                        sort: { createdAt: 'DESC' },
                        populate: { 
                            employer: true,
                            job_roles: true,
                            preferred_hours: true,
                            experience: true,
                        },
                    });

                } else {

                    entries = await strapi.entityService.findMany('api::job.job', {
                        fields: ['title', 'description', 'location', 'place_id', 'coord', 'job_avatar_uri', 'job_avatar_id', 'salary_type', 'salary_value', 'salary_currency'],
                        filters: {
                            experience: experience,
                            job_roles: job_roles.split(',') ,
                            preferred_hours: preferred_hours.split(','),
                        },
                        sort: { createdAt: 'DESC' },
                        populate: { 
                            employer: true,
                            job_roles: true,
                            preferred_hours: true,
                            experience: true,
                        },
                    });
                }

                // filter through the entries and add the bookmarked property
                // referencing the employee_job_match table
                for (let j = 0; j < entries.length; j++) {
                    const entry = entries[j];
                    if(employee.employee_job_matches.length !== 0) {
                        for (let e = 0; e < employee.employee_job_matches.length; e++) {
                            const job_map = employee.employee_job_matches[e];
                            if (entry.id === job_map.job.id) {
                                entry.bookmarked = job_map.bookmarked;
                            } 
                        }
                    } else {
                        entry.bookmarked = false;
                    }
                }

                const filteredEntries = [];
                for (let i = 0; i < entries.length; i++) {
                    const entry = entries[i];
                    const jobCoord = entry.coord;
                    const distance_from_location = await this.calculatePreciseDistance(jobCoord.lat, jobCoord.lng, lat, lng, metric);
                    if(distance_from_location < distance) { filteredEntries.push(entry)}
                }
                
                return this.transformResponse(filteredEntries);
            }

        } catch (ex) {
            console.log('ex', ex)
        }
    },

    async findEmployerJobs(ctx) {
        try {

            const { id } = ctx.params;
            const entries = await strapi.entityService.findMany('api::job.job', {
                fields: ['*'],
                filters: {
                    employer: [id],
                },
                sort: { createdAt: 'DESC' },
                populate: {
                    job_roles: true,
                    preferred_hours: true,
                    experience: true,
                    employer: true,
                    employee_job_matches: true,
                },
            });

            return this.transformResponse(entries);
            
        } catch (ex) {
            console.error('ex', ex);
        }
    },

    async findOne(ctx) {
        try {

            const { id } = ctx.params;
            const entry = await strapi.entityService.findOne('api::job.job', id, {
                fields: ['*'],
                populate: { 
                    employer: true,
                    job_roles: true,
                    preferred_hours: true,
                    experience: true,
                    employee_job_matches: {
                        populate: {
                            employee: {
                                populate: {
                                    experience: true,
                                    preferred_hours: true,
                                    job_roles: true,
                                }
                            }
                        }
                    },
                },
            });

            return this.transformResponse(entry);
            
        } catch (ex) {
            console.log('ex', ex)
        }
    },

    async calculatePreciseDistance (lat1, lon1, lat2, lon2, metric) {

        var pdis = geolib.getPreciseDistance(
            { latitude: lat1, longitude: lon1 },
            { latitude: lat2, longitude: lon2 },
        );

        let distance = geolib.convertDistance(pdis, metric);
        return distance;
    },

    async googlePlacesPredictions(ctx){

        const {query} = ctx;
        let {search} = query;

        let response = await axios.get(`https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${search}&key=${process.env.MAPS_API_KEY}&region=za`)

        console.log(response.data)

        const predictions = response.data.predictions;

        // let places = [];

        // for await(const prediction of predictions){
        //   places.push(prediction.description)
        // }

        return predictions
    },

    async googlePlacesDetails(ctx){

        const {query} = ctx;
        let {place_id} = query;

        let response = await axios.get(`https://maps.googleapis.com/maps/api/place/details/json?place_id=${place_id}&key=${process.env.MAPS_API_KEY}`)
        return response.data
    }

}));
