<template>
    <lay-button v-permission="['setting:add']" type="normal" size="sm" @click="EditSetting(null)" style="margin:10px 0 0 10px">添加</lay-button>
    <lay-tab type="brief" v-model="currentTab" style="padding:10px;">
        <lay-tab-item v-for="row in Object.values(dataSource)"  :title="row.title" :id="String(row.id)">
            <div  v-permission="['set:group:'+String(row.id)]" style="padding:20px" >
                <lay-table 
                    :page="undefined" 
                    :resize="true"
                    :height="'100%'"
                    :columns="columns" 
                    :data-source="row.data">
                    <template #nullable="{ row }">
                        <lay-switch :model-value="row.nullable" :onswitch-value="1" :unswitch-value="2" ></lay-switch>
                    </template>
                    <template #mode="{ row }">
                        {{ modeSource[row.mode]??'' }}
                    </template>
                    <template v-slot:operator="{ row }">
                        <lay-button v-permission="['setting:edit']" size="xs" type="primary" @click="EditSetting(row)">编辑</lay-button>
                        <lay-button v-permission="['setting:val']" size="xs" type="normal" @click="EditSet(row)"> 设置 </lay-button>
                        <lay-popconfirm
                            content="确定要删除此设置吗?"
                            @confirm="DeleteSetting(row)"
                        >
                            <lay-button size="xs" type="danger" v-permission="['setting:del']"> 删除 </lay-button>
                        </lay-popconfirm>
                    </template>
                </lay-table>
            </div>
        </lay-tab-item>
    </lay-tab>
    <lay-layer v-model="ShowForm" title="添加设置项" :maxmin="true" :area="['700px', '700px']">
        <div style="padding: 20px">
            <lay-form :model="EditingRow" ref="EditFormRef" >
                <lay-form-item label="分组" prop="group" mode="inline" required>
                    <lay-select v-model="EditingRow.group" placeholder="请选择" style="width:160px;">
                        <lay-select-option v-for="(name,index) in GroupSource" :value="Number(index)" :label="name"></lay-select-option>
                    </lay-select>
                </lay-form-item>
                <lay-form-item label="值类型" prop="mode" mode="inline" required>
                    <lay-select v-model="EditingRow.mode" placeholder="请选择" style="width:160px;">
                        <lay-select-option v-for="(name,index) in modeSource" :value="Number(index)" :label="name"></lay-select-option>
                    </lay-select>
                </lay-form-item>
                <lay-form-item label="标识" prop="code" required  mode="inline">
                    <lay-input v-model="EditingRow.code" placeholder="只能是英文数字下划线"></lay-input>
                </lay-form-item>
                <lay-form-item label="名称" prop="name" required mode="inline">
                    <lay-input v-model="EditingRow.name"></lay-input>
                </lay-form-item>
                <lay-form-item label="排序" prop="sort" mode="inline">
                    <lay-input v-model="EditingRow.sort" type="number"></lay-input>
                </lay-form-item>
                <lay-form-item label="可空" prop="nullable"  mode="inline">
                    <lay-switch v-model="EditingRow.nullable" :onswitch-value="1" :unswitch-value="2"></lay-switch>
                </lay-form-item>
                <!-- <lay-form-item label="值" prop="value" required>
                    <lay-textarea v-model="EditingRow.value"></lay-textarea>
                </lay-form-item> -->
                <lay-form-item label="可用值" prop="optional" v-if="EditingRow.mode == 8 || EditingRow.mode == 9">
                    <template v-for="(val,key) in EditingRow.optional">
                        {{ key }} -- {{ val }} <lay-icon type="layui-icon-close-fill" color="#FF5722" @click="delOptional(key,val)"></lay-icon> &nbsp;
                        <lay-line></lay-line>
                    </template>
                    <div>
                        <lay-input v-model="addingOptional.key" style="width:40%" placeholder="名称"></lay-input>
                        <lay-input v-model="addingOptional.value" style="width:40%" placeholder="值"></lay-input>
                        <lay-button type="primary" size="xs" @click="addOptional" style="width:18%">增加选项</lay-button>
                    </div>
                </lay-form-item>
                <lay-form-item label="备注" prop="remark" >
                    <lay-textarea v-model="EditingRow.remark"></lay-textarea>
                </lay-form-item>
                <div style="width: 97%; text-align: right">
                    <lay-button size="sm" type="primary" @click="SubmitNewSetting">保存</lay-button>
                    <lay-button size="sm" @click="CancelSubmit">取消</lay-button>
                </div>
            </lay-form>
        </div>
    </lay-layer>
    <lay-layer v-model="SetValueForm" title="修改设置" :maxmin="true" :area="['700px', '700px']">
        <div style="padding: 20px">
            <lay-form :model="SetValueRow" >
                <h2 style="text-align: center;">{{ SetValueRow.name }} - {{ SetValueRow.code }}</h2>
                <lay-form-item label="值" prop="value" required>
                    <lay-switch v-if="SetValueRow.mode == 1" v-model="SetValueRow.value" onswitch-text="是" unswitch-text="否" :onswitch-value="1" :unswitch-value="2"></lay-switch>
                    <lay-input v-else-if="SetValueRow.mode == 2 || SetValueRow.mode == 3 || SetValueRow.mode == 6 "  v-model="SetValueRow.value" placeholder="" :allow-clear="true"></lay-input>
                    <lay-input-number v-else-if="SetValueRow.mode == 4" v-model="transformNumberValue" :step="1"></lay-input-number>
                    <lay-input-number v-else-if="SetValueRow.mode == 5" v-model="transformNumberValue" :precision="2" :step="0.1" :max="10"></lay-input-number>
                    <lay-textarea v-else-if="SetValueRow.mode == 7" v-model="SetValueRow.value" :show-count="true" placeholder="每行一个"></lay-textarea>
                    <lay-radio-group v-else-if="SetValueRow.mode == 8" v-model="SetValueRow.value">
                         <lay-radio  v-for="(val,key) in EditingRow.optional" :value="val">{{key}}</lay-radio>
                    </lay-radio-group>
                    <lay-checkbox-group v-else-if="SetValueRow.mode == 9" v-model="(transformArrayValue as any[])" >
                        <lay-checkbox v-for="(val,key) in EditingRow.optional" skin="primary" :value="val">{{key}}</lay-checkbox>
                    </lay-checkbox-group>
                    <Markdown v-else-if="SetValueRow.mode == 10" v-model="EditingRow.value" />
                    <lay-textarea v-else-if="SetValueRow.mode == 11" v-model="SetValueRow.value" :show-count="true"></lay-textarea>
                </lay-form-item>
                是否可空 : <lay-switch v-model="SetValueRow.nullable" :disabled="true" :onswitch-value="1" :unswitch-value="2"></lay-switch> <br>
                <div v-if="SetValueRow.remark" style="white-space: pre-wrap;">
                    <strong style="font-size:16px">备注 :</strong><br> <br> 
                    {{ SetValueRow.remark }}
                </div>
                <div style="width: 97%; text-align: right">
                    <lay-button size="sm" type="primary" @click="SubmitSetValue">保存</lay-button>
                    <lay-button size="sm" @click="CancelSetValue">取消</lay-button>
                </div>
            </lay-form>
        </div>
    </lay-layer>
