import BasicLayout from '../../layouts/BasicLayout.vue';
import Login from '../../views/common/login.vue';


export default [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/login',
    component: Login,
    meta: { title: '登录页面' },
  },
  {
    path: '/common',
    component: BasicLayout,
    meta: { title: '其他' },
    children : [
        {
          path: '/dashboard',
          component: () => import('../../views/common/dashboard.vue'),
          meta: { title: '仪表盘',requireAuth: true,affix: true, closable: false },
        },
        {
          path: '/setting',
          component: () => import('../../views/common/setting.vue'),
          meta: { title: '系统设置',requireAuth: true },
        },
        {
          path: '/page',
          component: () => import('../../views/common/page.vue'),
          meta: { title: '单页面',requireAuth: true },
        },
    ]
  },
  {
      path: '/admin',
      component: BasicLayout,
      meta: { title: '管理员',requireAuth: true },
      children: [
        {
          path: '/admin/items',
          component: () => import('../../views/admin/items.vue'),
          meta: { title: '管理员', requireAuth: true },
        },
        {
          path: '/admin/role',
          component: () => import('../../views/admin/role.vue'),
          meta: { title: '角色', requireAuth: true },
        },
        {
          path: '/admin/action',
          component: () => import('../../views/admin/action.vue'),
          meta: { title: '菜单', requireAuth: true },
        }
      ]
    },
    {
      path: '/article',
      component: BasicLayout,
      meta: { title: '文章管理',requireAuth: true },
      children: [
        {
          path: '/article/items',
          component: () => import('../../views/article/article.vue'),
          meta: { title: '文章列表', requireAuth: true },
        },
        {
          path: '/article/category',
          component: () => import('../../views/article/category.vue'),
          meta: { title: '文章分类', requireAuth: true },
        },
        {
          path: '/article/tags',
          component: () => import('../../views/article/tags.vue'),
          meta: { title: '文章标签', requireAuth: true },
        },
        {
          path: '/article/video',
          component: () => import('../../views/article/video.vue'),
          meta: { title: '视频列表', requireAuth: true },
        }
      ]
    },








  {
    path: '/workspace',
    redirect: '/workspace/workbench',
    component: BasicLayout,
    meta: { title: '工作空间' },
    children: [
      {
        path: '/workspace/workbench',
        name: 'Workbench',
        component: () => import('../../views/workSpace/workbench/index.vue'),
        meta: { title: '工作台', requireAuth: true, affix: true, closable: false },
      },
      {
        path: '/workspace/console',
        component: () => import('../../views/workSpace/console/index.vue'),
        meta: { title: '控制台', requireAuth: true },
      },
      {
        path: '/workspace/analysis',
        component: () => import('../../views/workSpace/analysis/index.vue'),
        meta: { title: '分析页', requireAuth: true },
      },
      {
        path: '/workspace/monitor',
        component: () => import('../../views/workSpace/monitor/index.vue'),
        meta: { title: '监控页', requireAuth: true },
      }
    ]
  }, {
    path: '/error',
    component: BasicLayout,
    meta: { title: '错误页面' },
    children: [
      {
        path: '/error/401',
        component: () => import('../../views/error/401.vue'),
        meta: { title: '401' },
      },
      {
        path: '/error/403',
        component: () => import('../../views/error/403.vue'),
        meta: { title: '403' },
      },
      {
        path: '/error/404',
        component: () => import('../../views/error/404.vue'),
        meta: { title: '404' },
      },
      {
        path: '/error/500',
        component: () => import('../../views/error/500.vue'),
        meta: { title: '500' },
      }
    ]
  }, {
    path: '/system',
    component: BasicLayout,
    meta: { title: '系统管理' },
    children: [
      {
        path: '/system/user',
        component: () => import('../../views/system/user/index.vue'),
        meta: { title: '用户管理', requireAuth: true },
      },
      {
        path: '/system/role',
        component: () => import('../../views/system/role/index.vue'),
        meta: { title: '角色管理', requireAuth: true },
      },
      {
        path: '/system/menu',
        component: () => import('../../views/system/menu/index.vue'),
        meta: { title: '菜单管理', requireAuth: true },
      },
      {
        path: '/system/organization',
        component: () => import('../../views/system/organization/index.vue'),
        meta: { title: '机构管理', requireAuth: true },
      },
      {
        path: '/system/dictionary',
        component: () => import('../../views/system/dictionary/index.vue'),
        meta: { title: '字典管理', requireAuth: true },
      },
      {
        path: '/system/file',
        component: () => import('../../views/system/file/index.vue'),
        meta: { title: '文件管理', requireAuth: true },
      },
      {
        path: '/system/login',
        component: () => import('../../views/system/login/index.vue'),
        meta: { title: '登录日志', requireAuth: true },
      },
      {
        path: '/system/option',
        component: () => import('../../views/system/option/index.vue'),
        meta: { title: '操作日志', requireAuth: true },
      },
    ]
  }, {
    path: '/result',
    component: BasicLayout,
    meta: { title: '错误页面' },
    children: [
      {
        path: '/result/success',
        component: () => import('../../views/result/success.vue'),
        meta: { title: '成功页面', requireAuth: true },
      },
      {
        path: '/result/failure',
        component: () => import('../../views/result/failure.vue'),
        meta: { title: '失败页面', requireAuth: true },
      },
    ]
  }, {
    path: '/list',
    component: BasicLayout,
    meta: { title: '列表页面' },
    children: [
      {
        path: '/table/base',
        component: () => import('../../views/table/base.vue'),
        meta: { title: '查询列表', requireAuth: true },
      },
      {
        path: '/table/card',
        component: () => import('../../views/table/card.vue'),
        meta: { title: '卡片列表', requireAuth: true },
      },
      {
        path: '/table/project',
        component: () => import('../../views/table/project.vue'),
        meta: { title: '项目列表', requireAuth: true },
      },
      {
        path: '/table/article',
        component: () => import('../../views/table/article.vue'),
        meta: { title: '文章列表', requireAuth: true },
      }
    ]
  }, {
    path: '/form',
    component: BasicLayout,
    meta: { title: '表单页面' },
    children: [
      {
        path: '/form/base',
        component: () => import('../../views/form/base.vue'),
        meta: { title: '基础表单', requireAuth: true },
      },
      {
        path: '/form/step',
        component: () => import('../../views/form/step.vue'),
        meta: { title: '分步表单', requireAuth: true },
      },
      {
        path: '/form/intricate',
        name: 'Intricate',
        component: () => import('../../views/form/intricate.vue'),
        meta: { title: '复杂表单', requireAuth: true },
      },
      {
        path: '/form/step',
        name: 'Step',
        component: () => import('../../views/form/step.vue'),
        meta: { title: '分步表单', requireAuth: true },
      },
    ]
  }, {
    path: '/directive',
    component: BasicLayout,
    meta: { title: '内置指令' },
    children: [
      {
        path: '/directive/permission',
        component: () => import('../../views/directive/permission.vue'),
        meta: { title: '权限指令', requireAuth: true },
      },
    ]
  }, {
    path: '/component',
    component: BasicLayout,
    meta: { title: '常用组件' },
    children: [
      {
        path: '/component/qrcode',
        component: () => import('../../views/component/qrcode.vue'),
        meta: { title: '二维码', requireAuth: true },
      },
      {
        path: '/component/barcode',
        component: () => import('../../views/component/barcode.vue'),
        meta: { title: '条形码', requireAuth: true },
      },
      {
        path: '/component/treeSelect',
        component: () => import('../../views/component/treeSelect.vue'),
        meta: { title: '下拉树', requireAuth: true },
      },
    ]
  }, {
    path: '/enrollee',
    component: BasicLayout,
    meta: { title: '个人中心' },
    children: [
      {
        path: '/enrollee/profile',
        component: () => import('../../views/enrollee/profile/index.vue'),
        meta: { title: '我的资料', requireAuth: true },
      },
      {
        path: '/enrollee/message',
        component: () => import('../../views/enrollee/message/index.vue'),
        meta: { title: '我的消息', requireAuth: true },
      },

    ]
  },


]
