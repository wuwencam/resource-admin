<template>
 <lay-table 
      :page="page" 
      :resize="true"
      :height="'100%'"
      :columns="columns" 
      :loading="loading"
      :default-toolbar="false"
      :even="true"
      :data-source="dataSource" 
      @sortChange="sortChange">
    <template #title="{ row }">
        <lay-tooltip v-if="row.videos.length > 0" position="top"  :content="`有${row.videos.length}个视频`">
            <lay-badge position="top-left" :value="row.videos.length"> 
                &nbsp;&nbsp;<lay-icon type="layui-icon-video" color="#5FB878" size="20px"></lay-icon> 
            </lay-badge>
        </lay-tooltip>
        &nbsp;&nbsp;<lay-tooltip position="top" :content="row.title "> <span> {{ row.title }}</span>  </lay-tooltip>
    </template>
    <template #status="{ row }">
      <!-- <lay-switch :model-value="row.status" @change="changeStatus($event , row)"></lay-switch> -->
        <lay-tooltip v-if="row.status==1" position="top"  content="展示">
            <lay-icon type="layui-icon-vercode" size="20px"></lay-icon> 
        </lay-tooltip>
        <lay-tooltip v-if="row.status==2" position="top"  content="草稿">
            <lay-icon  color="#1E9FFF" size="20px" type="layui-icon-time"></lay-icon> 
        </lay-tooltip>
        <lay-tooltip v-if="row.status==3" position="top"  content="用户投稿">
            <lay-icon  color="#5FB878" size="20px" type="layui-icon-release"></lay-icon> 
        </lay-tooltip>
        <lay-tooltip v-if="row.status==4" position="top"  content="投稿审核失败">
            <lay-icon  color="#FFB800" size="20px" type="layui-icon-survey"></lay-icon> 
        </lay-tooltip>
        <lay-tooltip v-if="row.status==5" position="top"  content="隐藏">
            <lay-icon  color="#FFB800" size="20px" type="layui-icon-disabled"></lay-icon> 
        </lay-tooltip>
        <lay-tooltip v-if="row.status==6" position="top"  content="删除">
            <lay-icon  color="#FF5722" size="20px" type="layui-icon-error"></lay-icon> 
        </lay-tooltip>
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
    <template #created_at="{ row }">
        {{ dayjs(row.created_at * 1000).format('YYYY-MM-DD HH:mm:ss') }}
    </template>
    <template #updated_at="{ row }">
        {{ dayjs(row.updated_at * 1000).format('YYYY-MM-DD HH:mm:ss') }}
    </template>
        
    <template v-slot:toolbar>
        <lay-button v-permission="['art:add']" @click="showForm('添加文章',null)" size="sm" type="primary">新增</lay-button> &nbsp;&nbsp;
        <lay-input v-model="params.author_id" size="sm" placeholder="作者ID" :allow-clear="true" style="width: 100px;"></lay-input> 
        <lay-input v-model="params.tag_id" size="sm" placeholder="标签ID" :allow-clear="true" style="width: 100px;"></lay-input>
        <lay-input v-model="params.video_id" size="sm" placeholder="视频ID" :allow-clear="true" style="width: 100px;"></lay-input>
        <lay-input v-model="params.keyword" size="sm" placeholder="关键词" :allow-clear="true" style="width: 100px;"></lay-input>
        <lay-input v-model="params.id" size="sm" placeholder="文章ID" :allow-clear="true" style="width: 100px;"></lay-input>
        <lay-select v-model="params.status" size="sm" placeholder="状态"  :allow-clear="true" style="width: 120px;display: inline-block; vertical-align: middle;">
            <lay-select-option v-for="(key,val) in statusOptions" :value="val" :label="key"></lay-select-option>
        </lay-select>
        <lay-tree-select v-model="params.cid" :data="CategoryOptions" :replaceFields="replaceFields" size="sm" placeholder="分类" :allow-clear="true" default-expand-all style="width: 100px;"></lay-tree-select>
        &nbsp;&nbsp;<lay-button size="sm" type="normal" @click="loadDataSource">搜索</lay-button>
        <lay-button size="sm" type="warm" @click="resetParam">重置</lay-button>
    </template>
    <template v-slot:operator="{ row }">
        <lay-button v-permission="['art:edit']" @click="showForm(`编辑文章: ${row.title}`,row)" size="xs" type="primary">编辑</lay-button>
        <lay-popconfirm
            content="确定要删除此文章吗?"
            @confirm="deleteSubmit(row)" >
            <lay-button v-permission="['art:del']" size="xs" border="red" border-style="dashed">删除</lay-button>
        </lay-popconfirm>
    </template>
  </lay-table>
    <lay-layer v-model="visibleForm" :title="formTitle" :maxmin="true" :area="['1000px', '850px']">
        <div style="padding: 20px">
            <lay-form :model="formRow" ref="FormRef" >
                <lay-form-item label="标题" prop="title" required>
                    <lay-input v-model="formRow.title"></lay-input>
                </lay-form-item>
                <lay-form-item label="父类" prop="categories" required mode="inline"> 
                    <lay-tree-select v-model="formRow.categories_id" :data="processedCategoryOptions" multiple placeholder="分类必选" :replaceFields="replaceFields" :allow-clear="true" default-expand-all></lay-tree-select>
                </lay-form-item>
                <lay-form-item label="内容" :required="true">
                    <Markdown v-model="formRow.content" />
                </lay-form-item>
                <lay-form-item label="标签" :required="true">
                    <TagComponent :groups="tagGroupOptions" :data="tagOptions" v-model="formRow.tags_id" />
                </lay-form-item>
                <lay-form-item label="视频">
                    <VideoComponent v-model="formRow.videos_id"  :data="formRow.videos??[]" />
                </lay-form-item>
                <lay-form-item label="上传图片" :required="true">
                    <lay-upload url="https://www.mocky.io/v2/5cc8019d300000980a055e76" field="file" multiple>
                        <template #preview>
                        <!-- <img v-if="data" :src="data.url" style="width: 100px;"/> -->
                        </template>
                    </lay-upload>
                </lay-form-item>
                <!-- <lay-form-item label="作者" prop="author_id" mode="inline" :required="true">
                    <lay-select v-model="formRow.author_id" placeholder="作者必选">
                        <lay-select-option v-for="(key,val) in statusOptions" :value="Number(val)" :label="key"></lay-select-option>
                    </lay-select>
                </lay-form-item> -->
                <lay-form-item label="列表排序" prop="sort" mode="inline" required>
                    <lay-input-number v-model="formRow.sort" ></lay-input-number>
                </lay-form-item>
                <lay-form-item label="热门排序" prop="hot_sort" mode="inline" required>
                    <lay-input-number v-model="formRow.hot_sort" ></lay-input-number>
                </lay-form-item>
                <lay-form-item label="推荐排序" prop="home_sort" mode="inline" required>
                    <lay-input-number v-model="formRow.home_sort" ></lay-input-number>
                </lay-form-item>
                <lay-form-item label="浏览数" prop="view" mode="inline" required>
                    <lay-input-number v-model="formRow.view" ></lay-input-number>
                </lay-form-item>
                <lay-form-item label="点赞数" prop="like" mode="inline" required>
                    <lay-input-number v-model="formRow.like" ></lay-input-number>
                </lay-form-item>
                <lay-form-item label="收藏数" prop="star" mode="inline" required>
                    <lay-input-number v-model="formRow.star" ></lay-input-number>
                </lay-form-item>
                <lay-form-item label="SEO关键词" prop="seo_keywords">
                    <lay-tag-input name="seo_keywords"  v-model="formRow.seo_keywords" v-model:inputValue="tempKeywords" :max="15"  placeholder="最多15个"></lay-tag-input>
                </lay-form-item>
                <lay-form-item label="SEO描述" prop="seo_description">
                    <lay-textarea name="seo_description" placeholder="最多200字" :maxlength="200" show-count v-model="formRow.seo_description"> </lay-textarea>
                </lay-form-item>
                <lay-form-item label="定时发布" mode="inline" :required="true">
                     <lay-date-picker v-if="formRow.status==1" type="datetime" v-model="formRow.at_time" placeholder="若为空立刻发布" allow-clear></lay-date-picker>
                     <lay-date-picker v-else disabled type="datetime" v-model="formRow.at_time" placeholder="若为空立刻发布" allow-clear></lay-date-picker>
                </lay-form-item>
                <lay-form-item label="状态" mode="inline" :required="true">
                    <lay-radio-group name="status" v-model="formRow.status">
                        <lay-radio-button v-for="(key,val) in statusOptions" :value="Number(val)" size="sm">{{ key }}</lay-radio-button>
                    </lay-radio-group>
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
<script lang="ts" setup>
import { ref, reactive,computed } from 'vue';
import { layer } from '@layui/layui-vue';
import { TableColumn } from '@layui/layui-vue/types/component/table/typing';
import { ArticleRow,ArticleRowEmpty,ArticleFindParam,ArticleCategoryOption,ArticleTagOption,VideoRow,VideoRowEmpty } from '@/types/article';
import { intIndex } from '@/types/common';
import { options,insert,update,select,remove } from '@/api/module/article';
import Markdown from '../component/markdown.vue';
import TagComponent from '../component/tagComponent.vue';
import VideoComponent from '../component/videoComponent.vue';
import dayjs from 'dayjs';

