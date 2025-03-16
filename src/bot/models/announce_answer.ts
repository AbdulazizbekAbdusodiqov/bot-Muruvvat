import { Column, DataType, Model, Table } from "sequelize-typescript";

interface IAnnounceAnswerCreationAttr {
  announce_id: number | undefined;
  generous_id: number | undefined;
  patient_id: number | undefined;
  announce_text: string | undefined;
  last_state:string|undefined
  typeAnnounce: string | undefined;
}

@Table({ tableName: "announce_answer" })
export class AnnounceAnswer extends Model<AnnounceAnswer, IAnnounceAnswerCreationAttr> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement:true,
    primaryKey: true,
  })
 declare id: number | undefined;

  @Column({
    type: DataType.BIGINT,
  })
  declare  generous_id: string | undefined;

  @Column({
    type: DataType.BIGINT,
  })
  declare patient_id: string | undefined;

  @Column({
    type: DataType.INTEGER,
  })
  declare announce_id: number | undefined;


  @Column({
    type: DataType.STRING,
  })
  declare announce_text: string | undefined;

  @Column({
    type: DataType.STRING,
  })
  declare last_state: string | undefined;

  @Column({
    type: DataType.STRING,
  })
  declare typeAnnounce: string | undefined;

}