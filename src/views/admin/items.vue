<template>
  <lay-container fluid="true" class="role-box">
    <lay-card>
      <lay-form style="margin-top: 10px">
        <lay-row>
          <lay-col :md="5">
            <lay-form-item label="角色名称" label-width="80">
              <lay-input
                v-model="searchQuery.roleName"
                placeholder="请输入"
                size="sm"
                :allow-clear="true"
                style="width: 98%"
              ></lay-input>
            </lay-form-item>
          </lay-col>
          <lay-col :md="5">
            <lay-form-item label="角色标识" label-width="80">
              <lay-input
                v-model="searchQuery.identifying"
                placeholder="请输入"
                size="sm"
                :allow-clear="true"
                style="width: 98%"
              ></lay-input>
            </lay-form-item>
          </lay-col>
          <lay-col :md="5">
            <lay-form-item label="备注" label-width="80">
              <lay-input
                v-model="searchQuery.mark"
                placeholder="请输入"
                size="sm"
                :allow-clear="true"
                style="width: 98%"
              ></lay-input>
            </lay-form-item>
          </lay-col>
          <lay-col :md="5">
            <lay-form-item label-width="20">
              <lay-button
                style="margin-left: 20px"
                type="normal"
                size="sm"
                @click="toSearch"
              >
                查询
              </lay-button>
              <lay-button size="sm" @click="toReset"> 重置 </lay-button>
            </lay-form-item>
          </lay-col>
        </lay-row>
      </lay-form>
    </lay-card>
    <!-- table -->
    <div class="table-box">
      <lay-table
        :page="page"
        :height="'100%'"
        :columns="columns"
        :loading="loading"
        :default-toolbar="true"
        :data-source="dataSource"
        v-model:selected-keys="selectedKeys"
        @change="change"
        @sortChange="sortChange"
      >
        <template v-slot:toolbar>
          <lay-button
            size="sm"
            type="primary"
            @click="changeVisible11('新增', null)"
            v-permission="['admin:add']"
          ><lay-icon class="layui-icon-addition"></lay-icon>新增</lay-button>
          <!-- <lay-button size="sm" @click="toRemove"><lay-icon class="layui-icon-delete"></lay-icon> 删除 </lay-button> -->
        </template>
        <template #status="{row}">
              <lay-icon v-if="row.status==1" type="layui-icon-success" color="green"></lay-icon>
              <lay-icon v-if="row.status==2" type="layui-icon-disabled" color="#FFB800"></lay-icon>
        </template>
        <template #role="{row}">
            <lay-tag> {{ roleSource[Number(row.role_id)]?.name }}</lay-tag>
        </template>
        <template v-slot:operator="{ row }">
          <lay-button
            size="xs"
            border="green"
            border-style="dashed"
            v-permission="['admin:edit']"
            @click="changeVisible11('编辑', row)">编辑</lay-button>
          <lay-button
            size="xs"
            border="blue"
            border-style="dashed"
            v-permission="['admin:reset:pswd']"
            @click="layer.msg('未实现')">重置密码</lay-button>
          <lay-popconfirm
            content="确定要删除此角色吗?"
            @confirm="confirm(row)"
            @cancel="cancel"
          >
            <lay-button v-permission="['admin:del']" size="xs" border="red" border-style="dashed">删除</lay-button>
          </lay-popconfirm>
        </template>
      </lay-table>
    </div>

    <lay-layer v-model="ShowEditing" :title="EditingTitle" :maxmin="true" :area="['700px', '700px']">
      <div style="padding: 20px">
        <lay-form :model="EditingRow" ref="EditFormRef" required>
          <lay-form-item label="用户名称" prop="username">
            <lay-input v-model="EditingRow.username"></lay-input>
          </lay-form-item>
          <lay-form-item label="昵称" prop="nickname">
            <lay-input v-model="EditingRow.nickname"></lay-input>
          </lay-form-item>
          <lay-form-item label="角色" prop="role_id">
            <lay-select v-model="EditingRow.role_id" placeholder="请选择">
              <lay-select-option v-for="role in roleSource" :value="role?.id||''" :label="role.name"></lay-select-option>
            </lay-select>
          </lay-form-item>
          <lay-form-item v-if="!EditingRow.id" label="密码" prop="password">
            <lay-input v-model="EditingRow.password"></lay-input>
          </lay-form-item>
          <lay-form-item v-if="!EditingRow.id" label="确认密码" prop="password_confirm">
            <lay-input v-model="EditingRow.password_confirm"></lay-input>
          </lay-form-item>
          <lay-form-item label="状态" prop="status">
            <lay-switch v-model="EditingRow.status" :onswitch-value="1" :unswitch-value="2"></lay-switch>
          </lay-form-item>
        </lay-form>
        <div style="width: 100%; text-align: center">
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
import { AdminItemRow,AdminResetPasswordRow,AdminItemRowEmpty,AdminRoleRow } from '@/types/admin';
import { intIndex } from '@/types/common';
// import {UserStruct,UserRoleStruct} from '@/types/user'
// import { UserRoleSelect,UserSelect,UserInsert,UserUpdate,UserDelete,UserStatus,UserUpdatePassword } from '@/api/module/user'
import { insertAdmin,updateAdmin,selectAdmin,deleteAdmin,resetPassword,selectRole } from '@/api/module/admin';
import { TableColumn } from '@layui/layui-vue/types/component/table/typing';

