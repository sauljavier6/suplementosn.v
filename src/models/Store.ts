import {
  Table,
  Model,
  Column,
  DataType,
  PrimaryKey,
  AutoIncrement,
  ForeignKey,
  BelongsTo,
  BeforeValidate,
  Unique,
} from "sequelize-typescript";
import Stock from "./Stock";

@Table({ tableName: "Store" })
export default class Store extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare ID_Store: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare store_id: string;

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

  @Unique
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare store_variant_key: string;

  @BeforeValidate
  static generateStoreVariantKey(instance: Store) {
    if (instance.store_id && instance.variant_id) {
      instance.store_variant_key = `${instance.store_id}_${instance.variant_id}`;
    }
  }
}
