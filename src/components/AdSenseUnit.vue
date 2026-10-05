<script setup>
import { nextTick, onMounted, ref } from 'vue'
import { adsenseConfig } from '../config/adsense.js'
import { loadAdSenseScript, pushAdSlot } from '../composables/useAdSense.js'

const props = defineProps({
  slotId: {
    type: String,
    required: true,
  },
  adLabel: {
    type: String,
    default: 'Advertisement',
  },
})

const filled = ref(false)

onMounted(async () => {
  if (!props.slotId || !adsenseConfig.enabled || !adsenseConfig.client) return

  const loaded = await loadAdSenseScript()
  if (!loaded) return

  await nextTick()
  if (filled.value) return
  pushAdSlot()
  filled.value = true
})
</script>

<template>
  <aside v-if="slotId && adsenseConfig.enabled" class="ad-slot" :aria-label="adLabel">
    <ins
      class="adsbygoogle"
      style="display: block"
      :data-ad-client="adsenseConfig.client"
      :data-ad-slot="slotId"
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  </aside>
</template>

<style scoped>
.ad-slot {
  margin: 22px 0;
  overflow: hidden;
  text-align: center;
}
</style>
