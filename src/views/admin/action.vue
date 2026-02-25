<template>
  <lay-container fluid="true" class="menu-box">
    <!-- table -->
    <div class="table-box">
      <lay-table
        :height="`100%`"
        ref="tableRef6"
        :loading="loading"
        children-column-name="children"
        :columns="columns6"
        :data-source="dataSource"
        :default-toolbar="true"
        :default-expand-all="defaultExpandAll6"
        :expand-index="1"
      >
        <template #toolbar>
          <lay-button
            size="sm"
            @click="ShowEdit('新建', null)"
            type="normal"
            v-permission="['menu:add']"
          >
            新建
          </lay-button>
          <lay-button size="sm" @click="expandAll6(true)">展开全部</lay-button>
          <lay-button size="sm" @click="expandAll6(false)">折叠全部</lay-button>
        </template>
        <template #title="{ row }">
          <lay-icon :class="row.icon"></lay-icon> &nbsp;&nbsp;
          {{ row.title }}
        </template>
        <template #option="{ row }">
          <lay-button
            @click="ShowEdit('修改', row)"
            size="xs"
            border="green"
            border-style="dashed"
            v-permission="['menu:edit']"
          >
            修改
          </lay-button>
          <lay-button
            @click="toRemove(row)"
            size="xs"
            border="red"
            border-style="dashed"
            v-permission="['menu:del']"
          >
            删除
          </lay-button>
        </template>
        <template #mode="{ row }">
          <div v-show="row.mode == 1">
            <lay-tag color="#165DFF" variant="light">目录</lay-tag>
          </div>
          <div v-show="row.mode == 2">
            <lay-tag color="#2dc570" variant="light">页面</lay-tag>
          </div>
          <div v-show="row.mode == 3">
            <lay-tag color="#F5319D" variant="light">操作</lay-tag>
          </div>
          <div v-show="row.mode == 4">
            <lay-tag color="rgb(115 115 115)" variant="light">API</lay-tag>
          </div>
        </template>
      </lay-table>
    </div>

    <lay-layer v-model="ShowEditing" :title="SaveTitle" :area="['700px', '370px']">
      <div style="padding: 20px">
        <lay-form :model="EditRow" ref="EditFormRef" required>
          <lay-row>
            <lay-col md="12">
              <lay-form-item label="菜单名称" prop="title">
                <lay-input v-model="EditRow.title"></lay-input>
              </lay-form-item>
              <lay-form-item label="父类" prop="pid">
                  <lay-tree-select v-model="EditRow.pid" :data="dataSource" placeholder="顶级节点" :default-expand-all="true" :allow-clear="true" @change="ChangeParentHandler" >
                      <template #title="{data}">
                        <div>
                            <lay-icon v-if="data.type==1" type="layui-icon-export"/>
                            <lay-icon v-if="data.type==2" type="layui-icon-file-b"/>
                            <lay-icon v-if="data.type==3" type="layui-icon-key"/>
                            <lay-icon v-if="data.type==4" type="layui-icon-fonts-code"/>
                            {{ data.title }}
                        </div>
                      </template>
                  </lay-tree-select>
              </lay-form-item>
              <lay-form-item label="类型" prop="mode">
                <lay-select v-model="EditRow.mode" placeholder="必选">
                  <lay-select-option :value="1" label="分组"></lay-select-option>
                  <lay-select-option :value="2" label="页面"></lay-select-option>
                  <lay-select-option :value="3" label="操作"></lay-select-option>
                  <lay-select-option :value="4" label="API"></lay-select-option>
                </lay-select>
              </lay-form-item>
              <lay-form-item label="路径" prop="path">
                <lay-input v-model="EditRow.value"></lay-input>
              </lay-form-item>
            </lay-col>
            <lay-col md="12">
              <lay-form-item label="图标" prop="icon">
                <lay-input v-model="EditRow.icon"></lay-input>
              </lay-form-item>
              <lay-form-item label="排序" prop="sort">
                <lay-input-number
                  style="width: 100%"
                  v-model="EditRow.sort"
                  position="right"
                ></lay-input-number>
              </lay-form-item>
            </lay-col>
          </lay-row>
        </lay-form>
        <div style="width: 97%; text-align: right">
          <lay-button size="sm" type="primary" @click="toSubmit">保存</lay-button>
          <lay-button size="sm" @click="toCancel">取消</lay-button>
        </div>
      </div>
    </lay-layer>
  </lay-container>
