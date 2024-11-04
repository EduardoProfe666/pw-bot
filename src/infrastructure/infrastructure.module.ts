import { Module } from '@nestjs/common';
import V1InfrastructureController from './controllers/v1-infrastructure.controller';

@Module({
  imports: [
  ],
  controllers: [V1InfrastructureController],
  providers: [],
  exports: [],
})
export default class InfrastructureModule {}