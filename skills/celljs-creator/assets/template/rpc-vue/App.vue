<template>
  <h1>{{ message }}</h1>
</template>

<script lang="ts" setup>
  import { RpcUtil } from '@celljs/rpc';
  import { WelcomeServer } from '../common/welcome-protocol';
  import { onMounted, ref } from 'vue';

  const message = ref('Loading');
  onMounted(() => {
    const welcomeServer = RpcUtil.get<WelcomeServer>(WelcomeServer);
      welcomeServer.say().then((msg: string) => message.value = msg);
  });
</script>