const replaceFields = ref({
	id: 'id',
	title: 'name',
	children: 'children'
})

const dataSource = ref<Array<ArticleRow>>([])
const CategoryOptions = ref<Array<ArticleCategoryOption>>([])
// CategoryOptions 递归处理函数：将非叶子节点设为禁用
const disableParentNodes = (nodes:Array<ArticleCategoryOption>):Array<ArticleCategoryOption> => {
  return nodes.map(node => {
    const newNode = { ...node };
    if (newNode.children && newNode.children.length > 0) {
      // 如果有子节点，则禁用当前节点
      newNode.disabled = true;
      // 继续递归处理子节点
      newNode.children = disableParentNodes(newNode.children);
    }
    return newNode;
  });
};
// CategoryOptions 使用计算属性处理数据
const processedCategoryOptions = computed(() => {
  return disableParentNodes(CategoryOptions.value);
});
const tagOptions = ref<Array<ArticleTagOption>>([])
const tagGroupOptions = ref<intIndex<string>>([])
const statusOptions = ref<intIndex<string>>({})
// const authorOptions = ref<intIndex<string>>({})
const loading = ref(false);
const page = reactive({ current: 1, limit: 30, total: 0 });
const params = ref<ArticleFindParam>({})
const columns = ref<TableColumn[]>([
  //{ title: '选项', width: '55px', type: 'checkbox', fixed: 'left',rowspan:1,key:"id" },
  { title: '编号', width: '10px', key: 'id',sort: 'desc', fixed: 'left', rowspan:0},
  { title: '标题', width: '160px', key: 'title',customSlot:'title', rowspan: 0 },
  { title: '分类', width: '60px', key: 'categories',customSlot:'categories', rowspan:0 },
  { title: '标签',width: '80px',key: 'tags',customSlot:'tags', rowspan:0 },
  { title: '关键词',width: '80px',key: 'seo_keywords',customSlot:'seo_keywords', rowspan:0 },
  { title: '状态', width: '5px',key: 'status', customSlot:'status',rowspan:0 },
  { title: '排序', width: '5px', key: 'sort',sort: 'desc' ,rowspan:0  },
  { title: '创建时间', width: '60px', key: 'created_at',customSlot:'created_at',sort: 'desc' ,rowspan:0  },
  { title: '修改时间',width: '60px', key: 'updated_at',customSlot:'updated_at',sort: 'desc' ,rowspan:0  },
  {
    title: '操作',
    width: '30px',
    customSlot: 'operator',
    key: 'operator',
    fixed: 'right',
    rowspan:0
  }
])
const resetParam = () => {
    params.value = {}
    loadDataSource()
}
const sortChange = (key:string, sort:keyof {asc:string,desc:string}) => {
    layer.msg(`字段${key} - 排序${sort}, 你可以利用 sort-change 实现服务端排序`)
    params.value[sort] = key
    loadDataSource()
}
const loadDataSource = async () => {
    params.value.page = page.current
    params.value.pageSize = page.limit
    const res = await select(params.value)
    if(res.errcode > 0){
        layer.msg("查询文章失败: " + res.message, { icon : 2, time: 3000})
        return ;
    }
    for(let i in res.data){
        res.data[i]['categories_id'] = res.data[i].categories.map((item: any)=> item.id)
        res.data[i]['tags_id'] = res.data[i].tags.map((item: any) => item.id)
        res.data[i]['videos_id'] = res.data[i].videos.map((item: any) => item.id)
    }
    dataSource.value = res.data
    Object.assign(page, res.extra);
    console.log(' loadDataSource : ', dataSource.value);
    // console.log(' loadDataSource page : ', page);
}
const loadOptionSource = async () => {
    const res = await options();
    if(res.errcode > 0){
        layer.msg("查询文章选项失败: " + res.message, { icon : 2, time: 3000})
        return ;
    }
    CategoryOptions.value = res.data.categories
    tagOptions.value = res.data.tags
    statusOptions.value = res.data.status
    tagGroupOptions.value = res.data.tag_groups
    // authorOptions.value = res.data.authors
}
loadDataSource()
loadOptionSource()


