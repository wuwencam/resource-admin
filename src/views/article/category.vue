<template>
    <div class="table-box">
                <!-- :page="page"         v-model:selected-keys="selectedKeys" -->
      <lay-table
        :height="'100%'"
        children-column-name="children" 
        :default-expand-all="isExpandAll" 
        :columns="columns"
        :loading="loading"
        :default-toolbar="false"
        :data-source="dataSource"
      >
        <template v-slot:toolbar>
          <lay-button
            size="sm"
            type="primary"
            @click="showForm('新增', null)"
            v-permission="['art:cate:add']"
          ><lay-icon class="layui-icon-addition"></lay-icon>新增</lay-button>
          <lay-button size="sm" @click="expandAll"> 展开/收起 </lay-button>
          <!--<lay-button size="sm" @click="batchRemove"><lay-icon class="layui-icon-delete"></lay-icon> 删除 </lay-button>-->
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
            v-permission="['art:cate:edit']"
            @click="showForm('编辑', row)">编辑</lay-button>
          <lay-popconfirm
            content="确定要删除此角色吗?"
            @confirm="remove(row)" >
            <lay-button v-permission="['art:cate:del']" size="xs" border="red" border-style="dashed">删除</lay-button>
          </lay-popconfirm>
        </template>
      </lay-table>
    </div>
    <lay-layer v-model="visibleForm" :title="formTitle" :maxmin="true" :area="['800px', '800px']">
        <div style="padding: 20px">
            <lay-form :model="formRow" ref="FormRef" >
                <lay-form-item label="分类名称" prop="name" required>
                    <lay-input v-model="formRow.name"></lay-input>
                </lay-form-item>
                <lay-form-item label="父类" prop="pid" required>
                    <lay-tree-select v-model="formRow.pid" :data="dataSource" placeholder="默认顶级分类" :replaceFields="replaceFields" :allow-clear="true" default-expand-all></lay-tree-select>
                </lay-form-item>
                <lay-form-item label="状态" mode="inline">
                    <lay-switch v-model="formRow.status" onswitch-text="可用"  unswitch-text="禁用" :onswitch-value="1" :unswitch-value="2"></lay-switch>
                    <!--<lay-select v-model="formRow.status" size="sm" style="width:100px">
                        <lay-select-option v-for="(key,val) in options?.status" :value="Number(val)" :label="key"></lay-select-option>
                    </lay-select>-->
                </lay-form-item>
                <lay-form-item label="排序" prop="sort" mode="inline" required>
                    <lay-input-number v-model="formRow.sort" ></lay-input-number>
                </lay-form-item>
                <lay-form-item label="SEO标题" prop="seo_title">
                    <lay-textarea name="seo_title" placeholder="最多120字" :maxlength="120" show-count v-model="formRow.seo_title" :rows="2"> </lay-textarea>
                </lay-form-item>
                <lay-form-item label="SEO关键词" prop="seo_keywords">
                    <lay-tag-input name="seo_keywords"  v-model="formRow.seo_keywords" v-model:inputValue="tempKeywords" :max="15"  placeholder="最多15个"></lay-tag-input>
                </lay-form-item>
                <lay-form-item label="SEO描述" prop="seo_description">
                    <lay-textarea name="seo_description" placeholder="最多200字" :maxlength="200" show-count v-model="formRow.seo_description"> </lay-textarea>
                </lay-form-item>
            </lay-form>
            <div style="width: 100%; text-align: center">
                <lay-button size="sm" type="primary" @click="formSubmit">保存</lay-button>
                <lay-button size="sm" @click="formCancel">取消</lay-button>
            </div>
        </div>
    </lay-layer>
</template>
<script lang="ts" setup>
import { ref,reactive } from 'vue';
import { CategoryRow,CategoryRowEmpty } from '@/types/article';
import { TableColumn } from '@layui/layui-vue/types/component/table/typing';
import { insertCategory,updateCategory,selectCategory,deleteCategory } from '@/api/module/article';
import { layer } from '@layui/layui-vue';

