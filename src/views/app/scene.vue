<template> 
    <lay-table 
        :page="page" 
        :resize="true"
        :height="'100%'"
        :columns="columns" 
        :loading="loading"
        :default-toolbar="false"
        :even="true"
        :data-source="dataSource" >
        <template #title="{ row }">
            <lay-tooltip v-if="row.videos.length > 0" position="top"  :content="`有${row.videos.length}个视频`">
                <lay-badge position="top-left" :value="row.videos.length"> 
                    &nbsp;&nbsp;<lay-icon type="layui-icon-video" color="#5FB878" size="20px"></lay-icon> 
                </lay-badge>
            </lay-tooltip>
            &nbsp;&nbsp;<lay-tooltip position="top" :content="row.title "> <span> {{ row.title }}</span>  </lay-tooltip>
        </template>
        <template #status="{ row }">
            <lay-icon v-if="row.status==1" type="layui-icon-success" color="green"></lay-icon>
            <lay-icon v-if="row.status==2" type="layui-icon-disabled" color="#FFB800"></lay-icon>
        </template>
        <template #categories="{ row }">
            <lay-badge position="top-left" theme="green" :value="row.categories.length"> 
                <lay-tag v-for="category in row.categories" size="xs"> {{ category.name }}</lay-tag>
            </lay-badge>
        </template>
        <template #tags="{ row }">
            <lay-tooltip v-if="row.tags.length > 0" position="top"  :content="row.tags.map((item:any) => item.name).join(' , ')">
                <lay-badge position="top-left" theme="cyan" :value="row.tags.length"></lay-badge>
            </lay-tooltip>
            <lay-tag v-for="tag in row.tags" size="xs" maxWidth="100px"> {{ tag.name }}</lay-tag>
        </template>
        <template #seo_keywords="{ row }">
            <lay-tooltip v-if="row.seo_keywords.length > 0" position="top"  :content="row.seo_keywords.join(' , ')">
                <lay-badge position="top-left" theme="cyan" :value="row.seo_keywords.length"></lay-badge>
            </lay-tooltip>
            <lay-tag v-for="keyword in row.seo_keywords" size="xs" maxWidth="100px"> {{ keyword }}</lay-tag>
        </template>
        <template v-slot:toolbar>
            <lay-button v-permission="['app:scene:add']" @click="showForm('添加应用',null)" size="sm" type="primary">新增</lay-button> &nbsp;&nbsp;
        </template>
        <template v-slot:operator="{ row }">
            <lay-button v-permission="['app:scene:edit']" @click="showForm(`编辑应用: ${row.title}`,row)" size="xs" type="primary">编辑</lay-button>
            <lay-popconfirm
                content="确定要删除此文章吗?"
                @confirm="deleteSubmit(row)" >
                <lay-button v-permission="['app:scene:del']" size="xs" border="red" border-style="dashed">删除</lay-button>
            </lay-popconfirm>
        </template>
    </lay-table>
    <lay-layer v-model="visibleForm" :title="formTitle" :maxmin="true" :area="['1000px', '850px']">
        <div style="padding: 20px">
            <lay-form :model="formRow" ref="FormRef" >
                <lay-form-item label="场景名称" prop="name" required>
                    <lay-input v-model="formRow.name"></lay-input>
                </lay-form-item>
                <lay-form-item label="应用" prop="app_key" required>
                    <lay-select v-model="formRow.app_key" :show-search="true">
                        <lay-select-option v-for="(key,val) in appSource" :value="val" :label="key"></lay-select-option>
                    </lay-select>
                </lay-form-item>
                <lay-form-item label="场景标识" prop="scene_key" required>
                    <lay-input v-model="formRow.scene_key"></lay-input>
                </lay-form-item>
                <lay-form-item label="截取模式" prop="mode" required>
                    <lay-radio-group name="mode" v-model="formRow.mode">
                        <lay-radio v-for="(key,val) in modeSource" :value="Number(val)">{{ key }}</lay-radio>
                    </lay-radio-group>
                </lay-form-item>
                <lay-form-item label="宽高模式" prop="size" required>
                    <lay-radio-group name="size" v-model="formRow.size" @change="changeSizeMode">
                        <lay-radio v-for="(key,val) in sizeSource" :value="Number(val)">{{ key.name }}</lay-radio>
                    </lay-radio-group>
                </lay-form-item>
                <lay-form-item label="最大体积" prop="max_size" mode="inline" required>
                    <lay-input v-model="formRow.max_size"></lay-input>
                </lay-form-item>
                <lay-form-item label="Webp质量" prop="quality" mode="inline" required>
                    <lay-input v-model="formRow.quality"></lay-input>
                </lay-form-item>
                <lay-form-item label="允许的类型" prop="allow_mime" required>
                    <lay-checkbox-group v-model="(formRow.allow_mime as any[])" >
                        <lay-checkbox v-for="(key,val) in mimeSource" name="allow_mime" skin="primary" :value="val">{{ key }}</lay-checkbox>
                    </lay-checkbox-group>
                </lay-form-item>
                <lay-form-item v-if="tips" label="宽高填写提示">
                    <span style="color:red;font-size:24px">{{ tips }}</span>
                </lay-form-item>
                <lay-form-item label="目标宽度" mode="inline">
                    <lay-input v-model="formRow.width"></lay-input>
                </lay-form-item>
                <lay-form-item label="最小宽度" mode="inline">
                    <lay-input v-model="formRow.min_width"></lay-input>
                </lay-form-item>
                <lay-form-item label="最大宽度" mode="inline">
                    <lay-input v-model="formRow.max_width"></lay-input>
                </lay-form-item>
                <lay-form-item label="目标高度" mode="inline">
                    <lay-input v-model="formRow.height"></lay-input>
                </lay-form-item>
                <lay-form-item label="最小高度" mode="inline">
                    <lay-input v-model="formRow.min_height"></lay-input>
                </lay-form-item>
                <lay-form-item label="最大高度" mode="inline">
                    <lay-input v-model="formRow.max_height"></lay-input>
                </lay-form-item>
                <lay-form-item label="比例宽度" mode="inline">
                    <lay-input v-model="formRow.scale_width"></lay-input>
                </lay-form-item>
                <lay-form-item label="比例高度" mode="inline">
                    <lay-input v-model="formRow.scale_height"></lay-input>
                </lay-form-item>
                <lay-line></lay-line>
            </lay-form>
            <div style="width: 100%; text-align: center">
                <lay-button size="sm" type="primary" @click="formSubmit">保存</lay-button>
                <lay-button size="sm" @click="formCancel">取消</lay-button>
            </div>
        </div>
    </lay-layer>
