import sequelize from "../config/database";
import { runSync } from "../services/sync.service";

const LOCK_ID = 123456;
const INTERVAL = 60 * 60 * 1000; // 1 hora

export const startSyncJob = () => {
  setInterval(async () => {
    console.log("⏰ Tick Sync Job");

    let hasLock = false;

    try {
      const [rows]: any = await sequelize.query(
        "SELECT pg_try_advisory_lock(:lockId) AS locked",
        { replacements: { lockId: LOCK_ID } }
      );

      hasLock = rows[0].locked;

      if (!hasLock) {
        console.log("⏭️ Otra instancia tiene el lock");
        return;
      }

      console.log("🚀 Ejecutando Sync Job");

      await runSync();

      console.log("✅ Sync Job terminado");
    } catch (error) {
      console.error("❌ Error Sync Job", error);
    } finally {
      if (hasLock) {
        await sequelize.query(
          "SELECT pg_advisory_unlock(:lockId)",
          { replacements: { lockId: LOCK_ID } }
        );
        console.log("🔓 Lock liberado");
      }
    }
  }, INTERVAL);
};