</template>
<script setup lang="ts">
import { ref, reactive } from 'vue'
import { layer } from '@layui/layui-vue'
import { AdminActionRow,AdminActionEmptyRow } from '@/types/admin';
// import { UserAuthStruct } from '@/types/user'
import { TableColumn } from '@layui/layui-vue/types/component/table/typing';
import { insertAction,updateAction,selectAction,deleteAction } from '@/api/module/admin';
// import { UserAuthInsert,UserAuthSelect,UserAuthUpdate,UserAuthDelete } from '@/api/module/admin';

const columns6 = ref<TableColumn[]>([
  {
    fixed: 'left',
    type: 'checkbox',
    title: '复选',key:'id',rowspan:3
  },
  {
    title: '菜单名称',
    type:undefined,
    key: 'title',
    customSlot: 'title',rowspan:3
  },
  {
    title: '地址',
        type:undefined,
    key: 'value',rowspan:3
  },
  {
    title: '排序',
    type:undefined,
    width: '120px',
    key: 'sort',rowspan:3
  },
  {
    title: '类型',
        type:undefined,
    key: 'mode',
    customSlot: 'mode',rowspan:3
  },
  {
    title: '操作',
        type:undefined,
    key: 'option',
    customSlot: 'option',rowspan:3
  }
])

const dataSource = ref<AdminActionRow[]>([])

const loadDataSource = async () => {
  const resp = await selectAction({})

  dataSource.value = resp.data as AdminActionRow[]
  console.log('loadDataSource : ', dataSource.value)
}

loadDataSource()

const ChangeParentHandler = () => {
  console.log('change parent handler')
}

const loading = ref(false)
const tableRef6 = ref()

const defaultExpandAll6 = ref(false)

const expandAll6 = function (flag: any) {
  defaultExpandAll6.value = flag
}
const EditRow = ref<AdminActionRow>(AdminActionEmptyRow())

const EditFormRef = ref()
const ShowEditing = ref(false)
const SaveTitle = ref('新增')

const ShowEdit = (text: any, row: any) => {
  SaveTitle.value = text
  if (row != null) {
    let info = JSON.parse(JSON.stringify(row))
    EditRow.value = info
  } else {
    EditRow.value = AdminActionEmptyRow()
  }
  ShowEditing.value = true
}

// 清除校验
// const clearValidate11 = function () {
//   EditFormRef.value.clearValidate()
// }
// // 重置表单
// const reset11 = function () {
//   EditFormRef.value.reset()
// }
function toRemove(row:any) {
  layer.confirm('您将删除所有选中的数据？', {
    title: '提示',
    btn: [
      {
        text: '确定',
        callback: async (id: any) => {
          await deleteAction(row.id)
          layer.msg('您已成功删除')
          layer.close(id)
        }
      },
      {
        text: '取消',
        callback: (id: any) => {
          layer.msg('您已取消操作')
          layer.close(id)
        }
      }
    ]
  })
}
async function toSubmit() {
  if(EditRow.value.id){
      const res = await updateAction(EditRow.value)
      if(res) {
        loadDataSource()
      }
  }else{
      const res = await insertAction(EditRow.value)
      if(res) {
        loadDataSource()
      }
  }
  layer.msg('保存成功！', { icon: 1, time: 1000 })
  ShowEditing.value = false
  EditRow.value = AdminActionEmptyRow()
}
function toCancel() {
  ShowEditing.value = false
}
</script>

<style scoped>
.menu-box {
  width: calc(100vw - 220px);
  height: calc(100vh - 110px);
  margin-top: 10px;
  box-sizing: border-box;
  overflow: hidden;
}
.top-search {
  margin-top: 10px;
  padding: 10px;
  height: 40px;
  border-radius: 4px;
  background-color: #fff;
}
.table-box {
  margin-top: 10px;
  padding: 10px;
  height: 700px;
  width: 100%;
  border-radius: 4px;
  box-sizing: border-box;
  background-color: #fff;
}

.search-input {
  display: inline-block;
  width: 98%;
  margin-right: 10px;
}
.table-style {
  margin-top: 10px;
}
.isChecked {
  display: inline-block;
  background-color: #e8f1ff;
  color: red;
}
</style>