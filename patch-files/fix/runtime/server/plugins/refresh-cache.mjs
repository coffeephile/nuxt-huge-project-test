import { defineNitroPlugin } from 'nitropack/runtime'
import { useStorage } from "#imports";
import { cleanCachedContents } from "../storage";

export default defineNitroPlugin((nitroApp) => {
  console.log('defineNitroPlugin');
  const storage = useStorage()

  storage.watch(async (event, key) => {
    if (key.startsWith('content:source')) {
      console.log('storage.watch', event, key);
      cleanCachedContents();
    }
  });
})
