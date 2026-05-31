<template>
  <div class="tq-field" :class="{ 'tq-field--error': !!error }">
    <div v-if="label || $slots.label || trailingLabel" class="tq-field__label-row">
      <label v-if="label || $slots.label" :for="inputId" class="tq-field__label">
        <slot name="label">{{ label }}</slot>
        <span v-if="required" class="text-red-600 ml-0.5">*</span>
      </label>
      <slot name="trailing-label">
        <a v-if="trailingLabel" :href="trailingHref" class="tq-field__trailing-label">
          {{ trailingLabel }}
        </a>
      </slot>
    </div>

    <div class="tq-field__control">
      <UIcon
        v-if="leadingIcon"
        :name="leadingIcon"
        class="tq-field__icon tq-field__icon--leading"
      />
      <input
        :id="inputId"
        ref="inputRef"
        :type="actualType"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :autocomplete="autocomplete"
        :inputmode="inputmode"
        :class="['tq-field__input', { 'tq-field__input--has-leading': !!leadingIcon, 'tq-field__input--has-trailing': showTrailingSlot }]"
        @input="onInput"
        @blur="$emit('blur', $event)"
        @focus="$emit('focus', $event)"
      />
      <button
        v-if="type === 'password' && !disabled"
        type="button"
        class="tq-field__icon tq-field__icon--trailing tq-field__toggle"
        @click="showPassword = !showPassword"
        :aria-label="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
      >
        <UIcon :name="showPassword ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'" />
      </button>
    </div>

    <p v-if="error" class="tq-field__error">{{ error }}</p>
    <p v-else-if="hint" class="tq-field__hint">{{ hint }}</p>
  </div>
</template>

<script setup lang="ts">
/**
 * TqInput — input de texto del design system.
 *
 * Equivalente a AppTextField del mobile pero sin reactive_forms.
 * Soporta v-model (string), label, leading icon, error, hint,
 * y toggle de password integrado cuando type="password".
 *
 * No usa UInput de Nuxt UI porque queremos control fino del
 * radius/icon spacing — el wrapping de UInput tiene 0 ganancia
 * neta para nuestro caso de uso.
 */
const props = withDefaults(defineProps<{
  modelValue?: string
  label?: string
  placeholder?: string
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url'
  required?: boolean
  disabled?: boolean
  error?: string
  hint?: string
  leadingIcon?: string
  trailingLabel?: string
  trailingHref?: string
  autocomplete?: string
  inputmode?: 'text' | 'email' | 'tel' | 'numeric' | 'search' | 'url'
  id?: string
}>(), {
  type: 'text',
  required: false,
  disabled: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  blur: [event: FocusEvent]
  focus: [event: FocusEvent]
}>()

const inputId = computed(() => props.id || `tq-input-${useId()}`)
const showPassword = ref(false)
const inputRef = ref<HTMLInputElement | null>(null)

const actualType = computed(() => {
  if (props.type === 'password' && showPassword.value) return 'text'
  return props.type
})

const showTrailingSlot = computed(() => props.type === 'password')

function onInput(e: Event) {
  emit('update:modelValue', (e.target as HTMLInputElement).value)
}

defineExpose({ focus: () => inputRef.value?.focus() })
</script>

<style scoped>
.tq-field { display: flex; flex-direction: column; gap: 6px; }

.tq-field__label-row {
  display: flex; justify-content: space-between; align-items: center;
}
.tq-field__label {
  font-size: 13px; font-weight: 600; color: var(--text-2);
  letter-spacing: -0.01em;
}
.tq-field__trailing-label {
  font-size: 12px; font-weight: 600; color: var(--primary);
  text-decoration: none;
}
.tq-field__trailing-label:hover { text-decoration: underline; }

.tq-field__control {
  position: relative; display: flex; align-items: center;
}

.tq-field__icon {
  position: absolute; top: 50%; transform: translateY(-50%);
  width: 18px; height: 18px;
  color: var(--text-subtle);
  pointer-events: none;
}
.tq-field__icon--leading { left: 14px; }
.tq-field__icon--trailing { right: 14px; pointer-events: auto; cursor: pointer; }
.tq-field__toggle {
  background: transparent; border: 0; padding: 0;
  display: flex; align-items: center; justify-content: center;
  color: var(--text-subtle); transition: color .12s;
}
.tq-field__toggle:hover { color: var(--text-2); }

.tq-field__input {
  width: 100%; height: 44px;
  padding: 0 14px;
  border: 1px solid var(--border-strong);
  border-radius: 8px;
  background: var(--surface);
  font-family: inherit; font-size: 14px;
  color: var(--text);
  transition: border-color .15s, box-shadow .15s, background .15s;
  outline: none;
}
.tq-field__input--has-leading { padding-left: 42px; }
.tq-field__input--has-trailing { padding-right: 42px; }
.tq-field__input::placeholder { color: var(--text-subtle); }
.tq-field__input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px var(--primary-soft);
}
.tq-field__input:disabled {
  background: var(--surface-2);
  color: var(--text-muted);
  cursor: not-allowed;
}

.tq-field--error .tq-field__input {
  border-color: var(--danger);
}
.tq-field--error .tq-field__input:focus {
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--danger) 18%, transparent);
}

.tq-field__error {
  font-size: 12px; color: var(--danger); font-weight: 500;
}
.tq-field__hint {
  font-size: 12px; color: var(--text-muted);
}
</style>
