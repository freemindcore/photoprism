<template>
  <div id="photoprism">
    <v-snackbar top :timeout="0" v-model="config.disconnected" color="warning">
      <a href="https://github.com/photoprism/photoprism/issues/330" target="_blank" class="text-link">Connecting...</a>
      <v-spacer></v-spacer>
      <v-progress-circular
            indeterminate
            color="black"
            :size="16"
            :width="2"
      ></v-progress-circular>
    </v-snackbar>

    <p-loading-bar height="4"></p-loading-bar>

    <p-notify></p-notify>

    <v-app :class="$route.meta.background">
      <p-navigation></p-navigation>

      <v-content>
        <router-view></router-view>
      </v-content>
    </v-app>

    <p-photo-viewer></p-photo-viewer>
    <p-video-dialog></p-video-dialog>
  </div>
</template>

<script>
    import "./css/app.css";
    import Event from "pubsub-js";

    export default {
        name: 'photoprism',
        data() {
            return {
                config: this.$config,
                touchStart: 0,
            };
        },
        computed: {},
        methods: {
            onTouchStart(e) {
                this.touchStart = e.touches[0].pageY;
            },
            onTouchMove(e) {
                if(!this.touchStart) return;
                if(document.querySelector('.v-dialog--active') !== null) return;

                const y = e.touches[0].pageY;
                const h = window.document.documentElement.scrollHeight - window.document.documentElement.clientHeight;

                if(window.scrollY >= h - 200 && y < this.touchStart) {
                    Event.publish("touchmove.bottom");
                    this.touchStart = 0;
                } else if (window.scrollY === 0 && y > this.touchStart + 200) {
                    Event.publish("touchmove.top");
                    this.touchStart = 0;
                }
            },
        },
        created() {
            window.addEventListener('touchstart', (e) => this.onTouchStart(e), {passive: true});
            window.addEventListener('touchmove', (e) => this.onTouchMove(e), {passive: true});
            this.$config.setVuetify(this.$vuetify);
        },
        destroyed() {
            window.removeEventListener('touchstart', (e) => this.onTouchStart(e), false);
            window.removeEventListener('touchmove', (e) => this.onTouchMove(e), false);
        },
    };
</script>
