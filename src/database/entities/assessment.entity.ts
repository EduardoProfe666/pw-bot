import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import Grade from './grade.entity';

@Entity({ name: 'assessments' })
export default class Assessment{
  @PrimaryGeneratedColumn()
  id: number;

  @Column('character varying', { length: 255 })
  name: string;

  @OneToMany(() => Grade, grade => grade.assessment)
  grades: Grade[];
}