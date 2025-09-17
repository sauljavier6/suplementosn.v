import { Table, Model, Column, DataType, PrimaryKey, AutoIncrement, Unique, HasMany } from "sequelize-typescript";
import Stock from "./Stock";

@Table({ tableName: "Product" })
export default class Product extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column({
    type: DataType.INTEGER,
  })
  declare ID_Product: number;

  @Unique
  @Column({
    type: DataType.STRING,
  })
  declare id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare item_name: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare category_id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare form: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare color: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare image_url: string;

  // 🔗 Relaciones
  @HasMany(() => Stock, { foreignKey: "item_id", sourceKey: "id" })
  declare stock: Stock[];
}
