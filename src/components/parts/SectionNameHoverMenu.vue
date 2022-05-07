<template>
  <v-card>
    <v-card-actions class="d-flex justify-center">
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
  },

  computed: {
    $_menuItemDefinitions() {
      let menuItemDefinitions = new Array();
      menuItemDefinitions.push(
        new MenuItemDefinition(
          'mdi-plus',
          () => { this.generateNewSection(this.sectionIdx) },
        ),
        new MenuItemDefinition(
          'mdi-file-cog',
          () => { this.openSectionEditorDialog(this.sectionIdx) },
        ),
        new MenuItemDefinition(
          'mdi-plus',
          () => { this.generateNewSection(this.sectionIdx + 1) },
        ),
      );
      return menuItemDefinitions;
    },
  },

  inject: [
    'generateNewSection',
    'openSectionEditorDialog',
  ],
}
</script>