import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import Assessment from './assessment.entity';
import Student from './student.entity';

@Entity({ name: 'grades' })
export default class Grade{
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', nullable: true })
  grade: 2 | 3| 4 | 5 | null;

  @Column('character varying', { length: 255 })
  professorNote: string;

  @ManyToOne(() => Assessment, assessment => assessment.id, { onDelete: 'CASCADE' })
  assessment: Assessment;

  @ManyToOne(() => Student, student => student.grades, { onDelete: 'CASCADE' })
  student: Student;
}