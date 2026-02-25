<template>
    <lay-container :fluid="true" style="padding: 10px">
        <lay-card>
            <div class="search-div">
                <lay-select v-model="searchQuery.group" size="sm" :allow-clear="true" placeholder="可选群组">
                    <lay-select-option v-for="(val,key) in groupSource" :value="key" :label="val"></lay-select-option>
                </lay-select>
                <lay-input style="width: 200px" size="sm" v-model="searchQuery.name" placeholder="名称关键词"></lay-input>
                <lay-button type="primary" style="margin-left: 10px" @click="toSearch">查询</lay-button>
                <lay-button @click="toReset">重置</lay-button>
            </div>
        </lay-card>

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
                <template #role="{row}">
                    <lay-tag> {{ groupSource[Number(row.group)] }}</lay-tag>
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
                    <lay-form-item label="名称" prop="name" required>
                    <lay-input name="name" v-model="EditingRow.name"  placeholder="最多50字"></lay-input>
                    </lay-form-item>
                    <lay-form-item label="分组" prop="group">
                        <lay-select v-model="EditingRow.group" :allow-clear="true" placeholder="可空">
                            <lay-select-option v-for="(val,key) in groupSource" :value="key" :label="val"></lay-select-option>
                        </lay-select>
                    </lay-form-item>
                    <lay-form-item label="排序" prop="sort">
                        <lay-input name="sort" v-model="EditingRow.sort"></lay-input>
                    </lay-form-item>
                    <lay-form-item label="状态" prop="status" tips="没有分组 禁用不起作用">
                        <lay-switch v-model="EditingRow.status" :onswitch-value="1" :unswitch-value="2"></lay-switch>
                    </lay-form-item>
                    <lay-form-item label="内容" prop="content" required>
                        <Markdown v-model="EditingRow.content" />
                    </lay-form-item>
                    <lay-form-item label="SEO标题" prop="seo_title">
                        <lay-input name="seo_title" v-model="EditingRow.seo_title" placeholder="最多120字"></lay-input>
                    </lay-form-item>
                    <lay-form-item label="SEO关键词" prop="seo_keywords">
                        <lay-tag-input name="seo_keywords"  v-model="EditingRow.seo_keywords" v-model:inputValue="tempTag"  placeholder="最多150字"></lay-tag-input>
                    </lay-form-item>
                    <lay-form-item label="SEO描述" prop="seo_description">
                        <lay-textarea name="seo_description" placeholder="最多200字" v-model="EditingRow.seo_description">
                        </lay-textarea>
                    </lay-form-item>
                </lay-form>
                <div style="width: 100%; text-align: center">
                    <lay-button size="sm" type="primary" @click="EditSubmit">保存</lay-button>
                    <lay-button size="sm" @click="EditCancel">取消</lay-button>
                </div>
            </div>
        </lay-layer>

    </lay-container>
</template>
<script lang="ts" setup>
import { ref, reactive } from 'vue'
import { layer } from '@layui/layui-vue'
import { intIndex } from '@/types/common';
import { TableColumn } from '@layui/layui-vue/types/component/table/typing';
import { PageRow,PageRowEmpty,PageSearchParam,PageSearchParamDefault } from '@/types/page';
import { insertPage,updatePage,selectPage,deletePage } from '@/api/module/page';
import Markdown from '../component/markdown.vue';
const loading = ref(false)
const searchQuery = ref<PageSearchParam>(PageSearchParamDefault())
const page = reactive({ current: 1, limit: 10, total: 4 })
const groupSource = ref<intIndex<string>>({})
const dataSource = ref<PageRow[]>([])

const columns = ref<TableColumn[]>([
  { title: '编号', width: '50px', type:undefined,key: 'id', fixed: 'left', sort: 'desc' ,rowspan:0},
  { title: '单页名称', width: '80px', type:undefined, key: 'name', rowspan:0 },
  { title: '所属组', width: '80px', type:undefined, key: 'group',customSlot:'group' , rowspan:0 },
  { title: '修改时间', width: '80px', type:undefined, key: 'updated_at', customSlot:'updated_at' , rowspan:0},
  { title: '添加时间', width: '80px', type:undefined, key: 'created_at', customSlot:'created_at' , rowspan:0},
  {
    title: '操作', type:undefined,
    width: '150px',
    customSlot: 'operator',
    key: 'operator',
    fixed: 'right', rowspan:0
  }
])

function toSearch() {
  page.current = 1
  loadDataSource()
}
function toReset() {
  searchQuery.value = PageSearchParamDefault()
  loadDataSource()
}
const loadDataSource = async () => {
    const param: { group?: number, name?:string } = {}
    if(searchQuery.value.group) param['group'] = searchQuery.value.group
    if(searchQuery.value.name) param['name'] = searchQuery.value.name
    const data = await selectPage(param)
    // console.log('loadDataSource : ', data);
    dataSource.value = data.data as PageRow[]
    groupSource.value = data.extra?.groups
    page.current = data.extra?.currentPage
    page.total = data.extra?.total
}
loadDataSource()

const ShowEditing = ref(false)
const EditingTitle = ref('')
const EditingRow = ref<PageRow>(PageRowEmpty())
const tempTag = ref('')
const showEditForm = (title:string, row:PageRow|null) => {
    EditingTitle.value = title
    if(row){
        EditingRow.value = row
    }
    ShowEditing.value = true
}
const confirmDelete = (row:PageRow) => {

}
const cancelDelete = () => {}
const EditSubmit = () => {
    console.log('EditSubmit : ', EditingRow.value)
    if(EditingRow.value.id > 0) {
        // if(success){
        //     EditingRow.value = PageRowEmpty()
        //     ShowEditing.value = false
        // }
    }else{
        // if(success){
        //     EditingRow.value = PageRowEmpty()
        //     ShowEditing.value = false
        // }
    }
}
const EditCancel = () => {
    EditingRow.value = PageRowEmpty()
    ShowEditing.value = false
}
</script>
