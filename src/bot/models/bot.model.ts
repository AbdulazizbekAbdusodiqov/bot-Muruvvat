import { Column, DataType, Model, Table } from "sequelize-typescript";

interface IBotCreationAttr {
  user_id: number | undefined;
  first_name: string | undefined;
  last_name: string | undefined;
  lang: string | undefined;
  real_name:string|undefined
  role:string|undefined
  username:string|undefined
  phone_number:string| undefined
  region:string|undefined
  district:string|undefined
}

@Table({ tableName: "bot" })
export class Bot extends Model<Bot, IBotCreationAttr> {
  @Column({
    type: DataType.BIGINT,
    primaryKey: true,
  })
 declare  user_id: number | undefined;

  @Column({
    type: DataType.STRING,
  })
 declare  first_name: string | undefined;

  @Column({
    type: DataType.STRING,
  })
 declare  last_name: string | undefined;

 @Column({
  type: DataType.STRING,
})
declare  phone_number: string | undefined;


  @Column({
    type: DataType.STRING,
  })
 declare  real_name: string | undefined;

  @Column({
    type: DataType.STRING,
  })
 declare  lang: string | undefined;

  @Column({
    type: DataType.STRING,
  })
 declare  last_state: string | undefined;

 @Column({
  type: DataType.STRING,
})
declare  region: string | undefined;

@Column({
  type: DataType.STRING,
})
declare  district: string | undefined;

@Column({
  type: DataType.STRING,
})
declare  username: string | undefined;

@Column({
  type: DataType.BOOLEAN,
  defaultValue:false
})
declare  status: boolean | undefined;

  @Column({
    type: DataType.ENUM,
    values: ['generous', 'patient'] 
  })
  declare role: string | undefined;
}
