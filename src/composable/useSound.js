// composables/useSound.js
import { ref } from 'vue'

export function useSound() {
  const audio = ref(null)
  const tickAudio = ref(null)
  const isPlaying = ref(false)
  let intervalId = null
  let count = 0

  // Основной звук для завершения
  const playAlarm = () => {

    if (intervalId) {
      clearInterval(intervalId)
      intervalId = null
    }

    count = 0

    if (!audio.value) {
      audio.value = new Audio('/sounds/timer-bell.mp3')
    }

    isPlaying.value = true
    audio.value.currentTime = 0
    intervalId = setInterval(() => {
      if (count >= 3) {
        // Останавливаем после 3 раз
        clearInterval(intervalId)
        intervalId = null
        isPlaying.value = false
        audio.value.pause()
        audio.value.currentTime = 0
        return
      }
      audio.value.currentTime = 0
      audio.value.play().catch(() => {
      })
      count++
    }, 850)


  }

  // Остановка звука
  const stopAlarm = () => {
    if (audio.value) {
      audio.value.pause()
      audio.value.currentTime = 0
      isPlaying.value = false
      audio.value.onended = null
    }
    if (tickAudio.value) {
      tickAudio.value.pause()
      tickAudio.value.currentTime = 0
    }
  }

  return {
    playAlarm,
    stopAlarm,
    isPlaying
  }
}
