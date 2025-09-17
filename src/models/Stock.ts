import { Table, Model, Column, DataType, PrimaryKey, AutoIncrement, ForeignKey, BelongsTo, HasMany, Unique } from "sequelize-typescript";
import Product from "./Product";
import Store from "./Store";

@Table({ tableName: "Stock" })
export default class Stock extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column({
    type: DataType.INTEGER,
  })
  declare ID_Stock: number;

  @Unique
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare variant_id: string;

  @ForeignKey(() => Product)
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare item_id: string;

  @BelongsTo(() => Product, { foreignKey: "item_id", targetKey: "id" })
  declare product: Product;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare sku: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare option1_value: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare barcode: string;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  declare default_price: number;

  // 🔗 Relación con Store
  @HasMany(() => Store, { foreignKey: "variant_id", sourceKey: "variant_id" })
  declare stores: Store[];
}
