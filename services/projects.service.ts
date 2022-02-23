import { Service, ServiceBroker, Errors } from 'moleculer';

import DbConnection from '../mixins/db.mixin';

export default class ProjectService extends Service {
  private dbMixin = new DbConnection('projects').start();

    /**
     * Constructor
     */
    public constructor(public broker: ServiceBroker) {
      super(broker);

      this.parseServiceSchema({
        name: 'projects',
        mixins: [this.dbMixin],

        settings: {
          // Available fields in the responses
          fields: [
            '_id',
            'name',
            'desc',
            'createdAt',
            'updatedAt',
          ],

          // Validator for the `create` & `insert` actions.
          entityValidator: {
            name: { type: 'string', min: 2, pattern: /^[a-zA-Z0-9]+$/ },
            desc: { type: 'string', optional: true },
          },
        },

        actions: {
          create: {
            params: {
              project: { type: 'object' },
            },
            handler(ctx) {
              const entity = ctx.params.project;
              return this.validateEntity(entity)
                .then(() => {
                  if (entity.name) {
                    return this.adapter.findOne({ name: entity.name })
                    .then(found => {
                      if (found) {
                        return Promise.reject(new Errors.MoleculerClientError('Project name is exist!', 422, '', [{ field: 'name', message: 'is exist'}]));
                      }
                      return true;
                    });
                  }
                })
                .then(() => {
                  entity.createdAt = new Date();
                  entity.updatedAt = new Date();
                  return this.adapter.insert(entity)
                  .then(doc => this.transformDocuments(ctx, { populate: ['author']}, doc))
                  // .then(project => this.transformResult(project))
                  .then(json => this.entityChanged('created', json, ctx).then(() => json));
                });
            },
          },
        },

        methods: {
          transformResult(project: any) {
            if (!project) {return this.Promise.resolve();}
          },
        },
      });
    }
}
