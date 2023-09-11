'use strict';

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

        } catch (error) {
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

}));
