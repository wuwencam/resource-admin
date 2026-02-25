<template>
  <lay-container fluid="true" class="role-box">
    <!-- table -->
    <div class="table-box">
      <lay-table
        :page="page"
        :height="'100%'"
        :columns="columns"
        :loading="loading"
        :default-toolbar="false"
        :data-source="dataSource"
        v-model:selected-keys="selectedKeys"
        @change="change"
        @sortChange="sortChange"
      >
        <template v-slot:toolbar>
          <lay-button
            size="sm"
            type="primary"
            @click="EditRow('新增', null)"
            v-permission="['role:add']"
          >
            <lay-icon class="layui-icon-addition"></lay-icon>
            新增</lay-button
          >
          <lay-button v-permission="['role:batch:del']" size="sm" @click="toRemove">
            <lay-icon class="layui-icon-delete"></lay-icon>
            删除
          </lay-button>
        </template>
        <template v-slot:operator="{ row }">
          <lay-button
            size="xs"
            border="green"
            border-style="dashed"
            @click="EditRow('编辑', row)"
            v-permission="['role:edit']"
            >编辑</lay-button
          >
          <lay-button
            size="xs"
            border="blue"
            border-style="dashed"
            @click="toPrivileges(row)"

            >分配权限</lay-button
          >
          <lay-popconfirm
            content="确定要删除此角色吗?"
            @confirm="confirm(row)"
            @cancel="cancel"
          >
            <lay-button v-permission="['role:del']" size="xs" border="red" border-style="dashed"
              >删除</lay-button
            >
          </lay-popconfirm>
        </template>
      </lay-table>
    </div>

    <lay-layer v-model="ShowEdit" :title="EditingTitle" :area="['500px', '370px']">
      <div style="padding: 20px">
        <lay-form :model="EditingRow" ref="layFormRef11" >
          <lay-form-item label="角色名称" prop="name" required>
            <lay-input v-model="EditingRow.name"></lay-input>
          </lay-form-item>
          <lay-form-item label="描述" prop="remark">
            <lay-textarea
              placeholder="请输入描述"
              v-model="EditingRow.remark"
            ></lay-textarea>
          </lay-form-item>
        </lay-form>
        <div style="width: 100%; text-align: center">
          <lay-button size="sm" type="primary" @click="toSubmit">保存</lay-button>
          <lay-button size="sm" @click="toCancel">取消</lay-button>
        </div>
      </div>
    </lay-layer>

    <lay-layer v-model="visible22" title="分配权限" :area="['500px', '450px']">
      <div style="height: 320px; overflow: auto">
        <!-- @node-click="handleClick" -->
        <lay-tree
          style="margin-left: 40px"
          :data="data2"
          :showCheckbox="true"
          :default-expand-all="true"
          :check-strictly="true"
          v-model:checkedKeys="checkedKeys2"
          ref="treeRef"
        >
            <!-- <template #title="{ data }">
            <lay-icon :class="data.icon"></lay-icon>
              {{ data.title }}
          </template>    
                    
          
          :default-expand-all="true"
          -->
        </lay-tree>
      </div>
      <lay-line></lay-line>
      <div style="width: 90%; text-align: right">
        <lay-button size="sm" type="primary" @click="toAuth">保存</lay-button>
        <lay-button size="sm" @click="toAuthCancel">取消</lay-button>
      </div>
    </lay-layer>
  </lay-container>
</template>
<script setup lang="ts">
import { ref, reactive } from 'vue'
import { layer } from '@layui/layui-vue'
import { TableColumn } from '@layui/layui-vue/types/component/table/typing';
import { AdminRoleRow,AdminRoleEmptyRow,AdminActionRow,AdminSetRoleActionsRow} from '@/types/admin';
import { insertRole,updateRole,deleteRole,selectRole,selectAction,saveRoleActions,getSelectedActionIds } from '@/api/module/admin';

