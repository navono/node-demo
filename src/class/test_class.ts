import { Battle } from './interfaces';
import container from './config/ioc_config';
import SERVICE_IDENTIFIER from './constants/identifiers';

// Composition root
const epicBattle = container.get<Battle>(SERVICE_IDENTIFIER.BATTLE);

export { epicBattle };
