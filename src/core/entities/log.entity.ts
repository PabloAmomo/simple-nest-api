import { Column, CreateDateColumn, PrimaryGeneratedColumn } from 'typeorm';

export class LogEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  action: string;

  @Column({ type: 'json' })
  user: string;

  @Column({ type: 'json' })
  detail: string;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createDate?: Date;
}