</template>
<script lang="ts" setup>
import { ref,computed } from 'vue'
import { GroupWithSettingRow,SettingRow,SettingEmptyRow } from '@/types/setting'
import { intIndex } from '@/types/common'
import { selectSetting,insertSetting,updateSetting,deleteSetting,settingValue } from '@/api/module/setting'
import { TableColumn } from '@layui/layui-vue/types/component/table/typing';
import { layer } from "@layui/layui-vue"
import Markdown from '../component/markdown.vue';

//// 设置值表单
const SetValueForm = ref(false)
const SetValueRow = ref<SettingRow>(SettingEmptyRow())
const EditSet = (row:SettingRow) => {
    SetValueForm.value = true
    SetValueRow.value = row 
    // {
    //     id:row.id,
    //     value:row.value,
    //     optional:row.optional,
    // }
}
const SubmitSetValue = async () => {
    if(SetValueRow.value.nullable == 2 && SetValueRow.value.value == ''){
        layer.msg("内容不可空", { icon : 2, time: 3000})
        return;
    }
    const resp = await settingValue(SetValueRow.value.id,SetValueRow.value.value,SetValueRow.value.nullable)
    // console.log('SubmitSetValue resp : ', resp)
    if(resp.errcode > 0){
        layer.msg("操作失败: " + resp.message, { icon : 2, time: 3000})
        return 
    }
    SetValueForm.value = false
}

const CancelSetValue = () => {
    SetValueRow.value = SettingEmptyRow()
    SetValueForm.value = false
}

