import { Body, BadRequestException, Controller, Post } from '@nestjs/common';
import { AgentService } from '../agent/agent.service.js';

interface DistributionContactRequest {
  sessionID: string;
  msg: string;
}

interface DistributionContactResponse {
  msg: string;
}

@Controller()
export class DistributionContactController {
  constructor(private readonly agentService: AgentService) {}

  @Post('distribution_contact')
  async distributionContact(
    @Body() body: DistributionContactRequest,
  ): Promise<DistributionContactResponse> {
    if (!body || typeof body !== 'object') {
      throw new BadRequestException('Request body is required');
    }

    if (!body.sessionID || typeof body.sessionID !== 'string') {
      throw new BadRequestException('sessionID must be a non-empty string');
    }

    if (!body.msg || typeof body.msg !== 'string') {
      throw new BadRequestException('msg must be a non-empty string');
    }

    const msg = await this.agentService.ask(body.sessionID, body.msg);
    return { msg };
  }
}
