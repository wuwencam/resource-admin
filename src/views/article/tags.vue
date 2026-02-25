<template>
  <div class="tag-container">
    <lay-form id="searchParam">
        <lay-form-item label="" mode="inline">
            <lay-button v-permission="['art:tag:add']" type="primary" size="sm" @click="showForm('添加文章标签',null)">添加</lay-button>
        </lay-form-item>
        <lay-form-item label="" mode="inline">
            <lay-input v-model="params.name" size="sm" placeholder="关键词搜索"  style="width:150px"></lay-input>
        </lay-form-item>
        <lay-form-item label="" mode="inline">
            <lay-input v-model="params.id" size="sm" placeholder="ID搜索" style="width:120px"></lay-input>
        </lay-form-item>
        <lay-form-item label="" mode="inline">
            <lay-select v-model="params.is_hot" size="sm" :allow-clear="true" placeholder="热门" style="width:100px">
                <lay-select-option :value="1" label="是"></lay-select-option>
                <lay-select-option :value="2" label="否"></lay-select-option>
            </lay-select>
        </lay-form-item>
        <lay-form-item label="" mode="inline">
            <lay-select v-model="params.status" size="sm" :allow-clear="true" placeholder="状态" style="width:100px">
                <lay-select-option v-for="(key,val) in options?.status" :value="Number(val)" :label="key"></lay-select-option>
            </lay-select>
        </lay-form-item>
        <lay-form-item label="" mode="inline">
            <lay-button type="normal" size="sm" @click="searchSubmit">搜索</lay-button>
            <lay-button type="warm" size="sm" @click="searchCancel">重置</lay-button>
        </lay-form-item>
    </lay-form>
    <lay-tab type="brief" v-model="activeGroup">
        <lay-tab-item v-for="(val,key) in  options?.groups" :key="key" :title="val" :id="key">
            <div class="tag-flow" v-if="Number(activeGroup) == Number(key)">
                <!--如果是全部 则展示所有的标签--->
                <div v-if="Number(key)==0" v-for="tag in dataSource" :key="tag.id" class="tag-item">
                    <span v-if="tag.hot_sort > 0" class="tag-hot">
                        <lay-icon type="layui-icon-fire"></lay-icon>
                        <span class="hot-num">{{ tag.hot_sort }}</span>
                    </span>
                    <span class="tag-name">{{ tag.name }}</span>
                    <span class="tag-status">
                        <lay-icon v-if="tag.status === 1" type="layui-icon-ok-circle" class="status-ok"></lay-icon>
                        <lay-icon v-else type="layui-icon-error" class="status-disabled"></lay-icon>
                    </span>
                    <div class="tag-actions">
                        <lay-icon v-permission="['art:tag:edit']" type="layui-icon-edit" @click="showForm('修改文章标签',tag)"></lay-icon>
                        <lay-icon v-permission="['art:tag:del']" type="layui-icon-delete" @click="handleDelete(tag)"></lay-icon>
                    </div>
                </div>
                <!--如果是分组 则展示分组的标签--->
                <div v-if="Number(key)!=0"  v-for="tag in groupedTags[Number(key)]" :key="tag.id" class="tag-item">
                    <span v-if="tag.hot_sort > 0" class="tag-hot">
                        <lay-icon type="layui-icon-fire"></lay-icon>
                        <span class="hot-num">{{ tag.hot_sort }}</span>
                    </span>
                    <span class="tag-name">{{ tag.name }}</span>
                    <span class="tag-status">
                        <lay-icon v-if="tag.status === 1" type="layui-icon-ok-circle" class="status-ok"></lay-icon>
                        <lay-icon v-else type="layui-icon-error" class="status-disabled"></lay-icon>
                    </span>
                    <div class="tag-actions">
                        <lay-icon v-permission="['art:tag:edit']" type="layui-icon-edit" @click="showForm('修改文章标签',tag)"></lay-icon>
                        <lay-icon v-permission="['art:tag:del']" type="layui-icon-delete" @click="handleDelete(tag)"></lay-icon>
                    </div>
                </div>
            </div>
        </lay-tab-item>
    </lay-tab>
    <lay-layer v-model="visibleForm" :title="formTitle" :maxmin="true" :area="['800px', '800px']">
        <div style="padding: 20px">
            <lay-form :model="formRow" ref="FormRef" >
                <lay-form-item label="标签名称" prop="name" required>
                    <lay-input v-model="formRow.name"></lay-input>
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
                <lay-form-item label="热门排序" prop="hot_sort" mode="inline" required>
                    <lay-input-number v-model="formRow.hot_sort" ></lay-input-number>
                </lay-form-item>
                <lay-form-item label="分组" prop="group" required>
                    <lay-checkbox-group v-model="(formRow.group as any[])">
                        <lay-checkbox v-for="(key,val) in options?.groups" name="group" skin="primary" :value="Number(val)"> {{ key }}</lay-checkbox>
                    </lay-checkbox-group>
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
  </div>
</template>
<script lang="ts" setup>
import { ref,computed } from 'vue';
import { TagRow,TagRowEmpty,TagFindParam } from '@/types/article';
import { intIndex } from '@/types/common';
import { insertTag,updateTag,selectTag,deleteTag } from '@/api/module/article';
import { layer } from "@layui/layui-vue"

