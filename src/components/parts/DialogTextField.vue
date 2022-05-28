<template>
  <v-text-field
    v-bind="$attrs"
    v-on="$listeners"
    v-on:compositionstart="$_onCompositionstart"
    v-on:compositionend="$_onCompositionend"
    v-on:keydown.enter="$_onEnter"
  >
    <template slot="default">
      <slot name="default"></slot>
    </template>

    <template
      v-for="(_, name) in $scopedSlots"
      v-slot:[name]="slotProps"
    >
      <slot v-bind:name="name" v-bind="slotProps"></slot>
    </template>
  </v-text-field>
</template>

<script>
export default {
  data() {
    return {
      $_isCompositionStarted: false,
    };
  },

  methods: {
    /* private */
    $_onCompositionstart() {
      this.$data.$_isCompositionStarted = true;
    },

    $_onCompositionend() {
      this.$data.$_isCompositionStarted = false;
    },

    $_onEnter(event) {
      if (this.$data.$_isCompositionStarted) {
        event.stopPropagation();
      } else {
        this.$emit('keydown.enter', event);
      }
    }
  },
}
</script>