const columns = ref<TableColumn[]>([
    { title: '排序', type:undefined, width: '60px',key: 'sort',rowspan:3},
    { title: '名称', type:undefined,width: '150px',key: 'name',  rowspan:3 },
    { title: '标识', type:undefined, width: '150px', key: 'code',rowspan:3},
    { title: '值', type:undefined,key: 'value',rowspan:3},
    { title: '数据类型', type:undefined,key: 'mode',rowspan:3,customSlot:'mode'},
    { title: '可选', type:undefined, width: '80px',key: 'nullable',customSlot:'nullable',rowspan:3},
    {
        title: '操作',
        type:undefined,
        width:'150px',
        key: 'option',
        customSlot: 'operator',rowspan:3
    }
])

const currentTab = ref('1')
// const dataSource = ref<Record<number, GroupWithSettingRow>>({})
const dataSource = ref<Record<number, GroupWithSettingRow>>({});
const GroupSource = ref<intIndex<string>>({})
const modeSource = ref<intIndex<string>>({})
const loadSource = async () => {
    const resp = await selectSetting()
    // console.log('loadSource resp : ', resp)
    GroupSource.value = resp.extra?.groups
    modeSource.value = resp.extra?.modes
    dataSource.value = resp.data
    console.log('dataSource.value " "', dataSource.value )
}
loadSource()


const DeleteSetting = async(row:SettingRow) => {
    const resp = await deleteSetting(row.id)
    if(resp.errcode > 0){
        layer.msg("操作失败: " + resp.message, { icon : 2, time: 3000})
        return 
    }
    if(row.group){
        dataSource.value[row.group].data = dataSource.value[row.group].data.filter(item => item.id !== row.id);
    }
}


//// 设置项表单
const ShowForm = ref(false)
const EditingRow = ref<SettingRow>(SettingEmptyRow())
const EditFormRef = ref()
const EditSetting = async (row:SettingRow | null)  => {
    if(row){
        EditingRow.value = row
    }
    ShowForm.value = true
}

const addingOptional = ref<{key:string,value:string}>({key:'',value:''})
const addOptional = () => {
  // console.log(addingOptional.value)
  EditingRow.value.optional[addingOptional.value.key] = addingOptional.value.value;
  addingOptional.value = {key:'',value:''}
  // console.log(EditingRow.value)
}
const delOptional = (key:any,val:any) => {
  // console.log(key,val)
  delete(EditingRow.value.optional[key])
}

const SubmitNewSetting = async () => {
    let resp;
    if(EditingRow.value.id){
        resp = await updateSetting(EditingRow.value)
        if(resp.errcode > 0){
            layer.msg("修改失败: " + resp.message, { icon : 2, time: 3000})
            return 
        }
    }else{
        resp = await insertSetting(EditingRow.value)
        // console.log('insertSetting resp : ', resp)
        if(resp.errcode > 0){
            layer.msg("增加失败: " + resp.message, { icon : 2, time: 3000})
            return 
        }
        // console.log('dataSource.value : ', dataSource.value, 'EditingRow.value.id : ', EditingRow.value.id)
        if(dataSource.value[resp.data.group]){
            dataSource.value[resp.data.group].data.push(resp.data)
        // console.log('after insert : push. : ', dataSource.value)
        }else{
            dataSource.value[resp.data.group] = {
                id:resp.data.group,
                title:GroupSource.value[resp.data.group]??'xxx',
                data: [resp.data]
            }
            console.log('after insert : new group. : ', dataSource.value)
        }

    }
    EditingRow.value = SettingEmptyRow()
    // console.log('SubmitNewSetting : ', resp)
    ShowForm.value = false
}


const transformArrayValue = computed({
  get() {
    // 过滤掉空值，确保 checkbox 不会选中空项
    if (!SetValueRow.value.value) return [];
    return SetValueRow.value.value.split('|').filter(item => item !== '');
  },
  set(newValue: Array<string | number>) {
    // 将数组重新拼装成竖线分隔的字符串
    SetValueRow.value.value = newValue.join('|');
  }
});
// 输入框需要用 number 的地方 需要转换 
const transformNumberValue = computed({
  get() {
    // 确保即使是空字符串也能正确显示为 0 或空
    return SetValueRow.value.value === '' ? 0 : Number(SetValueRow.value.value);
  },
  set(newValue) {
    SetValueRow.value.value = String(newValue);
  }
});

const CancelSubmit = async () => {
    EditingRow.value = SettingEmptyRow()
    ShowForm.value = false
}



</script>