import { Container, interfaces } from 'inversify';
// import { makeLoggerMiddleware } from 'inversify-logger-middleware';

import { TYPES } from '../constants/types';

// const logger = makeLoggerMiddleware();

function customLogger(planAndResolve: interfaces.Next): interfaces.Next {
  return (args: interfaces.NextArgs) => {
    const start = new Date().getTime();

    const nextContextInterceptor = args.contextInterceptor;
    args.contextInterceptor = (context: interfaces.Context) => {
      // console.log(context);
      return nextContextInterceptor(context);
    };

    const result = planAndResolve(args);
    const end = new Date().getTime();
    console.log(`wooooo  ${end - start}`);
    return result;
  };
}

// declare your container
const container = new Container();
container.applyMiddleware(customLogger);

// container.applyMiddleware(logger);
// console.log(logger);

container.bind(TYPES.something).toConstantValue('a');
container.bind(TYPES.somethingElse).toConstantValue('b');

export { container };
