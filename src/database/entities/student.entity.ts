import { Column, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import Grade from './grade.entity';
import User from './user.entity';

@Entity({ name: 'students' })
export default class Student{
  @PrimaryGeneratedColumn()
  id: number;

  @Column('character varying', { length: 255 })
  name: string;

  @Column('character varying', { length: 255 })
  fullName: string;

  @Column('boolean')
  isRecognized: boolean;

  @Column('boolean')
  isRepeater: boolean;

  @Column('boolean')
  isCarryForward: boolean;

  @Column('int')
  listNumber: number;

  @OneToMany(() => Grade, grade => grade.student)
  grades: Grade[];

  @OneToOne(() => User, user => user.student, { onDelete: 'CASCADE' })
  user: User;
}