import { Service, ServiceBroker, Errors } from 'moleculer';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

import DbConnection from '../mixins/db.mixin';

export default class UserService extends Service {
  private dbMixin = new DbConnection('users').start();

  /**
   * Constructor
   */
  public constructor(public broker: ServiceBroker) {
    super(broker);

    this.parseServiceSchema({
      name: 'users',
      mixins: [this.dbMixin],

      settings: {
        /** Secret for JWT */
        JWT_SECRET: process.env.JWT_SECRET || 'jwt-conduit-secret',

				// Available fields in the responses
				fields: [
					'_id',
          'projectId',
          'username',
					'email',
					'bio',
          'createdAt',
          'updatedAt',
				],

				// Validator for the `create` & `insert` actions.
				entityValidator: {
          username: { type: 'string', min: 2, pattern: /^[a-zA-Z0-9]+$/ },
          password: { type: 'string', min: 6 },
          email: { type: 'email' },
          bio: { type: 'string', optional: true },
				},
			},

      actions: {
        /**
         * The "moleculer-db" mixin registers the following actions:
         *  - list
         *  - find
         *  - count
         *  - create
         *  - insert
         *  - update
         *  - remove
         */

        /**
         * Register a new user
         *
         * @actions
         * @param {Object} user - User entity
         *
         * @returns {Object} Created entity & token
         */
        create: {
          auth: 'required',
          params: {
            projectId: { type: 'string' },
            user: { type: 'object' },
          },
          handler: async ctx => {
            const entity = ctx.params.user;
            const projectId = ctx.params.projectId;

            return this.validateEntity(entity)
              .then(async () => {
                if (projectId) {
                  const result = await ctx.call('projects.has', { projectId });
                  if (!result) {
                    return Promise.reject(new Errors.MoleculerClientError('Project not exist!', 422, '', [{ field: 'projectId', message: 'is not exist'}]));
                  }

                  return true;
                }

                if (entity.username) {
                  return this.adapter.findOne({ username: entity.username })
                    .then(found => {
                      if (found) {
                        return Promise.reject(new Errors.MoleculerClientError('Username is exist!', 422, '', [{ field: 'username', message: 'is exist'}]));
                      }
                      return true;
                  });
                }
              })
              .then(() => {
                if (entity.email) {
                  return this.adapter.findOne({ email: entity.email })
                    .then(found => {
                      if (found) {
                          return Promise.reject(new  Errors.MoleculerClientError('Email is exist!', 422, '', [{ field: 'email', message: 'is exist'}]));
                      }
                      return true;
                  });
                }
              })
              .then(() => {
                entity.password = bcrypt.hashSync(entity.password, 10);
                entity.bio = entity.bio || '';
                entity.projectId = projectId;
                entity.image = entity.image || null;
                entity.createdAt = new Date();
                entity.updatedAt = new Date();

                return this.adapter.insert(entity)
                  .then(doc => this.transformDocuments(ctx, {}, doc))
                  .then(user => this.transformEntity(user, true, ctx.meta.token))
                  .then(json => this.entityChanged('created', json, ctx).then(() => json));
              });
          },
        },

        get: {
          auth: 'required',
          cache: {
            //  Generate cache key from "limit", "offset" params and "user.id" meta
            keys: ['projectId','id'],
          },
          params: {
            projectId: { type: 'string' },
            id: { type: 'string' },
          },
          handler: ctx => {
            const projectId = ctx.params.projectId;
            const userId = ctx.params.id;

            return Promise.resolve(projectId)
              .then(async () => {
                if (projectId) {
                  const result = await ctx.call('projects.has', { projectId });
                  if (!result) {
                    return Promise.reject(new Errors.MoleculerClientError('Project not exist!', 422, '', [{ field: 'projectId', message: 'is not exist'}]));
                  }

                  return true;
                }

                return  Promise.reject(
                  new Errors.MoleculerClientError('Project id not specified!', 422, '', [{ field: 'projectId', message: 'is not specified'}]),
                );
              })
              .then(() => this.adapter.findOne({ _id: userId }))
              .then(user => {
                if (!this.transformEntity(user, true, ctx.meta.token)) {
                  return Promise.reject(new Errors.MoleculerClientError('User is not exist!', 422, '', [{ field: 'id', message: 'is not exist'}]));
                }

                return user;
              });
          },
        },

        list: {
          auth: 'required',
          cache: {
            //  Generate cache key from "limit", "offset" params and "user.id" meta
            keys: ['projectId'],
          },
          params: {
            projectId: { type: 'string' },
          },
          handler: ctx => {
            const projectId = ctx.params.projectId;
            return Promise.resolve(projectId)
            .then(async () => {
              if (projectId) {
                const result = await ctx.call('projects.has', { projectId });
                if (!result) {
                  return Promise.reject(new Errors.MoleculerClientError('Project not exist!', 422, '', [{ field: 'projectId', message: 'is not exist'}]));
                }

                return true;
              }

              return  Promise.reject(
                new Errors.MoleculerClientError('Project id not specified!', 422, '', [{ field: 'projectId', message: 'is not specified'}]),
              );
            })
            .then(async () => {
              const params = {
                limit: 10,
                offset: 0,
                sort: ['-createdAt'],
                populate: ['user'],
                query: {
                  projectId,
                },
              };
              // Let countParams;
              // This.Promise.call([]) ;
              return await this.adapter.find(params);
            })
            .then((users: any) => {
              if (!users || users?.length === 0) {
                return [];
              }

              // If (!this.transformEntity(user, true, ctx.meta.token)) {
              //   Return Promise.reject(new Errors.MoleculerClientError('User is not exist!', 422, '', [{ field: 'id', message: 'is not exist'}]));
              // }

              return users;
            });
          },
        },

        /**
         * Login with username & password
         *
         * @actions
         * @param {Object} user - User credentials
         *
         * @returns {Object} Logged in user with token
         */
        login: {
          params: {
            user: { type: 'object', props: {
              username: { type: 'string' },
              password: { type: 'string', min: 1 },
            }},
            projectId: { type: 'string' },
          },
          handler(ctx) {
            const entity = ctx.params.user;
            const projectId = ctx.params.projectId;

            return Promise.resolve()
              .then(async () => {
                if (projectId) {
                  const result = await ctx.call('projects.has', { projectId });
                  if (!result) {
                    return Promise.reject(new Errors.MoleculerClientError('Project not exist!', 422, '', [{ field: 'projectId', message: 'is not exist'}]));
                  }
                }

                return this.adapter.findOne({ username: entity.username });
              })
              .then(user => {
                if (!user) {
                    return this.Promise.
                      reject(new Errors.MoleculerClientError('Email or password is invalid!', 422, '', [{ field: 'username', message: 'is not found'}]));
                }

                return bcrypt.compare(entity.password, user.password).then(res => {
                  if (!res) {
                    return Promise.reject(new Errors.MoleculerClientError('Wrong password!', 422, '', [{ field: 'password', message: 'not matched'}]));
                  }

                  // Transform user entity (remove password and all protected fields)
                  return this.transformDocuments(ctx, {}, user);
                });
              })
              .then(user => this.transformEntity(user, true, ctx.meta.token));
          },
        },

        /**
         * Get user by JWT token (for API GW authentication)
         *
         * @actions
         * @param {String} token - JWT token
         *
         * @returns {Object} Resolved user
         */
        resolveToken: {
          cache: {
            keys: ['token'],
            ttl: 60 * 60, // 1 hour
          },
          params: {
            token: 'string',
          },
          handler(ctx) {
            return new this.Promise((resolve, reject) => {
              jwt.verify(ctx.params.token, this.settings.JWT_SECRET, (err, decoded) => {
                if (err) {
                  return reject(err);
                }
                resolve(decoded);
              });

            })
              .then(decoded => {
                if (decoded.id) {
                  return this.getById(decoded.id);
                }
              });
          },
        },

        /**
         * Get a user profile.
         *
         * @actions
         *
         * @param {String} username - Username
         * @returns {Object} User entity
         */
        profile: {
          cache: {
            keys: ['#token', 'username'],
          },
          params: {
            username: { type: 'string' },
          },
          handler(ctx) {
            return this.adapter.findOne({ username: ctx.params.username })
            .then(user => {
              if (!user) {
                return this.Promise.reject(new Errors.MoleculerClientError('User not found!', 404));
              }

              return this.transformDocuments(ctx, {}, user);
            })
            .then(user => this.transformProfile(ctx, user, ctx.meta.user));
          },
        },
      },

      methods: {
        /**
         * Generate a JWT token from user entity
         *
         * @param {Object} user
         */
        generateJWT(user: any) {
          const today = new Date();
          const exp = new Date(today);
          exp.setDate(today.getDate() + 60);

          return jwt.sign({
            // eslint-disable-next-line no-underscore-dangle
            id: user._id,
            username: user.username,
            exp: Math.floor(exp.getTime() / 1000),
          }, this.settings.JWT_SECRET);
        },

        /**
         * Transform returned user entity. Generate JWT token if neccessary.
         *
         * @param {Object} user
         * @param {Boolean} withToken
         */
        transformEntity(user, withToken, token) {
          if (user) {
            // User.image = user.image || "https://www.gravatar.com/avatar/" + crypto.createHash("md5").update(user.email).digest("hex") + "?d=robohash";
            user.image = user.image || '';
            if (withToken)
              {user.token = token || this.generateJWT(user);}

              return { user };
          }

          return null;
        },

        /**
         * Transform returned user entity as profile.
         *
         * @param {Context} ctx
         * @param {Object} user
         * @param {Object?} loggedInUser
         */
        transformProfile(ctx, user, loggedInUser: any) {
          // User.image = user.image || "https://www.gravatar.com/avatar/" + crypto.createHash("md5").update(user.email).digest("hex") + "?d=robohash";
          user.image = user.image || 'https://static.productionready.io/images/smiley-cyrus.jpg';

          if (loggedInUser) {
            // eslint-disable-next-line no-underscore-dangle
            return ctx.call('follows.has', { user: loggedInUser._id.toString(), follow: user._id.toString() })
              .then(res => {
                user.following = res;
                return { profile: user };
              });
          }

          user.following = false;

          return { profile: user };
        },
      },

      events: {
        'cache.clean.users'() {
          if (this.broker.cacher)
            {this.broker.cacher.clean(`${this.name}.*`);}
        },
      },
    });
  }
}
