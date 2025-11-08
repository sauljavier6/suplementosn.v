import { Table, Model, Column, DataType, PrimaryKey, AutoIncrement, ForeignKey, BelongsTo, Unique } from "sequelize-typescript";
import Stock from "./Stock";

@Table({ tableName: "Store" })
export default class Store extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column({
    type: DataType.INTEGER,
  })
  declare ID_Store: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare store_id: string;

  //@Unique
  @ForeignKey(() => Stock)
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare variant_id: string;

  @BelongsTo(() => Stock, { foreignKey: "variant_id", targetKey: "variant_id" })
  declare stock: Stock;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare in_stock: number;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  declare updated_at: Date;
}
