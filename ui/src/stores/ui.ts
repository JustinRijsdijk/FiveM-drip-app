import { defineStore } from "pinia";

export const useUiStore = defineStore({
  id: "ui",
  state: () => ({
    active: false,
  }),
  actions: {
    toggle() {
      this.active = !this.active;
    },
  }
});
