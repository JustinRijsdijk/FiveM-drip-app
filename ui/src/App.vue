<!-- eslint-disable @typescript-eslint/ban-ts-comment -->
<script setup>
import { useUiStore } from "./stores/ui";
import { ref } from "vue";
import logoUrl from "@/assets/logo-ebo-van-weel-drip.png";
import startImageUrl from "@/assets/start.png";
import libraryImageUrl from "@/assets/bibliotheek.png";
import dataImageUrl from "@/assets/gegevens.png";
import supportImageUrl from "@/assets/support.png";
import settingsImageUrl from "@/assets/instellingen.png";
import arrowLeftImageUrl from "@/assets/pijl-links.png";
import arrowRightImageUrl from "@/assets/pijl-rechts.png";
import kreuzeImageUrl from "@/assets/kreuze.png";
import achtungImageUrl from "@/assets/achtung.png";
import raiseDripImageUrl from "@/assets/raise-drip.png";
import lowerDripImageUrl from "@/assets/lower-drip.png";
import blackaImageUrl from "@/assets/blacka.png";

const store = useUiStore();

// Post a call to the client script to raise the Drip
const raiseDrip = () => {
  fetch(`https://${GetParentResourceName()}/raiseDrip`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
    },
    body: JSON.stringify({}),
  })
    .then((resp) => resp.json())
    .then((resp) => console.log(resp));
};

// Post a call to the client script to lower the Drip
const lowerDrip = () => {
  fetch(`https://${GetParentResourceName()}/lowerDrip`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
    },
    body: JSON.stringify({}),
  })
    .then((resp) => resp.json())
    .then((resp) => console.log(resp));
};

// Post a call to the client script to toggle the Drip extra
const toggleDripExtra = (dripExtra) => {
  fetch(`https://${GetParentResourceName()}/toggleDripExtra`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
    },
    body: JSON.stringify({ extra: dripExtra }),
  })
    .then((resp) => resp.json())
    .then((resp) => console.log(resp));
};

const navItems = ref([
  {
    name: "Start",
    icon: startImageUrl,
    selected: false,
  },
  {
    name: "Bibliotheek",
    icon: libraryImageUrl,
    selected: true,
  },
  {
    name: "Gegevens",
    icon: dataImageUrl,
    selected: false,
  },
  {
    name: "Support",
    icon: supportImageUrl,
    selected: false,
  },
  {
    name: "Instellingen",
    icon: settingsImageUrl,
    selected: false,
  },
]);
const signItems = ref([
  {
    enabled: true,
    extra: null,
    image: raiseDripImageUrl,
    action: raiseDrip,
  },
  {
    enabled: true,
    extra: null,
    image: lowerDripImageUrl,
    action: lowerDrip,
  },
  {
    enabled: true,
    extra: 8,
    image: kreuzeImageUrl,
    action: null,
  },
  {
    enabled: true,
    extra: 11,
    image: arrowLeftImageUrl,
    action: null,
  },
  {
    enabled: true,
    extra: 12,
    image: arrowRightImageUrl,
    action: null,
  },
  {
    enabled: true,
    extra: 10,
    image: achtungImageUrl,
    action: null,
  },
  {
    enabled: false,
    extra: null,
    image: blackaImageUrl,
    action: null,
  },
  {
    enabled: false,
    extra: null,
    image: blackaImageUrl,
    action: null,
  },
  {
    enabled: false,
    extra: null,
    image: blackaImageUrl,
    action: null,
  },
]);

// Post a call to the client script to close the NUI
const closeNui = () => {
  fetch(`https://${GetParentResourceName()}/close`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
    },
    body: JSON.stringify({}),
  })
    .then((resp) => resp.json())
    .then((resp) => console.log(resp));
};

// Listen for the 'ui' message. If it is there, open the ui
window.addEventListener("message", (event) => {
  if (event.data.type === "ui") {
    console.log("opening NUI");
    store.toggle();
  }
});
</script>

<template>
  <main v-if="store.$state.active">
    <div class="blacka text-gray-300 shadow rounded-lg">
      <div class="pb-2 gap-72 flex items-center text-center">
        <img :src="logoUrl" class="h-14" />
        <h3
          class="text-2xl font-extrabold uppercase leading-6 text-gray-300"
        >
          Bibliotheek
        </h3>
        <span
          @click="($event) => closeNui()"
          class="fixed text-white font-black text-xl right-16 cursor-pointer"
          >X</span>
      </div>
      <div class="px-4 py-5 sm:p-0">
        <div>
          <div class="flex gap-8">
            <ul role="list">
              <li
                v-for="navItem in navItems"
                :key="navItem.name"
                class="flex justify-between gap-x-6 p-4"
              >
                <div class="flex gap-x-4 align-middle">
                  <img
                    class="h-8 w-8 flex-none"
                    :src="navItem.icon"
                    :alt="navItem.name"
                  />
                  <p
                    :class="[
                      navItem.selected ? 'text-orange-500' : 'text-gray-300',
                    ]"
                    class="text-sm font-extrabold leading-6"
                  >
                    {{ navItem.name }}
                  </p>
                </div>
              </li>
            </ul>
            <div class="grid grid-cols-3 gap-4 bg-neutral-700 p-2 mr-2 mb-2">
              <div v-for="entry in signItems" :key="entry">
                <button
                  @click="
                    entry.action ? entry.action() : toggleDripExtra(entry.extra)
                  "
                  type="button"
                  class="relative block w-full"
                >
                  <img :src="entry.image" class="h-20" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<style>
.blacka {
  background-color: #0f0708;
}

body {
  background: none !important;
  width: 50rem;
  height: 50rem;
  position: absolute;
  right: 2.5%;
  top: 50%;

  overflow-y: hidden;
}

.icon {
  width: 2.5rem;
  height: 2.5rem;
  fill: white;
}
</style>
