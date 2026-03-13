import { Injectable } from '@nestjs/common';

export type MessageType = 'agent' | 'tool' | 'user';

interface LogMessage {
  type: MessageType;
  message: string;
  details?: string;
}

const COLOR_BY_TYPE: Record<MessageType, string> = {
  user: '\u001b[34m',
  agent: '\u001b[35m',
  tool: '\u001b[38;5;208m',
};

const RESET_COLOR = '\u001b[0m';
const MAX_CONTENT_WIDTH = 80;

@Injectable()
export class ConsoleMessageFormatterService {
  format({ type, message, details }: LogMessage): string {
    const title = this.buildTitle(type, details);
    const normalizedLines = this.normalizeLines(message);
    const width = Math.max(
      title.length,
      ...normalizedLines.map((line) => line.length),
    );

    const border = `+${'-'.repeat(width + 2)}+`;
    const separator = `|${'-'.repeat(width + 2)}|`;
    const titleLine = `| ${title.padEnd(width)} |`;
    const messageLines = normalizedLines.map(
      (line) => `| ${line.padEnd(width)} |`,
    );

    const framedMessage = [
      border,
      titleLine,
      separator,
      ...messageLines,
      border,
    ].join('\n');

    const color = COLOR_BY_TYPE[type];
    return `${color}${framedMessage}${RESET_COLOR}`;
  }

  log(payload: LogMessage): void {
    process.stdout.write(`${this.format(payload)}\n\n`);
  }

  private buildTitle(type: MessageType, details?: string): string {
    const normalizedType = type.toUpperCase();
    if (!details?.trim()) {
      return normalizedType;
    }

    return `${normalizedType} [${details.trim()}]`;
  }

  private normalizeLines(message: string): string[] {
    const trimmed = message.trim();
    if (!trimmed) {
      return [''];
    }

    return trimmed
      .split(/\r?\n/)
      .flatMap((line) => this.wrapLine(line, MAX_CONTENT_WIDTH));
  }

  private wrapLine(line: string, width: number): string[] {
    if (line.length <= width) {
      return [line];
    }

    const chunks: string[] = [];
    let remaining = line;

    while (remaining.length > width) {
      const candidate = remaining.slice(0, width + 1);
      const splitAt = candidate.lastIndexOf(' ');

      if (splitAt > 0) {
        chunks.push(remaining.slice(0, splitAt));
        remaining = remaining.slice(splitAt + 1);
        continue;
      }

      chunks.push(remaining.slice(0, width));
      remaining = remaining.slice(width);
    }

    chunks.push(remaining);
    return chunks;
  }
}
