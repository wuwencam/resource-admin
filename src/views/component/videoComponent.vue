<template>
    <lay-tag-input v-model="searchIds" v-model:inputValue="searchId" size="sm" allowClear placeholder="可输入多个视频ID" style="width:350px" ></lay-tag-input> 
    <lay-button @click="searchHandler" size="sm">查询已有视频</lay-button>
    <lay-panel v-for="video in dataSource">
        <lay-input v-model="video.id" size="sm" disabled placeholder="ID"></lay-input>
        <lay-input v-model="video.name" size="sm" placeholder="视频名称"></lay-input>
        <lay-input v-model="video.video" size="sm" placeholder="视频地址"></lay-input>
        <!-- <lay-upload url="https://www.mocky.io/v2/5cc8019d300000980a055e76" field="file" @done="doneHandle" multiple>
            <template #preview>
            <img v-if="data" :src="data.url" style="width: 100px;"/>
            </template>
        </lay-upload> -->
        <lay-input v-model="video.cover" size="sm" placeholder="视频封面图地址 - 可空 - 默认文章封面图"></lay-input>
        <lay-textarea v-model="video.description" placeholder="请输入视频描述"></lay-textarea>
        <lay-button v-if="video.id <= 0" size="sm" type="normal" @click="submit(video)">保存</lay-button>
        <lay-button v-else size="sm" type="warm" @click="submit(video)">修改</lay-button>
        <lay-button @click="removeVideo(video)" size="sm" type="danger">删除</lay-button>
    </lay-panel>
     <lay-button @click="NewVideo" type="primary" size="sm" style="margin: auto;width: 300px;">添加视频</lay-button>
</template>
<script setup lang="ts">
import { ref,watch } from 'vue';
import { VideoRow,VideoRowEmpty } from '@/types/article';
import { layer } from '@layui/layui-vue';
import { insertVideo,updateVideo,selectVideo } from '@/api/module/article';

const props = withDefaults(defineProps<{
  modelValue: number[]; 
  data: VideoRow[];                
}>(),{
});
// 只有在初始时拷贝一次
// 注意：如果父组件后来更新了 props.data，本地的 localData 不会自动同步
const dataSource = ref<VideoRow[]>([...props.data]); 
const emit = defineEmits<{
  (e: 'update:modelValue', value: any): void;
}>();

// 1. 监听 keyword：如果用户把内容删光了，自动还原列表
watch(dataSource, (newVal) => {
    console.log('watch dataSource', newVal)
    emit('update:modelValue', dataSource.value.map(item => item.id)); 
}); //, { deep: true }


const searchId = ref<string>('')
const searchIds = ref<string[]>([])
const searchHandler = async () => {
    console.log('searchHandler : ', {ids:searchIds.value.map(item => Number(item))})
    const res = await selectVideo({ids:searchIds.value.map(item => Number(item))})
    if(res.errcode > 0){
        layer.msg(" 查询视频失败 " + res.message, { icon : 2, time: 3000})
        return ;
    }
    dataSource.value = [...dataSource.value,...res.data];
}

const NewVideo = () => {
    for(let i =0;i<dataSource.value.length;i++){
        if(dataSource.value[i].id <=0 ){
            layer.msg("上一个视频保存后才能添加新视频", { icon : 2, time: 3000})
            return;
        }
    }
    // dataSource.value.push(VideoRowEmpty())
    dataSource.value = [...dataSource.value, VideoRowEmpty()];
}
const removeVideo = async (video:VideoRow) => {
    dataSource.value =  dataSource.value.filter(item=> item.id !== video.id);
}
const submit = async (video:VideoRow) => {
    if(video.id > 0){
        const result = await updateVideo(video)
        if(result.errcode > 0){
            layer.msg(" 修改视频失败 " + result.message, { icon : 2, time: 3000})
            return ;
        }
    }else{
        const result = await insertVideo(video)
        if(result.errcode > 0){
            layer.msg(" 新增视频失败 " + result.message, { icon : 2, time: 3000})
            return ;
        }
        // video.id = result.data.id
        const lastItem = dataSource.value.pop();
        if(lastItem){
            // console.log(' 最后一个 ', lastItem);
            lastItem.id =  result.data.id
            // console.log(' 修改后  ', lastItem);
            dataSource.value = [...dataSource.value, lastItem];
        }
    }
}
</script>