const searchQuery = ref({
  roleName: '',
  identifying: '',
  mark: ''
})

function toReset() {
  searchQuery.value = {
    roleName: '',
    identifying: '',
    mark: ''
  }
}

function toSearch() {
  page.current = 1
  change(page)
}

const loading = ref(false)
const selectedKeys = ref()
const page = reactive({ current: 1, limit: 10, total: 4 })
const columns = ref<TableColumn[]>([
  { title: '选项', width: '55px', type: 'checkbox', fixed: 'left',key:'',rowspan:1 },
  { title: '编号', width: '50px', type:undefined,key: 'id', fixed: 'left', sort: 'desc',rowspan:1 },
  { title: '用户名', width: '80px', type:undefined, key: 'username', rowspan:1 },
  { title: '昵称', width: '80px', type:undefined, key: 'nickname',  rowspan:1},
  { title: '角色', width: '80px', type:undefined, key: 'role_id', customSlot:'role',rowspan:1 },
  { title: '状态', width: '50px', type:undefined, key: 'status', customSlot:'status',rowspan:1 },
  { title: '验证码token', width: '100px', type:undefined, key: 'opt_token', rowspan:1 },
  {
    title: '操作', type:undefined,
    width: '150px',
    customSlot: 'operator',
    key: 'operator',
    fixed: 'right',rowspan:1
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
const dataSource = ref<AdminItemRow[]>([])
const roleSource = ref<intIndex<AdminRoleRow>>({})
const loadDataSource = async () => {
  const data = await selectAdmin({})
  // console.log('loadDataSource : ', data);
  dataSource.value = data.data as AdminItemRow[]
}
const loadRoleSource = async () => {
  const data = await selectRole({})
  console.log('loadRoleSource : ', data);
  data.data.forEach((row:AdminRoleRow)=> {
    roleSource.value[row.id] = row;
  });
  // roleSource.value = data.list as UserRoleStruct[]
}

loadRoleSource()
loadDataSource()


const EditingRow = ref<AdminItemRow>(AdminItemRowEmpty())
const EditFormRef = ref()
const ShowEditing = ref(false)

const EditingTitle = ref('新增')
const changeVisible11 = (text: any, row: any) => {
  EditingTitle.value = text
  if (row != null) {
    let info = JSON.parse(JSON.stringify(row))
    EditingRow.value = info
  } else {
    EditingRow.value = AdminItemRowEmpty()
  }
  ShowEditing.value = !ShowEditing.value
}

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
        callback: async (id: any) => {
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
  layer.msg('保存成功！', { icon: 1, time: 1000 })
  if(EditingRow.value.id){
    // 修改
    const resp = await updateAdmin(EditingRow.value)
    if(resp){
      const index = dataSource.value.findIndex(row => row.id === EditingRow.value.id)
      if (index !== -1) {
        dataSource.value.splice(index, 1, EditingRow.value)
      }
    }
  }else{
    // 添加
    const resp = await insertAdmin(EditingRow.value)
    if(resp){
      let data = {...AdminItemRowEmpty(), ...resp.data}
      dataSource.value.unshift( data)
    }
  }
  ShowEditing.value = false
}

function toCancel() {
  ShowEditing.value = false
}

async function confirm(row:AdminItemRow) {
    const res = await deleteAdmin(row.id)
    if(res){
      layer.msg('您已成功删除')
      const index = dataSource.value.findIndex(item => item.id === row.id)
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