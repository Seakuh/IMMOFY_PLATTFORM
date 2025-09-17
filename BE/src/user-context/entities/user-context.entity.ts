import { User } from 'src/users/entities/user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class UserContext {
  @PrimaryGeneratedColumn()
  id: string;

  @ManyToOne(() => User, (user) => user.userContexts, { onDelete: 'CASCADE' })
  user: User; // Beziehung zum Benutzer

  @Column('jsonb')
  contextData: Record<string, any>;

  @Column({ default: new Date() })
  createdAt: Date;
}
