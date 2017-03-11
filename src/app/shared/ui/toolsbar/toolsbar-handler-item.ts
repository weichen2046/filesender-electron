import { ToolsBarCmdHandler } from './toolsbar-cmd-handler';

export interface ToolsBarHandlerItem {
  cmd: string;
  handler: ToolsBarCmdHandler;
}