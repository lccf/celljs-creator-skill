<template>
  <div>
  <h1>{{ message }}</h1>
  <button @click="fetchTestData">fetch test</button>
  </div>
</template>

<script setup lang="ts">
import { ContainerUtil } from '@celljs/core';
import { onMounted, ref } from 'vue';
import { HomeService } from './service';

const message = ref('Loading');
const homeService = ContainerUtil.get<HomeService>(HomeService);

const fetchTestData = () => {
  homeService.test().then(res => alert(res.data));
}

onMounted(() => {
  homeService.main().then(res => message.value = res);
})
</script>
