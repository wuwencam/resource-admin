<template>
    <lay-input v-model="keyword" size="sm" placeholder="🔍" style="margin-top:10px;width:100px"></lay-input>
    <lay-button @click="handleSearch" type="normal" size="sm">搜索</lay-button> &nbsp;&nbsp;
    <lay-tag v-for="tag in selectedTags" closable @close="removeTag(tag)">{{ tag.name }}</lay-tag>

    <lay-line></lay-line>

    <lay-tab type="brief" v-model="activeGroup">
        <lay-tab-item v-for="(val,key) in finalGroups" :key="key" :title="val" :id="key">
            <div class="tag-flow" v-if="Number(activeGroup) == Number(key)">
                <!--如果是全部 则展示所有的标签--->
                <div v-if="Number(key)==0"  >
                    <template v-for="tag in filteredData">
                        <lay-button v-if="tag.checked" @click="handleSelect(tag)" type="primary" size="sm">{{ tag.name }}</lay-button>
                        <lay-button v-else @click="handleSelect(tag)" size="sm">{{ tag.name }}</lay-button>
                    </template>
                </div>
                <!--如果是分组 则展示分组的标签--->
                <div v-if="Number(key)!=0">
                    <template v-for="tag in groupedTags[Number(key)]" >
                        <lay-button v-if="tag.checked" @click="handleSelect(tag)" type="primary" size="sm">{{ tag.name }}</lay-button>
                        <lay-button v-else @click="handleSelect(tag)" size="sm">{{ tag.name }}</lay-button>
                    </template>
                </div>
            </div>
        </lay-tab-item>
    </lay-tab>

</template>
<script lang="ts" setup>
import { ref,computed,watch } from 'vue';
import { intIndex } from '@/types/common';
import { ArticleTagOption } from '@/types/article';

// 2. 接收 Props 并指定类型
const props = withDefaults(defineProps<{
  modelValue: number[]; // 对应 v-model 的值
  data: ArticleTagOption[];                    // 必传，且为对象数组
  groups?: intIndex<string>;                   // 可选
  
}>(),{
    groups: () => ({ 0: '全部' })
});

// console.log('tag component modelValue : ', props.modelValue, '-=-=-=-', props.data);

// 3. 定义发送事件 (用于 v-model 同步)
const emit = defineEmits<{
  (e: 'update:modelValue', value: any): void;
}>();
// 2. 核心逻辑：计算最终渲染的 groups
const finalGroups = computed(() => {
  const defaultItem = { 0: '全部' };
  // 如果 props.groups 里已经有 0 了，说明可能已经处理过或不需要重复插入
  // 这里直接使用对象解构合并，确保 { 0: '全部' } 在最前面（JS对象整数键会自动排序，但逻辑上这样合并最安全）
  return { ...defaultItem, ...props.groups };
});

const activeGroup = ref('0');
const keyword = ref('');
const searchQuery = ref(''); // 真正控制列表的变量

// 1. 监听 keyword：如果用户把内容删光了，自动还原列表
watch(keyword, (newVal) => {
  if (!newVal.trim()) {
    searchQuery.value = ''; // 触发 filteredData 还原
  }
});

// 2. 搜索按钮触发函数
const handleSearch = () => {
  searchQuery.value = keyword.value.trim();
  if (searchQuery.value) {
    activeGroup.value = '0'; // 搜索时切换到“全部”分组
  }
};
// 1. 负责搜索过滤
const filteredData = computed(() => {
  console.log('filteredData 重新计算中...');
  const search = searchQuery.value.trim().toLowerCase();
  
  if (!search) {
    return props.data;
  }
  
  // 注意：虽然在 computed 里修改 activeGroup.value 是允许的，
  // 但最好避免这种“副作用”，不过在这里它可以工作。
  activeGroup.value = '0'; 

  return props.data.filter(item => 
    item.name.toLowerCase().includes(search)
  );
});

// 2. 负责基于【过滤后的数据】进行分组
const groupedTags = computed(() => {
  console.log('groupedTags 重新计算中...');
  const result: intIndex<ArticleTagOption[]> = {};
  
  if (props.groups) {
    Object.keys(props.groups).forEach(key => {
      const groupKey = Number(key);
      // 🔥 关键点：这里必须引用 filteredData.value
      // 这样当 filteredData 变化时，groupedTags 才会跟着变
      result[groupKey] = filteredData.value.filter(row => 
        row.group.includes(groupKey)
      );
    });
  }
  return result;
});

const selectedTags = ref<ArticleTagOption[]>([])
const handleSelect = (tag:ArticleTagOption) => {
    tag.checked = true
    selectedTags.value.push(tag)
    emit('update:modelValue', selectedTags.value.map(item => item.id)); 
};
const removeTag = (tag:ArticleTagOption) => {
    tag.checked = false
    selectedTags.value = selectedTags.value.filter(item => item.id != tag.id)
    emit('update:modelValue', selectedTags.value.map(item => item.id)); 
}
</script>
<style scoped>
.tag-flow {
    max-height:200px;
    overflow-y: auto;
}
.tag-flow .layui-btn{
    margin-left:0;
    padding:0 5px;
}
</style>