const visibleForm = ref(false)
const formTitle = ref('')
const formRow = ref<ArticleRow>(ArticleRowEmpty())
const tempKeywords = ref('')

const showForm = (title:string, row:ArticleRow|null) => {
    formTitle.value = title
    if(row){
        formRow.value = row
        if(row.status != 2 && row.created_at){
            formRow.value.at_time = dayjs(row.created_at * 1000).format('YYYY-MM-DD HH:mm:ss')
        }
    }
    visibleForm.value = true
}

const formSubmit = async () => {
    console.log('formSubmit : formRow : ', formRow.value);
    if (formRow.value.videos_id.length > 0 && formRow.value.videos_id.includes(0)){
        console.error(' videos 还有未保存的')
    }
    // return ;
    if(formRow.value.id > 0){
        const result = await update(formRow.value)
        if(result.errcode > 0){
            layer.msg("修改文章<"+formRow.value.title+">失败: " + result.message, { icon : 2, time: 3000})
            return ;
        }
        formRow.value = ArticleRowEmpty()
        visibleForm.value = false
        loadDataSource()
    }else{
        const result = await insert(formRow.value)
        if(result.errcode > 0){
            layer.msg("新增文章<"+formRow.value.title+">失败: " + result.message, { icon : 2, time: 3000})
            return ;
        }
        formRow.value = ArticleRowEmpty()
        visibleForm.value = false
        loadDataSource()
    }
}
const formCancel = () => {
    formRow.value = ArticleRowEmpty()
    visibleForm.value = false
    tagOptions.value.forEach(element => {
        element.checked = false
    });
}

const deleteSubmit = async(row:ArticleRow) => {
    const result = await remove({id:row.id})
    if(result.errcode > 0){
        layer.msg("删除文章<"+row.title+">失败: " + result.message, { icon : 2, time: 3000})
        return ;
    }
    layer.msg("删除文章<"+row.title+">成功: " , { icon : 1, time: 2000})
    row.status = 6;
    // dataSource.value = dataSource.value.filter(item => item.id !=row.id)
}

</script>
<style scoped>
/* 强制 tree-select 表现为行内块 */
:deep(.layui-table-tool .layui-tree-select) {
    display: inline-block !important;
    vertical-align: middle;
    width: 150px !important;
}

/* 确保内部输入框不撑开整行 */
:deep(.layui-table-tool .layui-tree-select .layui-input-title) {
    width: 100%;
}
</style>