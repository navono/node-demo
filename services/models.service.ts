import { Service, ServiceBroker } from 'moleculer';

import DbConnection from '../mixins/db.mixin';

export default class ProjectService extends Service {
  private dbMixin = new DbConnection('models').start();

  /**
   * Constructor
  */
  public constructor(public broker: ServiceBroker) {
    super(broker);

    this.parseServiceSchema({
      name: 'models',
      mixins: [this.dbMixin],

      settings: {
        // Available fields in the responses
        fields: [
          '_id',
          'name',
          'desc',
          'row',
          'createdAt',
          'updatedAt',
        ],

          // Validator for the `create` & `insert` actions.
          entityValidator: {
            name: { type: 'string'},
            row: { type: 'array' },
            desc: { type: 'string', optional: true },
        },
      },

      actions: {},

      methods: {},

      events: {},
    });
  }
}
