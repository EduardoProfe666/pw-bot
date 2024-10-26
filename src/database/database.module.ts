import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import PgService from './services/pg.service';
import Assessment from './entities/assessment.entity';
import Grade from './entities/grade.entity';
import Student from './entities/student.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST'),
        port: config.get<number>('DB_PORT'),
        username: config.get<string>('DB_USERNAME'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_DATABASE'),
        synchronize: true,
        entities: [
          Assessment,
          Grade,
          Student,
        ]
      })
    }),
    TypeOrmModule.forFeature([
      Assessment,
      Grade,
      Student,
    ])
  ],
  exports: [PgService],
  providers: [PgService],
})
export default class DatabaseModule {}
