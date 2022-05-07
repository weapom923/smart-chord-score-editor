<template>
  <v-dialog
    width="unset"
    scrollable
    v-bind="$attrs"
    v-bind:value="shows"
    v-bind:retain-focus="$data.$_retainsFocus"
    v-on="$listeners"
    v-on:input="$_onShowsChange"
    v-on:keydown.stop
    v-on:keydown.enter="$_onEnterKeyDown"
  >
    <v-card id="dialog-window">
      <slot name="body">
      </slot>

      <v-card-actions>
        <slot
          name="buttons"
          v-bind:on="$_buttonEventHandlers"
          v-bind:attrs="$_buttonAttributes"
        >
          <v-spacer />
          <v-btn
            color="secondary"
            v-bind="$_buttonAttributes"
            v-on:click="$_onCancelClicked"
          >
            Cancel
          </v-btn>

          <v-btn
            color="primary"
            v-bind="$_buttonAttributes"
            v-on:click="$_onOkClicked"
            v-bind:disabled="okDisabled"
          >
            OK
          </v-btn>
        </slot>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
#dialog-window {
  width: 600px;
  max-width: 100%;
}
</style>

<script>
export default {
  model: {
    prop: 'shows',
    event: 'update',
  },

  watch: {
    shows: {
      handler(newShows) {
        if (newShows) {
          this.$_initialize();
        }
      },
      immediate: true,
    },
  },

  data() {
    return {
      $_retainsFocus: false,
      $_focusBackElement: false,
      $_isOkCallbackCalled: false,
      $_isFinalizeCallbackCalled: false,
    };
  },

  props: {
    shows: { type: Boolean, default: false },
    initializeCallback: { type: Function, default: null },
    okCallback: { type: Function, default: null },
    finalizeCallback: { type: Function, default: null },
    okDisabled: { type: Boolean, default: false }
  },

  computed: {
    $_buttonAttributes() {
      return {
        text: true,
      };
    },

    $_buttonEventHandlers() {
      return {
        okClicked: this.$_onOkClicked,
        cancelClicked: this.$_onCancelClicked,
      };
    },
  },

  methods: {
    /* private */
    $_initialize() {
      this.$data.$_focusBackElement = document.activeElement;
      this.$data.$_isOkCallbackCalled = false;
      this.$data.$_isFinalizeCallbackCalled = false;
      this.$data.$_retainsFocus = true;
      if (this.initializeCallback) {
        this.initializeCallback();
      }
    },

    $_onEnterKeyDown() {
      if (this.okDisabled) return;
      this.$_onOkClicked();
    },

    $_onCancelClicked() {
      this.$_finalize();
    },

    $_onOkClicked() {
      if (!this.$data.$_isOkCallbackCalled && this.okCallback) {
        this.okCallback();
        this.$data.$_isOkCallbackCalled = true;
      }
      this.$_finalize();
    },

    $_onShowsChange(shows) {
      if (!shows) {
        this.$_finalize();
      }
    },

    $_finalize() {
      if (!this.$data.$_isFinalizeCallbackCalled && this.finalizeCallback) {
        this.finalizeCallback();
        this.$data.$_isFinalizeCallbackCalled = true;
      }
      this.$data.$_retainsFocus = false;
      this.$nextTick(() => {
        this.$data.$_focusBackElement.focus();
      });
      this.$emit('update', false);
    },
  },
}
</script>