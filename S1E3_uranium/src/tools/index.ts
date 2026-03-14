import {
  handlers as checkPackageHandlers,
  tools as checkPackageTools,
} from './check-package-status.tool';
import {
  handlers as redirectPackageHandlers,
  tools as redirectPackageTools,
} from './redirect-package.tool';

type ToolHandler = (...args: unknown[]) => unknown | Promise<unknown>;

export const tools = [...checkPackageTools, ...redirectPackageTools];

export const handlers: Record<string, ToolHandler> = {
  ...checkPackageHandlers,
  ...redirectPackageHandlers,
};
