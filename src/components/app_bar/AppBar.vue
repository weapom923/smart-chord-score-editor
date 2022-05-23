<template>
  <v-app-bar app fixed dark dense>
    <v-tooltip
      bottom
      v-for="(menuItemDefinition, menuItemDefinitionId) in $_leftMenuItemDefinitions"
      v-bind:key="menuItemDefinitionId"
    >
      <template v-slot:activator="{ on, attrs }">
        <v-btn
          x-small text
          v-bind="attrs"
          v-bind:disabled="menuItemDefinition.disabled"
          v-on="on"
          v-on:click="menuItemDefinition.callback"
        >
          <v-icon>{{ menuItemDefinition.iconName }}</v-icon>
        </v-btn>
      </template>
      <span>{{ menuItemDefinition.text }}</span>
    </v-tooltip>
    
    <v-spacer />

    <v-tooltip
      bottom
      v-for="(menuItemDefinition, menuItemDefinitionId) in $_rightMenuItemDefinitions"
      v-bind:key="menuItemDefinitionId"
    >
      <template v-slot:activator="{ on, attrs }">
        <v-btn
          x-small text
          v-bind="attrs"
          v-bind:disabled="menuItemDefinition.disabled"
          v-on="on"
          v-on:click="menuItemDefinition.callback"
        >
          <v-icon>{{ menuItemDefinition.iconName }}</v-icon>
        </v-btn>
      </template>
      <span>{{ menuItemDefinition.text }}</span>
    </v-tooltip>
  </v-app-bar>
</template>

<script>
class MenuItemDefinition {
  constructor(iconName, text, callback, disabled = false) {
    this.iconName = iconName;
    this.text = text;
    this.callback = callback;
    this.disabled = disabled;
  }
}

export default {
  props: {
    isUndoDisabled: { type: Boolean },
    isRedoDisabled: { type: Boolean },
    isPrintLayoutEnabled: { type: Boolean },
  },

  computed: {
    $_leftMenuItemDefinitions() {
      let leftMenuItemDefinitions = {
        undo: new MenuItemDefinition(
          'mdi-undo', 'undo',
          async () => { await this.undo() },
          this.isUndoDisabled,
        ),
        redo: new MenuItemDefinition(
          'mdi-redo', 'redo',
          async () => { await this.redo() },
          this.isRedoDisabled,
        ),
        generateNewScore: new MenuItemDefinition(
          'mdi-file', 'new',
          async () => { await this.generateNewScore() },
        ),
        loadScoreFile: new MenuItemDefinition(
          'mdi-folder-open', 'load',
          async () => { await this.loadScoreFile() },
        ),
        saveScoreFile: new MenuItemDefinition(
          'mdi-content-save', 'save',
          () => { this.saveScoreFile() },
        ),
        loadScoreFromTextFile: new MenuItemDefinition(
          'mdi-import', 'import from text',
          async () => { await this.loadScoreFromTextFile() },
        ),
      };
      if (this.isPrintLayoutEnabled) {
        leftMenuItemDefinitions.enablePrintLayout = new MenuItemDefinition(
          'mdi-printer-off', 'disable print layout',
          () => { this.setPrintLayoutEnabled(false) },
        );
      } else {
        leftMenuItemDefinitions.enablePrintLayout = new MenuItemDefinition(
          'mdi-printer-eye', 'enable print layout',
          () => { this.setPrintLayoutEnabled(true) },
        );
      }
      return leftMenuItemDefinitions;
    },

    $_rightMenuItemDefinitions() {
      return {
        openScoreMetadataEditorDialog: new MenuItemDefinition(
          'mdi-file-cog', 'score metadata',
          () => { this.openScoreMetadataEditorDialog() },
        ),
        openGlobalConfigEditorDialog: new MenuItemDefinition(
          'mdi-cog', 'global config',
          () => { this.openGlobalConfigEditorDialog() },
        ),
        showHelp: new MenuItemDefinition(
          'mdi-help-circle', 'show help',
          () => { this.showHelpDialog(true) },
        ),
        showInfo: new MenuItemDefinition(
          'mdi-information', 'show info',
          () => { this.showInfoDialog(true) },
        ),
      };
    },
  },

  inject: [
    'undo',
    'redo',
    'generateNewScore',
    'loadScoreFile',
    'saveScoreFile',
    'loadScoreFromTextFile',
    'openScoreMetadataEditorDialog',
    'openGlobalConfigEditorDialog',
    'setPrintLayoutEnabled',
    'showInfoDialog',
    'showHelpDialog',
  ],
}
</script>