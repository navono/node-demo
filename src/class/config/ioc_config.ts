import 'reflect-metadata';
import { Container } from 'inversify';
import { makeLoggerMiddleware } from 'inversify-logger-middleware';
import { Battle, Weapon, Warrior } from '../interfaces';
import { EpicBattle, Katana, Shuriken, Ninja, Samurai } from '../entities';
import SERVICE_IDENTIFIER from '../constants/identifiers';
import TAG from '../constants/tags';

const logger = makeLoggerMiddleware();
const container = new Container();
container.applyMiddleware(logger);

container.bind<Warrior>(SERVICE_IDENTIFIER.WARRIOR).to(Ninja).whenTargetNamed(TAG.CHINESE);
container.bind<Warrior>(SERVICE_IDENTIFIER.WARRIOR).to(Samurai).whenTargetNamed(TAG.JAPANESE);
container.bind<Weapon>(SERVICE_IDENTIFIER.WEAPON).to(Shuriken).whenParentNamed(TAG.CHINESE);
container.bind<Weapon>(SERVICE_IDENTIFIER.WEAPON).to(Katana).whenParentNamed(TAG.JAPANESE);
container.bind<Battle>(SERVICE_IDENTIFIER.BATTLE).to(EpicBattle);

export default container;
