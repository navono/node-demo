import { container } from '../config/ioc_config';

function bindDependencies(func, dependencies) {
  const injections = dependencies.map((dependency) => {
    return container.get(dependency);
  });
  return func.bind(func, ...injections);
}

export { bindDependencies };
