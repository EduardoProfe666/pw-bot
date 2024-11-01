import { Module } from '@nestjs/common';
import DataService from './services/data.service';

@Module({
  imports: [
  ],
  controllers: [],
  providers: [DataService],
  exports: [DataService]
})
export default class DataModule {}
