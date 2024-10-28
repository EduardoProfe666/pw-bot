import { BeforeInsert, Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import Student from './student.entity';
import * as bcrypt from 'bcrypt';


@Entity({ name: 'users' })
export default class User{
  @PrimaryGeneratedColumn()
  id: number;

  @Column('character varying', { length: 255 })
  username: string;

  @Column('character varying', { length: 255 })
  email: string;

  @Column()
  password: string;

  @OneToOne(() => Student, student => student.user, { onDelete: 'CASCADE' })
  @JoinColumn()
  student: Student;

  @BeforeInsert()
  async hashPassword() {
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);
  }

  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compareSync(password, this.password);
  }
}
