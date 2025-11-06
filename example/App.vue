<template>
  <div id="app">
    <h1>Vue Iconfont Loader 示例</h1>
    
    <div class="icon-list">
      <div class="icon-item">
        <i class="iconfont icon-home"></i>
        <span>首页</span>
      </div>
      
      <div class="icon-item">
        <i class="iconfont icon-user"></i>
        <span>用户</span>
      </div>
      
      <div class="icon-item">
        <i class="iconfont icon-setting"></i>
        <span>设置</span>
      </div>
      
      <div class="icon-item">
        <i class="iconfont icon-search"></i>
        <span>搜索</span>
      </div>
    </div>

    <div class="info">
      <p>当前环境：{{ env }}</p>
      <p>加载模式：{{ mode }}</p>
      <button @click="reload">重新加载</button>
    </div>
  </div>
</template>

<script setup>
import { ref, getCurrentInstance, onMounted } from 'vue';

const env = ref(process.env.NODE_ENV);
const mode = ref('');

const instance = getCurrentInstance();

onMounted(() => {
  mode.value = env.value === 'development' ? '在线模式' : '本地模式';
});

const reload = () => {
  instance?.appContext.config.globalProperties.$iconfont.reload();
  alert('已重新加载 iconfont 样式');
};
</script>

<style scoped>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

.icon-list {
  display: flex;
  justify-content: center;
  gap: 40px;
  margin: 40px 0;
  flex-wrap: wrap;
}

.icon-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.icon-item i {
  font-size: 48px;
  color: #409eff;
}

.icon-item span {
  font-size: 14px;
  color: #666;
}

.info {
  margin-top: 40px;
  padding: 20px;
  background: #f5f5f5;
  border-radius: 8px;
  display: inline-block;
}

.info p {
  margin: 10px 0;
  font-size: 14px;
  color: #666;
}

button {
  margin-top: 10px;
  padding: 8px 20px;
  background: #409eff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

button:hover {
  background: #66b1ff;
}
</style>

