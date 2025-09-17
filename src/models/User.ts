import { Table, Model, Column, DataType, PrimaryKey, AutoIncrement, ForeignKey, BelongsTo } from "sequelize-typescript";

@Table({ tableName: "User" })
export default class User extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column({
    type: DataType.INTEGER,
  })
  declare ID_User: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare Email: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare Password: string;

}
