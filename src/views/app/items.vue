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
        <lay-button v-permission="['app:add']" @click="showForm('添加应用',null)" size="sm" type="primary">新增</lay-button> &nbsp;&nbsp;
    </template>
    <template v-slot:operator="{ row }">
        <lay-button v-permission="['app:edit']" @click="showForm(`编辑应用: ${row.title}`,row)" size="xs" type="primary">编辑</lay-button>
        <lay-popconfirm
            content="确定要删除此文章吗?"
            @confirm="deleteSubmit(row)" >
            <lay-button v-permission="['app:del']" size="xs" border="red" border-style="dashed">删除</lay-button>
        </lay-popconfirm>
    </template>
  </lay-table>
      <lay-layer v-model="visibleForm" :title="formTitle" :maxmin="true" :area="['1000px', '850px']">
        <div style="padding: 20px">
            <lay-form :model="formRow" ref="FormRef" >
                <lay-form-item label="应用名称" prop="name" required>
                    <lay-input v-model="formRow.name"></lay-input>
                </lay-form-item>
                <lay-form-item label="应用标识" prop="app_key" required>
                    <lay-input v-model="formRow.app_key"></lay-input>
                </lay-form-item>
                <lay-form-item label="上传路径" prop="directory" required>
                    <lay-input v-model="formRow.directory"></lay-input>
                </lay-form-item>
                <lay-form-item label="状态" mode="inline" required>
                    <lay-switch v-model="formRow.status" :onswitch-value="1" :unswitch-value="2"></lay-switch>
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
import { insert,remove,select,update } from '@/api/module/app';
import { AppRow,AppRowEmpty } from '@/types/app';
import { ref, reactive,computed } from 'vue';
import { layer } from '@layui/layui-vue';
import { TableColumn } from '@layui/layui-vue/types/component/table/typing';

const loading = ref(false);
const dataSource = ref<Array<AppRow>>([])
const page = reactive({ current: 1, limit: 30, total: 0 });
const columns = ref<TableColumn[]>([
    { title: '编号', width: '10px', key: 'id',sort: 'desc', fixed: 'left', rowspan:0},
    { title: '应用标识', width: '160px', key: 'app_key', rowspan: 0 },
    { title: '状态', width: '5px',key: 'status', customSlot:'status',rowspan:0 },
    { title: '名称', width: '60px', key: 'name', rowspan:0 },
    { title: '路径',width: '80px',key: 'directory', rowspan:0 },
    {
        title: '操作',
        width: '30px',
        customSlot: 'operator',
        key: 'operator',
        fixed: 'right',
        rowspan:0
    }
])

const loadDataSource = async () => {
    const result = await select()
    console.log('app items loadDataSource : ');
    console.log(result)
    dataSource.value = result.data
}
loadDataSource()

const visibleForm = ref(false)
const formTitle = ref('')
const formRow = ref<AppRow>(AppRowEmpty())
const showForm = (title:string, row:AppRow|null) => {
    formTitle.value = title
    if(row){
        formRow.value = row
    }
    visibleForm.value = true
}
const deleteSubmit = async(row:AppRow) => {
    const result = await remove({id:row.id})
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
        const result = await update(formRow.value)
        if(result.errcode > 0){
            layer.msg("修改应用<"+formRow.value.name+">失败: " + result.message, { icon : 2, time: 3000})
            return ;
        }
        formRow.value = AppRowEmpty()
        visibleForm.value = false
        loadDataSource()
    }else{
        const result = await insert(formRow.value)
        if(result.errcode > 0){
            layer.msg("新增应用<"+formRow.value.name+">失败: " + result.message, { icon : 2, time: 3000})
            return ;
        }
        formRow.value = AppRowEmpty()
        visibleForm.value = false
        loadDataSource()
    }
}
const formCancel = () => {
    formRow.value = AppRowEmpty()
    visibleForm.value = false
}

</script>