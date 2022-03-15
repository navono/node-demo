import 'reflect-metadata';
import { Container } from 'inversify';
import { Application } from './application';
import { appModule } from './application-module';

export const start = () => {
  const container = new Container();

  container.load(appModule)

  container.get(Application).start();
}
