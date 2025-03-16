import { Column, DataType, Model, Table } from "sequelize-typescript";

interface IRequestPatientCreationAttr {
  patient_id: number | undefined;
  description: string | undefined;
  last_state: string | undefined;

}

@Table({ tableName: "request_patient",timestamps:true })
export class RequestPatient extends Model<RequestPatient, IRequestPatientCreationAttr> {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  declare id: number | undefined;

  @Column({
    type: DataType.BIGINT,
  })
  declare patient_id: number | undefined;

  @Column({
    type: DataType.STRING,
  })
  declare description: string | undefined;

  @Column({
    type: DataType.STRING,
  })
  declare last_state: string | undefined;

  @Column({
    type: DataType.STRING,
  })
  declare messageId: string | undefined;

}