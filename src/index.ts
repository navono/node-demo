import 'reflect-metadata';
import { container } from 'tsyringe';
import Bar from './Bar';
import Client from './Client';
import TestService from './TestService';
import TestService2 from './TestService2';

const myBar = container.resolve(Bar);
console.log(myBar);

// container.register("SuperService", {
//   // useClass: TestService
//   useFactory: (dc: DependencyContainer) => {
//     console.log('dc', dc);
//     return new TestService();
//   }
// });

const t1Container = container.createChildContainer();
const t2Container = container.createChildContainer();

t1Container.register('SuperService', { useClass: TestService });
t2Container.register('SuperService', { useClass: TestService2 });

const client = t2Container.resolve(Client);
client.hello('John');
