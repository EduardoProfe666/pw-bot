import { Injectable } from '@nestjs/common';
import { EntityManager, Repository } from 'typeorm';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import Assessment from '../entities/assessment.entity';
import Grade from '../entities/grade.entity';
import Student from '../entities/student.entity';

@Injectable()
export default class PgService {
  constructor(
    @InjectEntityManager() public readonly em: EntityManager,
    @InjectRepository(Assessment) public readonly assessments: Repository<Assessment>,
    @InjectRepository(Grade) public readonly grades: Repository<Grade>,
    @InjectRepository(Student) public readonly students: Repository<Student>,
  ) {
  }
}