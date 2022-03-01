import * as R from 'ramda';
import {Service, ServiceBroker, Context} from 'moleculer';
import * as ApiGateway from 'moleculer-web';
import * as jwt from 'jsonwebtoken';

export default class ApiService extends Service {
  public constructor(broker: ServiceBroker) {
    super(broker);
    this.parseServiceSchema({
      name: 'api',
      mixins: [ApiGateway],
      // More info about settings: https://moleculer.services/docs/0.14/moleculer-web.html
      settings: {
        port: process.env.PORT || 4000,

        routes: [
          {
            path: '/api',
            whitelist: [
              // Access to any actions in all services under "/api" URL
              '**',
            ],
            // Route-level Express middlewares. More info: https://moleculer.services/docs/0.14/moleculer-web.html#Middlewares
            use: [],
            // Enable/disable parameter merging method. More info: https://moleculer.services/docs/0.14/moleculer-web.html#Disable-merging
            mergeParams: true,

            // Enable authentication. Implement the logic into `authenticate` method. More info: https://moleculer.services/docs/0.14/moleculer-web.html#Authentication
            // Authentication: true,

            authorization: true,

            // The auto-alias feature allows you to declare your route alias directly in your services.
            // The gateway will dynamically build the full routes from service schema.
            autoAliases: true,

            aliases: {
              // Projects
              'REST /projects': 'projects',

              // Project users
              'REST /projects/:projectId/users': 'users',
              // 'GET /projects/:projectId/users': 'users.list',
              // 'GET /projects/:projectId/users/:userId': 'users.get',
              // 'POST /projects/:projectId/users': 'users.create',
              // 'PUT /projects/:projectId/users/:userId': 'users.update',
              // 'DELETE /projects/:projectId/users/:userId': 'users.remote',

              // Project login
              'POST /projects/:projectId/login': 'users.login',

              // Project models
              'REST /projects/:projectId/models': 'models',

              // 'GET /projects/:projectId/models': 'models.list',
              // 'POST /projects/:projectId/models': 'models.create',
              // 'PUT /projects/:projectId/models/:modelId': 'models.update',
              // 'DELETE /projects/:projectId/models/:modelId': 'models.remote',

              // Current user
              // 'GET /user': 'users.me',
              // 'PUT /user': 'users.updateMyself',

              // Profile
              // 'GET /profiles/:username': 'users.profile',
            },
            /**
					 * Before call hook. You can check the request.
					 * @param {Context} ctx
					 * @param {Object} route
					 * @param {IncomingMessage} req
					 * @param {ServerResponse} res
					 * @param {Object} data
					onBeforeCall(ctx: Context<any,{userAgent: string}>,
            route: object, req: IncomingMessage, res: ServerResponse) {
            Set request headers to context meta
            ctx.meta.userAgent = req.headers["user-agent"];
					},
					 */

          /**
					 * After call hook. You can modify the data.
					 * @param {Context} ctx
					 * @param {Object} route
					 * @param {IncomingMessage} req
					 * @param {ServerResponse} res
					 * @param {Object} data
					 *
            onAfterCall(ctx: Context, route: object, req: IncomingMessage, res: ServerResponse, data: object) {
              // Async function which return with Promise
              return doSomething(ctx, res, data);
            },
					 */

            // Calling options. More info: https://moleculer.services/docs/0.14/moleculer-web.html#Calling-options
            callingOptions: {},

            bodyParsers: {
              json: {
                strict: false,
                limit: '1MB',
              },
              urlencoded: {
                extended: true,
                limit: '1MB',
              },
            },

            // Mapping policy setting. More info: https://moleculer.services/docs/0.14/moleculer-web.html#Mapping-policy
            mappingPolicy: 'all', // Available values: "all", "restrict"

            // Enable/disable logging
            logging: true,
          },
        ],
        // Do not log client side errors (does not log an error response when the error.code is 400<=X<500)
        log4XXResponses: false,
        // Logging the request parameters. Set to any log level to enable it. E.g. "info"
        logRequestParams: null,
        // Logging the response data. Set to any log level to enable it. E.g. "info"
        logResponseData: null,
        // Serve assets from "public" folder
        assets: {
          folder: 'public',
          // Options to `server-static` module
          options: {},
        },
      },

      methods: {
        /**
				 * Authenticate the request. It checks the `Authorization` token value in the request header.
				 * Check the token value & resolve the user by the token.
				 * The resolved user will be available in `ctx.meta.user`
				 *
				 * @param {Context} ctx
				 * @param {any} route
				 * @param {IncomingMessage} req
				 * @returns {Promise}
				 */
				async authenticate(_ctx: Context, _route: any, req: any): Promise < any > {
					// Read the token from header
					const auth = req.headers.authorization;

          try {
            const decoded = jwt.verify(auth, 'jwt-conduit-secret');
            if (!decoded) {
              throw new (ApiGateway as any).Errors.UnAuthorizedError((ApiGateway as any).Errors.ERR_INVALID_TOKEN, {
                error: 'Invalid Token',
              });
            }


            const now = Math.floor(Date.now() / 1000);
            if (decoded.exp <= now) {
              throw new (ApiGateway as any).Errors.UnAuthorizedError((ApiGateway as any).Errors.ERR_INVALID_TOKEN, {
                error: 'Token Expired',
              });
            }

            return decoded;
          } catch(err) {
            // Err
            throw new (ApiGateway as any).Errors.UnAuthorizedError((ApiGateway as any).Errors.ERR_INVALID_TOKEN, {
              error: err,
            });
          }
				},
        /**
				 * Authorize the request. Check that the authenticated user has right to access the resource.
				 *
				 * @param {Context} ctx
				 * @param {Object} route
				 * @param {IncomingMessage} req
				 * @returns {Promise}
        */
        async authorize(ctx: Context<any, {user: string; token: string}>, _route: Record<string, undefined>, req: any): Promise<any> {
          let token;
          if (req.headers.authorization) {
            const type = req.headers.authorization.split(' ')[0];
            if (type === 'Token' || type === 'Bearer')
              {token = req.headers.authorization.split(' ')[1];}
          }

          return this.Promise.resolve(token)
            .then(tokenValue => {
              if (tokenValue) {
                // Verify JWT token
                return ctx.call('users.resolveToken', { token })
                  .then((user: any) => {
                    if (user) {
                      this.logger.info('Authenticated via JWT: ', user.username);
                      // Reduce user fields (it will be transferred to other nodes)
                      ctx.meta.user = R.pick(['_id', 'username', 'email', 'image'], user);
                      ctx.meta.token = tokenValue;
                    }
                    return user;
                  })
                  .catch(err =>
                    // Ignored because we continue processing if user is not exist
                    console.error(err),
                  );
              }

              return null;
            })
            .then(user => {
              // 用来控制 Service 单个 action 是否需要认证
              if (req.$endpoint.action.auth === 'required' && !user) {
                return this.Promise.reject(new (ApiGateway as any).Errors.UnAuthorizedError('用户未登录', ''));
              }
            });
        },
      },
    });
  }
}
