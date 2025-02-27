<template>
  <div class="max-w-4xl mx-auto p-4 custom-scrollbar">
    <h1 class="text-2xl font-bold mb-6 text-gray-800 dark:text-white">选择题库</h1>
    
    <!-- 加载动画 -->
    <div v-if="isLoading" class="flex flex-col items-center justify-center py-12">
      <div class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      <p class="mt-4 text-gray-600 dark:text-gray-300 animate-pulse">正在加载题库...</p>
    </div>

    <!-- 题库列表 -->
    <div v-else class="grid grid-cols-1 gap-6">
      <!-- 分类折叠面板 -->
      <div v-for="(banks, category) in categorizedBanks" :key="category">
        <div
          class="bg-gradient-to-r from-blue-500 to-indigo-500 dark:from-blue-600 dark:to-indigo-600 rounded-lg p-4 cursor-pointer shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
          @click="toggleCategory(category)"
        >
          <div class="flex items-center justify-between">
            <h2 class="text-xl font-semibold text-white">{{ category }}</h2>
            <svg
              class="w-6 h-6 transform transition-transform text-white"
              :class="{ 'rotate-180': expandedCategories.has(category) }"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          <p class="text-blue-100 text-sm mt-1">{{ banks.length }} 个题库</p>
        </div>
        
        <!-- 分类下的题库列表 -->
        <div
          v-show="expandedCategories.has(category)"
          class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 ml-4 animate-fadeIn"
        >
          <div
            v-for="bank in banks"
            :key="bank.title"
            class="border rounded-lg p-4 cursor-pointer bg-white dark:bg-gray-700 hover:bg-green-50 dark:hover:bg-green-800 transition-all duration-300 shadow-sm hover:shadow-md"
            @click="selectQuizBank(bank)"
          >
            <h3 class="text-lg font-semibold text-gray-800 dark:text-white">{{ bank.title }}</h3>
            <p class="text-gray-600 dark:text-gray-300 mt-1">题数: {{ bank.questions.length }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useQuizStore } from '../stores/quizStore';
import { loadQuizBanks } from '../utils/quizLoader';
import type { QuizBank } from '../types/quiz';

const router = useRouter();
const quizStore = useQuizStore();
const expandedCategories = ref(new Set<string>());
const isLoading = ref(true);

const categorizedBanks = ref<Record<string, QuizBank[]>>({});

onMounted(async () => {
  try {
    isLoading.value = true;
    const banks = await loadQuizBanks();
    const categorized: Record<string, QuizBank[]> = {};
    
    banks.forEach((bank: QuizBank) => {
      if (!categorized[bank.category]) {
        categorized[bank.category] = [];
      }
      categorized[bank.category].push(bank);
    });
    
    categorizedBanks.value = categorized;
  } catch (error) {
    console.error('Failed to load quiz banks:', error);
  } finally {
    isLoading.value = false;
  }
});

const toggleCategory = (category: string) => {
  if (expandedCategories.value.has(category)) {
    expandedCategories.value.delete(category);
  } else {
    expandedCategories.value.add(category);
  }
};

const selectQuizBank = (bank: QuizBank) => {
  quizStore.setQuizBank(bank);
  router.push('/quiz');
};
</script>

<style scoped>
.animate-fadeIn {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.5);
  border-radius: 3px;
}
</style>