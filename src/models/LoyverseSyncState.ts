import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
} from "sequelize-typescript";

@Table({ tableName: "loyverse_sync_state", timestamps: false })
export default class LoyverseSyncState extends Model {
  @PrimaryKey
  @Column(DataType.INTEGER)
  declare id: number;

  @Column(DataType.DATE)
  declare last_items_sync: Date;

  @Column(DataType.DATE)
  declare last_variants_sync: Date;

  @Column(DataType.DATE)
  declare last_stores_sync: Date;
}
