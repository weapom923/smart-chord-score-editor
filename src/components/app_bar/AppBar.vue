<template>
  <v-app-bar app fixed dark dense>
    <v-btn small text v-on:click="$emit('generate-new-score')">
      <v-icon>mdi-file</v-icon>new
    </v-btn>

    <v-btn small text v-on:click="$emit('load')">
      <v-icon>mdi-folder-open</v-icon>load
    </v-btn>

    <v-btn small text v-on:click="$emit('save')">
      <v-icon>mdi-content-save</v-icon>save
    </v-btn>

    <v-btn small text v-on:click="$emit('load-score-from-local-file')">
      <v-icon>mdi-import</v-icon>import from text
    </v-btn>
    
    <v-spacer />

    <v-btn small text v-on:click="$emit('open-global-config-dialog')">
      <v-icon>mdi-file-cog</v-icon>global config
    </v-btn>
  </v-app-bar>
</template>

<script>
export default {

}
</script>