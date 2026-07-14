<script setup>
import { ref, watch, computed } from 'vue'
import { useTasksStore } from '@/store/tasks'
import { showSuccess, showError } from '@/utils/toast'

const props = defineProps({
  open: Boolean,
  selectedDate: {
    type: Date,
    required: true
  }
})

const emit = defineEmits(['close'])

const tasksStore = useTasksStore()

const title = ref('')
const description = ref('')
const priority = ref(3)

watch(
  () => props.open,
  (value) => {
    if (value) {
      title.value = ''
      description.value = ''
      priority.value = 3
    }
  }
)

const formattedDate = computed(() => {
  return props.selectedDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })
})

const save = async () => {
  if (!title.value.trim()) return

  try {

    const deadline = new Date(props.selectedDate)
    deadline.setHours(12, 0, 0, 0)

    await tasksStore.addTask({
      title: title.value,
      description: description.value,
      priority: priority.value,
      deadline: deadline.toISOString()
    })

    showSuccess('Task created')

    emit('close')

  } catch (e) {
    showError('Failed to create task')
  }
}
</script>

<template>

  <Teleport to="body">

    <Transition name="fade">

      <div
        v-if="open"
        class="overlay"
        @click="emit('close')">

        <div
          class="modal"
          @click.stop>

          <h2>Add task</h2>

          <div class="selected-date">
            {{ formattedDate }}
          </div>

          <input
            v-model="title"
            placeholder="Task title" />

          <textarea
            v-model="description"
            placeholder="Description (optional)"
          />

          <label>Priority</label>

          <select v-model="priority">

            <option :value="1">High</option>
            <option :value="2">Medium</option>
            <option :value="3">Low</option>

          </select>

          <div class="buttons">

            <button
              class="cancel"
              @click="emit('close')">
              Cancel
            </button>

            <button
              class="save"
              @click="save">
              Add task
            </button>

          </div>

        </div>

      </div>

    </Transition>

  </Teleport>

</template>

<style scoped>

.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, .35);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

.modal {
  width: 430px;
  background: white;
  border-radius: 22px;
  padding: 28px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  box-shadow: 0 25px 60px rgba(0, 0, 0, .12);
}

h2 {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
}

.selected-date {
  background: #F3F4F6;
  border-radius: 12px;
  padding: 12px;
  font-size: 14px;
  color: #6B7280;
}

input,
textarea,
select {

  width: 100%;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  padding: 12px;
  font-size: 14px;
  outline: none;
  transition: .2s;
  box-sizing: border-box;

}

textarea {
  min-height: 110px;
  resize: vertical;
}

input:focus,
textarea:focus,
select:focus {
  border-color: #7C3AED;
}

label {
  font-size: 13px;
  color: #6B7280;
}

.buttons {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 6px;
}

.cancel {
  border: 1px solid #E5E7EB;
  background: white;
  border-radius: 12px;
  padding: 12px 18px;
  cursor: pointer;
}

.cancel:hover {
  background: #F9FAFB;
}

.save {
  border: none;
  background: #7C3AED;
  color: white;
  border-radius: 12px;
  padding: 12px 22px;
  cursor: pointer;
}

.save:hover {
  opacity: .9;
}

.fade-enter-active,
.fade-leave-active {
  transition: .25s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

</style>
