import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import Grade from './grade.entity';

@Entity({ name: 'students' })
export default class Student{
  @PrimaryGeneratedColumn()
  id: number;

  @Column('character varying', { length: 255 })
  name: string;

  @Column('character varying', { length: 255 })
  username: string;

  @OneToMany(() => Grade, grade => grade.student)
  grades: Grade[];
}