<template>
  <v-card flat tile>
    <v-card-title class="justify-center">
      <h1>{{ scoreMetadata.title }}</h1>
    </v-card-title>
    <v-card-text class="d-flex">
      <v-spacer />
      <v-list dense class="flex-shrink-0">
        <v-list-item
          v-for="(name, creditTitle) in $_credits"
          v-bind:key="creditTitle"
        >
          <v-list-item-content class="credit-content mr-3">{{ creditTitle }}</v-list-item-content>
          <v-list-item-content class="credit-content justify-end">{{ name }}</v-list-item-content>
        </v-list-item>
      </v-list>
    </v-card-text>
  </v-card>
</template>

<style scoped>
.credit-content {
  min-width: fit-content;
}
</style>

<script>
import Score from '../modules/Score.js';

export default {
  props: {
    scoreMetadata: { type: Score.Metadata },
  },

  computed: {
    $_credits() {
      let credits = new Object();
      if (this.scoreMetadata.composerName !== null) {
        credits['Composed by'] = this.scoreMetadata.composerName;
      }
      if (this.scoreMetadata.arrangerName !== null) {
        credits['Arranged by'] = this.scoreMetadata.arrangerName;
      }
      return credits;
    },
  },
}
</script>