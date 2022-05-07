<template>
  <v-card>
    <v-card-actions class="d-flex justify-space-between">
      <v-btn
        x-small icon
        v-for="(menuItemDefinition, menuItemIdx) in $_menuItemDefinitions"
        v-bind:key="menuItemIdx"
        v-bind:disabled="menuItemDefinition.disabled"
        v-on:click="menuItemDefinition.callback"
      >
        <v-icon>{{ menuItemDefinition.iconName }}</v-icon>
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
class MenuItemDefinition {
  constructor(iconName, callback, disabled = false) {
    this.iconName = iconName;
    this.callback = callback;
    this.disabled = disabled;
  }
}

export default {
  props: {
    sectionIdx: { type: Number },
    barIdx: { type: Number },
  },

  computed: {
    $_menuItemDefinitions() {
      let menuItemDefinitions = new Array();
      menuItemDefinitions.push(
        new MenuItemDefinition(
          'mdi-plus',
          () => { this.insertBar(this.sectionIdx, this.barIdx, this.barIdx) },
        ),
      );
      menuItemDefinitions.push(
        new MenuItemDefinition(
          'mdi-delete',
          () => { this.removeBars(this.sectionIdx, this.barIdx, this.sectionIdx, this.barIdx) },
        ),
      );
      menuItemDefinitions.push(
        new MenuItemDefinition(
          'mdi-content-copy',
          () => { this.copyBars(this.sectionIdx, this.barIdx, this.sectionIdx, this.barIdx) },
        ),
      );
      menuItemDefinitions.push(
        new MenuItemDefinition(
          'mdi-content-paste',
          () => { this.pasteBars(this.sectionIdx, this.barIdx) },
          (this.$store.state.copiedBars.length === 0),
        ),
      );
      menuItemDefinitions.push(
        new MenuItemDefinition(
          'mdi-plus',
          () => { this.insertBar(this.sectionIdx, this.barIdx, this.barIdx + 1) },
        ),
      );
      return menuItemDefinitions;
    },
  },

  inject: [
    'insertBar',
    'removeBars',
    'copyBars',
    'pasteBars',
    'insertBar',
  ],
}
</script>