// const page = reactive({ current: 1, limit: 10, total: 4 })
const loading = ref(false)
const dataSource = ref<CategoryRow[]>([])
// const selectedKeys = ref()
const isExpandAll = ref(true)
const expandAll = () => {
    isExpandAll.value = !isExpandAll.value
}
const columns = ref<TableColumn[]>([
  //{ title: '选项', width: '55px', type: 'checkbox', fixed: 'left',rowspan:1,key:"id" },
  { title: '编号', width: '50px', type:undefined,key: 'id', fixed: 'left', sort: 'desc' ,rowspan:1},
  { title: '父类id', width: '50px', type:undefined, key: 'pid', rowspan:1 },
  { title: '名称', width: '80px', type:undefined, key: 'name', rowspan:1 },
  { title: '排序', width: '80px', type:undefined, key: 'sort',rowspan:1  },
  { title: '状态', width: '50px', type:undefined, key: 'status', customSlot:'status',rowspan:1 },
  {
    title: '操作', type:undefined,
    width: '150px',
    customSlot: 'operator',
    key: 'operator',
    fixed: 'right',
    rowspan:1
  }
])

const loadDataSource = async () => {
    const result = await selectCategory()
    if(result.errcode > 0){
        layer.msg("查询文章分类失败: " + result.message, { icon : 2, time: 3000})
        return ;
    }
    dataSource.value = result.data
}
loadDataSource()

const visibleForm = ref(false)
const formTitle = ref('')
const formRow = ref<CategoryRow>(CategoryRowEmpty())
const tempKeywords = ref('')
const showForm = (title:string, row:CategoryRow|null) => {
    formTitle.value = title
    if(row) formRow.value = row
    visibleForm.value = true
}
const replaceFields = ref({
	id: 'id',
	title: 'name',
	children: 'children'
})

const formSubmit = async () => {
    if(formRow.value.id > 0){
        const result = await updateCategory(formRow.value)
        if(result.errcode > 0){
            layer.msg("修改文章分类<"+formRow.value.name+">失败: " + result.message, { icon : 2, time: 3000})
            return ;
        }
        formRow.value = CategoryRowEmpty()
        visibleForm.value = false
        loadDataSource()
    }else{
        const result = await insertCategory(formRow.value)
        if(result.errcode > 0){
            layer.msg("新增文章分类<"+formRow.value.name+">失败: " + result.message, { icon : 2, time: 3000})
            return ;
        }
        formRow.value = CategoryRowEmpty()
        visibleForm.value = false
        loadDataSource()
    }
}
const formCancel = () => {
    formRow.value = CategoryRowEmpty()
    visibleForm.value = false
}

// 批量删除
// const batchRemove = () => {
//     layer.msg('不可以批量删除分类')
// }

// 删除
const remove = async(row:CategoryRow) => {
    const result = await deleteCategory({id:row.id})
    if(result.errcode > 0){
        layer.msg("删除文章分类<"+row.name+">失败: " + result.message, { icon : 2, time: 3000})
        return ;
    }
    layer.msg("删除文章分类<"+row.name+">成功: " , { icon : 1, time: 2000})
    loadDataSource()
/*
    layer.confirm('' ,
        {
            title:`确认删除文章分类<<${row.name}>>`,
            btn: [
                {text:'确定', callback: async (id) => {
                        const result = await deleteCategory({id:row.id})
                        if(result.errcode > 0){
                            layer.msg("删除文章分类<"+row.name+">失败: " + result.message, { icon : 2, time: 3000})
                            return ;
                        }
                        layer.msg("删除文章分类<"+row.name+">成功: " , { icon : 1, time: 2000})
                        layer.close(id); 
                        loadDataSource()
                    }
                },
                {text:'取消', callback: (id) => {
                        layer.msg("取消删除文章分类" + row.name);
                        layer.close(id); 
                    }
                }
            ]
        }
    );
*/
}

</script>
<style scoped>
.table-box {
  margin-top: 10px;
  padding: 10px;
  height: 700px;
  width: 100%;
  border-radius: 4px;
  box-sizing: border-box;
  background-color: #fff;
}
</style>