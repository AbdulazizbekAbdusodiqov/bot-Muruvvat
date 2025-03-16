import { Column, DataType, Model, Table } from "sequelize-typescript";

interface IDonationCreationAttr {
  what: string | undefined;
  whom: string | undefined;
  generous_id: number | undefined;
  status: boolean | undefined;
  is_anonymous: boolean | undefined;
  last_state: string | undefined;
 
}

@Table({ tableName: "donation" })
export class Donation extends Model<Donation, IDonationCreationAttr> {

  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  declare id: number | undefined;

  @Column({
    type: DataType.STRING,
  })
  whom: string | undefined;

  @Column({
    type: DataType.STRING,
  })
  what: string | undefined;

  @Column({
    type: DataType.BIGINT,
  })
  generous_id: number | undefined;

  @Column({
    type: DataType.STRING,
  })
  status: string | undefined;

  @Column({
    type: DataType.BOOLEAN,
  })
  is_anonymous: boolean | undefined;

  @Column({
    type: DataType.STRING,
  })
  last_state: string | undefined;

  @Column({
    type: DataType.STRING,
  })
  declare messageId: string | undefined;
}