</template>
<script setup lang="ts">
import { sceneInsert,sceneRemove,sceneSelect,sceneUpdate } from '@/api/module/app';
import { AppSceneRow,AppSceneRowEmpty,AppSceneParam } from '@/types/app';
import { ref, reactive } from 'vue';
import { layer } from '@layui/layui-vue';
import { TableColumn } from '@layui/layui-vue/types/component/table/typing';
import { intIndex, strIndex } from '@/types/common';

const loading = ref(false);
const dataSource = ref<Array<AppSceneRow>>([])
const mimeSource = ref<strIndex<string>>({})
const modeSource = ref<intIndex<string>>({})
const sizeSource = ref<intIndex<{name:string,tips:string}>>({})
const appSource = ref<strIndex<string>>({})
const page = reactive({ current: 1, limit: 30, total: 0 });
const params = ref<AppSceneParam>({})
const columns = ref<TableColumn[]>([
    { title: '编号', width: '10px', key: 'id',sort: 'desc', fixed: 'left', rowspan:0},
    { title: '应用标识', width: '80px', key: 'app_key', rowspan: 0 },
    { title: '场景标识', width: '80px', key: 'scene_key', rowspan: 0 },
    { title: '名称', width: '100px', key: 'name', rowspan:0 },
    { title: '质量',width: '80px',key: 'quality', rowspan:0 },
    {
        title: '操作',
        width: '30px',
        customSlot: 'operator',
        key: 'operator',
        fixed: 'right',
        rowspan:0
    }
])
const tips = ref('')
const changeSizeMode = function( current:number ) {    
    // console.log("当前值:" + current)
    tips.value = sizeSource.value[current].tips
}

const loadDataSource = async () => {
    const result = await sceneSelect({})
    page.current = result.extra.current
    page.total = result.extra.total
    dataSource.value = result.data
    mimeSource.value = result.extra.mimes
    modeSource.value = result.extra.mode
    sizeSource.value = result.extra.sizes
    if(page.current == 1){
        appSource.value = result.extra.apps
        console.log(' - - - - : ', appSource.value);
    }
}
loadDataSource()

const visibleForm = ref(false)
const formTitle = ref('')
const formRow = ref<AppSceneRow>(AppSceneRowEmpty())
const showForm = (title:string, row:AppSceneRow|null) => {
    formTitle.value = title
    if(row){
        formRow.value = row
    }
    visibleForm.value = true
}
const deleteSubmit = async(row:AppSceneRow) => {
    const result = await sceneRemove({id:row.id})
    if(result.errcode > 0){
        layer.msg("删除应用<"+row.name+">失败: " + result.message, { icon : 2, time: 3000})
        return ;
    }
    layer.msg("删除应用<"+row.name+">成功: " , { icon : 1, time: 2000})
    dataSource.value = dataSource.value.filter(item => item.id !=row.id)
}

const formSubmit = async () => {
    // return ;
    if(formRow.value.id > 0){
        const result = await sceneUpdate(formRow.value)
        if(result.errcode > 0){
            layer.msg("修改应用<"+formRow.value.name+">失败: " + result.message, { icon : 2, time: 3000})
            return ;
        }
        formRow.value = AppSceneRowEmpty()
        visibleForm.value = false
        loadDataSource()
    }else{
        const result = await sceneInsert(formRow.value)
        if(result.errcode > 0){
            layer.msg("新增应用<"+formRow.value.name+">失败: " + result.message, { icon : 2, time: 3000})
            return ;
        }
        formRow.value = AppSceneRowEmpty()
        visibleForm.value = false
        loadDataSource()
    }
}
const formCancel = () => {
    formRow.value = AppSceneRowEmpty()
    visibleForm.value = false
}

</script>