const activeGroup = ref('0')
const dataSource = ref<Array<TagRow>>([])
const options = ref<{groups:intIndex<string>,status:intIndex<string>}>()
const params = ref<TagFindParam>({ name:undefined,id:undefined,is_hot:undefined,status:undefined})
const loadDataSource = async () => {
    const loading = layer.load(0, {time: 3000});
    const result = await selectTag(params.value)
    if(result.errcode > 0){
        layer.msg("请求内容失败: " + result.message, { icon : 2, time: 3000})
        layer.close(loading)
        return ;
    }
    options.value = result.extra

    if (options.value?.groups) {
        options.value.groups[0] = '全部';
    }
        // console.log(' options.value.groups : ',  options.value?.groups);
    dataSource.value = result.data
    layer.close(loading)
}
loadDataSource()

// const filterGroupTags = (id:number):Array<TagRow> => {
//     console.log('filterGroupTags id: ', id)
//     if(id == 0) return dataSource.value;
//     return dataSource.value.filter(row => row.group.includes(id));
// }

const groupedTags = computed(() => {
  // 假设你想根据 key 过滤，预先处理成一个对象
  // 这样 v-for 循环的是一个静态的缓存结果
  const result:intIndex<TagRow[]> = {};
  if(options.value?.groups){
    Object.keys(options.value?.groups).forEach(key => {
        result[Number(key)] = dataSource.value.filter(row => row.group.includes(Number(key)));
    });
  }
//   console.log('groupedTags : ',result)
  return result;
});



const searchSubmit = () => {
    loadDataSource()
}
const searchCancel = () => {
    params.value = { name:undefined,id:undefined,is_hot:undefined,status:undefined}
    loadDataSource();
}

const handleDelete = async (row:any) => {

    layer.confirm('' ,
        {
            title:`确认删除文章标签<<${row.name}>>`,
            btn: [
                {text:'确定', callback: async (id) => {
                        const result = await deleteTag({id:row.id})
                        if(result.errcode > 0){
                            layer.msg("删除文章标签<"+row.name+">失败: " + result.message, { icon : 2, time: 3000})
                            return ;
                        }
                        layer.msg("删除文章标签<"+row.name+">成功: " , { icon : 1, time: 2000})
                        dataSource.value = dataSource.value.filter(item => item.id !== row.id);
                        layer.close(id); 
                    }
                },
                {text:'取消', callback: (id) => {
                        layer.msg("取消删除文章标签" + row.name);
                        layer.close(id); 
                    }
                }
            ]
        }
    );


}

//// 添加/修改
const visibleForm = ref(false)
const formTitle = ref('') 
const formRow = ref<TagRow>(TagRowEmpty())
const FormRef = ref()
const tempKeywords =ref<string>()
const showForm = (title:string, data:TagRow|null) => {
    formTitle.value = title
    if(data) formRow.value = data
    visibleForm.value = true
}
const formSubmit = async () => {
    if(formRow.value.id > 0){
        const result = await updateTag(formRow.value)
        if(result.errcode > 0){
            layer.msg("修改文章标签<"+formRow.value.name+">失败: " + result.message, { icon : 2, time: 3000})
            return ;
        }
        // 1. 找到该数据在数组中的下标
        const index = dataSource.value.findIndex(item => item.id === formRow.value.id);
        if (index !== -1) {
            // 2. 替换数据
            // 建议使用解构赋值，这样可以只更新修改过的字段，保留没改过的字段
            dataSource.value[index] = { ...dataSource.value[index], ...formRow.value };
            // 或者简单粗暴地全量替换
            // dataSource.value[index] = updatedRow;
        }
        formRow.value = TagRowEmpty()
        visibleForm.value = false
    }else{
        const result = await insertTag(formRow.value)
        if(result.errcode > 0){
            layer.msg("新增文章标签<"+formRow.value.name+">失败: " + result.message, { icon : 2, time: 3000})
            return ;
        }
        dataSource.value.unshift(result.data);
        formRow.value = TagRowEmpty()
        visibleForm.value = false
    }
}
const formCancel = () => {
    formRow.value = TagRowEmpty()
    visibleForm.value = false
}
</script>
<style scoped>
#searchParam *{ /** 空隙不要太大 */
    margin-bottom:0;
}
.tag-container {
  padding: 20px;
  background: #fff;
}

/* 标签流容器 */
.tag-flow {
  display: flex;
  flex-wrap: wrap; /* 关键：自动换行实现瀑布流感 */
  gap: 12px;       /* 标签间距 */
  padding: 10px 0;
}

/* 单个标签卡片 */
.tag-item {
  position: relative;
  display: flex;
  align-items: center;
  padding: 8px 16px;
  background: #f8f9fa;
  border: 1px solid #eee;
  border-radius: 4px;
  transition: all 0.3s;
  cursor: default;
}

.tag-item:hover {
  border-color: #009688;
  background: #f0fdfa;
}

/* 火热推荐样式 */
.tag-hot {
  color: #ff5722;
  margin-right: 6px;
  font-size: 12px;
}
.hot-num {
  font-weight: bold;
  margin-left: 2px;
}

/* 标签文字 */
.tag-name {
  font-size: 14px;
  color: #333;
  margin-right: 8px;
}

/* 状态图标（小） */
.status-ok { color: #5fb878; font-size: 12px; }
.status-disabled { color: #ff5722; font-size: 12px; }

/* 操作图标（中 & 悬浮显示） */
.tag-actions {
  position: absolute;
  right: 0;
  top: 0;
  height: 100%;
  background: rgba(255, 255, 255, 0.9);
  display: none; /* 默认隐藏 */
  align-items: center;
  padding: 0 8px;
  border-radius: 0 4px 4px 0;
}

.tag-item:hover .tag-actions {
  display: flex;
}

.tag-actions i {
  font-size: 18px; /* 中图标大小 */
  margin: 0 4px;
  cursor: pointer;
  color: #666;
}

.tag-actions i:hover {
  color: #009688;
}

.tag-actions .layui-icon-delete:hover {
  color: #ff5722;
}
</style>