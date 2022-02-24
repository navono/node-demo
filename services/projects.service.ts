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

          list: {
            cache: {
              keys: [ 'projects', 'limit', 'offset'],
            },
            params: {
              limit: { type: 'number', optional: true, convert: true },
              offset: { type: 'number', optional: true, convert: true },
            },
            handler: ctx => {
              const limit = ctx.params.limit ? Number(ctx.params.limit) : 20;
              const offset = ctx.params.offset ? Number(ctx.params.offset) : 0;

              const params = {
                limit,
                offset,
                sort: ['-createdAt'],
                populate: ['projects'],
                query: {},
              };
              let countParams;

              return Promise.resolve()
                .then(() => {
                  countParams = Object.assign({}, params);
                  // Remove pagination params
                  if (countParams && countParams.limit) {
                    countParams.limit = null;
                  }
                  if (countParams && countParams.offset) {
                    countParams.offset = null;
                  }
                })
                .then(() => Promise.all([
                  // Get rows
                  this.adapter.find(params),

                  // Get count of all rows
                  this.adapter.count(countParams),

                ])).then(res => res[0],
              );
            },
          },

          has: {
            cache: {
              keys: ['projectId'],
            },
            params: {
              projectId: { type: 'string' },
            },
            handler: ctx => this.adapter.findOne({ _id: ctx.params.projectId}),
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
