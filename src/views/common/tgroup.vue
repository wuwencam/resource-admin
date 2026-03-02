<template> 
    <div class="table-box">
        <lay-table
            :page="page"
            :height="'100%'"
            :columns="columns"
            :loading="loading"
            :default-toolbar="false"
            :data-source="dataSource"
        >
            <template v-slot:toolbar>
                <lay-button
                    size="sm"
                    type="primary"
                    @click="showEditForm('新增单页面', null)"
                    v-permission="['page:add']"
                ><lay-icon class="layui-icon-addition"></lay-icon>新增</lay-button>
            </template>
            <template #status="{row}">
                <lay-icon v-if="row.status==1" type="layui-icon-success" color="green"></lay-icon>
                <lay-icon v-if="row.status==2" type="layui-icon-disabled" color="#FFB800"></lay-icon>
            </template>
            <template v-slot:operator="{ row }">
                <lay-button
                    size="xs"
                    border="green"
                    border-style="dashed"
                    v-permission="['page:edit']"
                    @click="showEditForm('编辑单页面', row)">编辑</lay-button>
                <lay-popconfirm
                    content="确定要删除此页面吗?"
                    @confirm="confirmDelete(row)"
                    @cancel="cancelDelete"
                >
                    <lay-button size="xs" border="red" v-permission="['page:del']" border-style="dashed">删除</lay-button>
                </lay-popconfirm>
            </template>
        </lay-table>
    </div>
    <lay-layer v-model="ShowEditing" :title="EditingTitle" :maxmin="true" :area="['900px', '800px']">
        <div style="padding: 20px">
            <lay-form :model="EditingRow" ref="EditFormRef">
                <lay-form-item label="群组标识" prop="key" tips="只能是英文数字下划线" required>
                    <lay-input name="key" v-model="EditingRow.key" placeholder="最多30字"></lay-input>
                </lay-form-item>
                <lay-form-item label="名称" prop="name" required>
                <lay-input name="name" v-model="EditingRow.name"  placeholder="最多50字"></lay-input>
                </lay-form-item>
                <lay-form-item label="Chat ID" prop="chat_id" required>
                    <lay-input name="chat_id" v-model="EditingRow.chat_id"></lay-input>
                </lay-form-item>
                <lay-form-item label="状态" prop="status">
                    <lay-switch v-model="EditingRow.status" :onswitch-value="1" :unswitch-value="2"></lay-switch>
                </lay-form-item>
                <lay-form-item label="备注" prop="remark">
                    <lay-textarea name="remark" placeholder="最多255字" :show-count="true" v-model="EditingRow.remark"></lay-textarea>
                </lay-form-item>
            </lay-form>
            <div style="width: 100%; text-align: center">
                <lay-button size="sm" type="primary" @click="EditSubmit">保存</lay-button>
                <lay-button size="sm" @click="EditCancel">取消</lay-button>
            </div>
        </div>
    </lay-layer>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue'
import { layer } from '@layui/layui-vue'
import { intIndex } from '@/types/common';
import { TableColumn } from '@layui/layui-vue/types/component/table/typing';
import { tgroupRow,tgroupRowEmpty } from '@/types/common';
import { tgroupInsert,tgroupSelect,tgroupDelete,tgroupUpdate } from '@/api/module/commone';

const loading = ref(false)
// const searchQuery = ref<PageSearchParam>(PageSearchParamDefault())
const page = reactive({ current: 1, limit: 10, total: 4 })
const dataSource = ref<tgroupRow[]>([])

const columns = ref<TableColumn[]>([
  { title: '编号', width: '50px', type:undefined,key: 'id', fixed: 'left', sort: 'desc' ,rowspan:0},
  { title: '标识', width: '80px', type:undefined, key: 'key', rowspan:0 },
  { title: '名称', width: '80px', type:undefined, key: 'name', rowspan:0 },
  { title: 'Chat ID', width: '80px', type:undefined, key: 'chat_id', rowspan:0 },
  { title: '状态', width: '80px', type:undefined, key: 'status', customSlot:'status' , rowspan:0},
  {
    title: '操作', type:undefined,
    width: '150px',
    customSlot: 'operator',
    key: 'operator',
    fixed: 'right', rowspan:0
  }
])

// function toSearch() {
//   page.current = 1
//   loadDataSource()
// }
// function toReset() {
//   searchQuery.value = PageSearchParamDefault()
//   loadDataSource()
// }
const loadDataSource = async () => {
    // const param: { group?: number, name?:string } = {}
    // if(searchQuery.value.group) param['group'] = searchQuery.value.group
    // if(searchQuery.value.name) param['name'] = searchQuery.value.name
    const data = await tgroupSelect({})
    // console.log('loadDataSource : ', data);
    dataSource.value = data.data as tgroupRow[]
    // groupSource.value = data.extra?.groups
    page.current = data.extra?.currentPage
    page.total = data.extra?.total
}
loadDataSource()

const ShowEditing = ref(false)
const EditingTitle = ref('')
const EditingRow = ref<tgroupRow>(tgroupRowEmpty())
const tempTag = ref('')
const showEditForm = (title:string, row:tgroupRow|null) => {
    EditingTitle.value = title
    if(row){
        EditingRow.value = row
    }
    ShowEditing.value = true
}
const confirmDelete = async (row:tgroupRow) => {
    const result = await tgroupDelete({id:row.id})
    if(result.errcode > 0){
        layer.msg("删除tg群组<"+row.name+">失败: " + result.message, { icon : 2, time: 3000})
        return ;
    }
    layer.msg("删除tg群组<"+row.name+">成功: " , { icon : 1, time: 2000})
    dataSource.value = dataSource.value.filter(item => item.id !== row.id);
}
const cancelDelete = async () => {
}
const EditSubmit = async () => {
    console.log('EditSubmit : ', EditingRow.value)
    if(EditingRow.value.id > 0){
        const result = await tgroupUpdate(EditingRow.value)
        if(result.errcode > 0){
            layer.msg("修改群组<"+EditingRow.value.name+">失败: " + result.message, { icon : 2, time: 3000})
            return ;
        }
        // 1. 找到该数据在数组中的下标
        const index = dataSource.value.findIndex(item => item.id === EditingRow.value.id);
        if (index !== -1) {
            // 2. 替换数据
            // 建议使用解构赋值，这样可以只更新修改过的字段，保留没改过的字段
            dataSource.value[index] = { ...dataSource.value[index], ...EditingRow.value };
            // 或者简单粗暴地全量替换
            // dataSource.value[index] = updatedRow;
        }
        EditingRow.value = tgroupRowEmpty()
        ShowEditing.value = false
    }else{
        const result = await tgroupInsert(EditingRow.value)
        if(result.errcode > 0){
            layer.msg("新增群组<"+EditingRow.value.name+">失败: " + result.message, { icon : 2, time: 3000})
            return ;
        }
        dataSource.value.unshift(result.data);
        EditingRow.value = tgroupRowEmpty()
        ShowEditing.value = false
    }
}
const EditCancel = () => {
    EditingRow.value = tgroupRowEmpty()
    ShowEditing.value = false
}
</script>