const loading = ref(false)
const selectedKeys = ref()
const page = reactive({ current: 1, limit: 10, total: 4 })
const columns = ref<TableColumn[]>([
  { title: '选项', width: '55px', type: 'checkbox', fixed: 'left',key:'', rowspan:2},
  { title: '编号', width: '80px', type:undefined, key: 'id', fixed: 'left', sort: 'desc', rowspan:2 },
  { title: '角色名称', width: '80px',type:undefined, key: 'name', sort: 'desc' , rowspan:2},
  { title: '备注', width: '260px',type:undefined, key: 'remark', sort: 'desc', rowspan:2 },
  {
    type:undefined,
    title: '操作',
    width: '150px',
    customSlot: 'operator',
    key: 'operator',
    fixed: 'right', rowspan:2
  }
])
const change = (page: any) => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 1000)
}
const sortChange = (key: any, sort: number) => {
  layer.msg(`字段${key} - 排序${sort}, 你可以利用 sort-change 实现服务端排序`)
}
const dataSource = ref<AdminRoleRow[]>([])
// const changeStatus = (isChecked: boolean, row: any) => {
//   dataSource.value.forEach((item: any) => {
//     if (item.id === row.id) {
//       layer.msg('Success', { icon: 1 }, () => {
//         item.flage = isChecked
//       })
//     }
//   })
// }
// const remove = () => {
//   layer.msg(selectedKeys.value, { area: '50%' })
// }
const loadDataSource = async () => {
    const data = await selectRole({})
    console.log('loadDataSource : ', data)
    dataSource.value = data.data as AdminRoleRow[];
}

loadDataSource()

const ShowEdit = ref(false)
const EditingTitle = ref('新增')
const editing = ref(true);

const EditingRow = ref<AdminRoleRow>(AdminRoleEmptyRow())
const EditFormRef = ref()

const EditRow = (text: any, row: any) => {
  EditingTitle.value = text
  if (row != null) {
    let info = JSON.parse(JSON.stringify(row))
    EditingRow.value = info
  } else {
    EditingRow.value = AdminRoleEmptyRow()
  }
  ShowEdit.value = !ShowEdit.value
}

// // 清除校验
// const clearValidate11 = function () {
//   EditFormRef.value.clearValidate()
// }
// // 重置表单
// const reset11 = function () {
//   EditFormRef.value.reset()
// }
function toRemove() {
  if (selectedKeys.value.length == 0) {
    layer.msg('您未选择数据，请先选择要删除的数据', { icon: 3, time: 2000 })
    return
  }
  layer.confirm('您将删除所有选中的数据？', {
    title: '提示',
    btn: [
      {
        text: '确定',
        callback: (id: any) => {
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
const toSubmit = async () => {
  console.log('to submit role');
  if(EditingRow.value.id){
    const resp = await  updateRole(EditingRow.value)
    if(resp){
      const index = dataSource.value.findIndex(row => row.id === EditingRow.value.id)
      if (index !== -1) {
        dataSource.value.splice(index, 1, EditingRow.value)
      }
    }
  }else{
    const resp =  await  insertRole(EditingRow.value)
    if(resp){
      let data = {...AdminRoleEmptyRow(), ...resp}
      dataSource.value.unshift( data)
    }
  }
  layer.msg('保存成功！', { icon: 1, time: 1000 })
  ShowEdit.value = false
}
function toCancel() {
  ShowEdit.value = false
}

const visible22 = ref(false)
const checkedKeys2 = ref<Array<number>>([])

const data2 = ref<AdminActionRow[]>([])

const loadMenu = async () => {
  const resp = await selectAction({})
  data2.value = resp.data as AdminActionRow[]
  console.log('load menu 222: ', data2.value)
}
loadMenu()

const AuthRoleId = ref<number>()
const treeRef = ref()

async function toPrivileges(row: any) {
  const res = await getSelectedActionIds(row.id)
  console.log('toPrivileges : ', res);
  checkedKeys2.value = res.data
  AuthRoleId.value = row.id
  visible22.value = true
}


const toAuth = async () => {
    // console.log(checkedKeys2.value)
    const resp = await saveRoleActions({id:AuthRoleId.value,action_ids:checkedKeys2.value})
    console.log('auth resp: ',resp)
    visible22.value = false
}
const toAuthCancel = async () => {
    visible22.value = false
}


async function confirm(data:AdminRoleRow) {
  if(!data.id) return ;
  const resp = await deleteRole(data.id)
  if(resp){
      layer.msg('您已成功删除')
      const index = dataSource.value.findIndex(item => item.id === data.id)
      if (index !== -1) {
          dataSource.value.splice(index, 1)
      }
  }
}
function cancel() {
  layer.msg('您已取消操作')
}


</script>

<style scoped>
.role-box {
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
.isChecked {
  display: inline-block;
  background-color: #e8f1ff;
  color: red;
}
</style>