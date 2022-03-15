import { ContainerModule } from 'inversify';
import { Application } from './application';
import { CommandContribution, CommandService, CommandRegistry } from './common/command';
import { bindContributionProvider } from './common/contribution-provider';

export const appModule = new ContainerModule((bind, _unbind, _isBound, _rebind) => {
  bind(Application).toSelf().inSingletonScope();

  bind(CommandService).toService(CommandRegistry);
  bindContributionProvider(bind, CommandContribution);
})
