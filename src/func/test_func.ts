import { bindDependencies } from './utils/bindDependencies';
import { TYPES } from './constants/types';

const funcHandler = (something: string, somethingElse: string) => {
  console.log(`Injected! ${something}`);
  console.log(`Injected! ${somethingElse}`);
};

const injectedFunc = bindDependencies(funcHandler, [TYPES.something, TYPES.somethingElse]);

export { injectedFunc };
