<template>
          <!--NormalToolbar 普通按钮，点击直接执行操作-->
        <!--DropdownToolbar: 下拉菜单按钮-->
        <!--ModalToolbar: 点击弹出一个模态框（比如让你填写对比块的标题）-->
        <!-- ⚠️ toolbars 中的0 代表自定义的第一个 项 -->
    <MdEditor
      :model-value="modelValue"
      @update:model-value="onUpdate"
      :toolbars="toolbars"
      @on-upload-img="onUploadImg"
      :id="editorId"
      ref="editorRef"
     @onHtmlChanged="htmlChangedhandler"
    >       <!--        :transformImgUrl="transformImgUrl"   @onRemount="htmlChangedhandler"  @onHtmlChanged="htmlChangedhandler" -->
      <template #defToolbars>
        <NormalToolbar title="插入图文块" @onClick="handleInsertCompare">
          <template #trigger>
            <div style="width: 20px; height: 20px; display: flex; align-items: center; justify-content: center;">
              <svg width="20" height="20" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 24V12H13V10C13 6.68629 15.6863 4 19 4C22.3137 4 25 6.68629 25 10V12H34V24H38C41.3137 24 44 26.6863 44 30C44 33.3137 41.3137 36 38 36H34V44H4V36H8C11.3137 36 14 33.3137 14 30C14 26.6863 11.3137 24 8 24H4Z" fill="none" stroke="#333" stroke-width="4" stroke-linejoin="round"/></svg>
            </div>
          </template>
        </NormalToolbar>
      </template>
    </MdEditor>
    <!--  :md-heading-id="generateId" @on-html-changed="handleHtmlChanged" -->
</template>

<script setup lang="ts">
import { ref,nextTick,onMounted } from 'vue';
import axios from 'axios';
import { MdEditor,config,UploadImgCallBack,ToolbarNames,NormalToolbar } from 'md-editor-v3';
import 'md-editor-v3/lib/style.css';
// import container from 'markdown-it-container';
import type MarkdownIt from 'markdown-it';
// import Renderer from 'markdown-it/lib/renderer.mjs';
import { decryptImage } from '@/library/decryptImage';
import { getAssetsUrl } from '@/library/common';
import { layer } from '@layui/layui-vue';

const ImageHost = import.meta.env.VITE_IMAGE_HOST

const editorId = 'md-editor-v-100';

const editorRef = ref()
onMounted(() => {
  // console.log(editorRef.value)
// 监听预览状态切换
  editorRef.value?.on('preview', (status:any) => {
    if (status) {
      // console.log('预览模式已开启');
      nextTick(async () => {
        htmlChangedhandler('')
      })
      // 开启预览时，可能需要重新触发一次解密
    }else{
      // console.log('预览模式已关闭');
    }
  });
})

const props = defineProps(['modelValue']);
const emit = defineEmits(['update:modelValue']);
// 2. 更新内容回父组件
const onUpdate = (val:string) => {
  emit('update:modelValue', val);
};

const toolbars:ToolbarNames[] = [
  'bold',

  // 'underline',
  'italic',
  '-',
  'title',
  // 'strikeThrough',
  // 'sub',
  // 'sup',
  // 'quote',
  // 'unorderedList',
  // 'orderedList',
  // 'task',
  // '-',
  // 'codeRow',
  // 'code',
  'link',
  'image',
  // 'table',
  // 'mermaid',
  // 'katex',
  // '-',
      0,
  'revoke',
  'next',
  // 'save',

  '=',
  'pageFullscreen',
  'fullscreen',
  'preview',
  'previewOnly',
  'htmlPreview',
  'catalog',
  // 'github',
];

config({
  markdownItConfig(md: MarkdownIt) {
    // --- 处理图片格式 ---
    const defaultImageRender = md.renderer.rules.image || 
      ((tokens, idx, options, env, self) =>  { 
        return  self.renderToken(tokens, idx, options) 
      });

    md.renderer.rules.image = (tokens, idx, options, env, self) => {
      const token = tokens[idx];
      let src = token.attrGet('src') || '';
      // 解析 #800*450
      if (src.includes('#')) {
        const [realSrc, fragment] = src.split('#');
        const match = fragment.match(/^(\d+)\*(\d+)$/);
        if (match) {
          token.attrSet('src', getAssetsUrl('/logo.png'));
          token.attrSet('lazy-crypto-src',realSrc);
          token.attrSet('width', match[1]);
          token.attrSet('height', match[2]);
        }
      }
      // 不能用
      // const imgPath = token.attrGet('src')
      // if(!imgPath) {
      //   decryptImage(ImageHost + imgPath)
      // }
      
      // 添加 lazy loading 和 async decoding
      token.attrSet('loading', 'lazy');
      token.attrSet('decoding', 'async');
      
      return defaultImageRender(tokens, idx, options, env, self);
    };

    /*

    💡💡 开始定义解析器

    ```compare
    title: 第一个核心小标题
    desc: 详细技术细节描述详细技术细节描述详细技
    详细技术细节描述详细技术细节描述详细技术细节描述详细技术细节描述详细技术细节描述术细节描述详细技术细节描述详细技术细节描述...
    images:
      ![第一个图片](img.jpg#800*450)
      ![第二个图片](img.jpg#800*450)
    imgTitle: 图片描述图片描述
    ```
    */

    // 1. 定义解析插件
    md.block.ruler.before('fence', 'compare_block', (state, startLine, endLine, silent) => {
      let pos = state.bMarks[startLine] + state.tShift[startLine];
      let max = state.eMarks[startLine];

      // 检查开头是否为 ```compare
      const marker = state.src.slice(pos, pos + 10).trim();
      if (marker !== '```compare') return false;

      if (silent) return true;

      // 寻找结尾 ```
      let nextLine = startLine;
      let hasEnd = false;
      while (nextLine < endLine) {
        nextLine++;
        pos = state.bMarks[nextLine] + state.tShift[nextLine];
        max = state.eMarks[nextLine];
        if (state.src.slice(pos, max).trim() === '```') {
          hasEnd = true;
          break;
        }
      }

      // 提取内容
      const content = state.getLines(startLine + 1, nextLine, 0, false);

      // 创建一个自定义类型的 Token，避开 'fence' 这个名字
      const token = state.push('compare_custom', 'div', 0);
      token.content = content;
      token.markup = '```compare';
      token.map = [startLine, nextLine];

      state.line = nextLine + 1;
      return true;
    });

    // 2. 定义这个自定义 Token 的渲染函数
    md.renderer.rules.compare_custom = (tokens, idx) => {
      const content = tokens[idx].content.trim();
      const lines = content.split('\n');
        
      const data:{[key:string]:any} = { title: '', desc: '', imgTitle: '', images: [] };
      let currentKey = '';

      lines.forEach(line => {
        const match = line.match(/^(title|desc|imgTitle|images):(.*)$/i);
        if (match) {
          currentKey = match[1].toLowerCase();
          const val = match[2].trim();
          if (currentKey !== 'images') data[currentKey] = val;
        } else if (currentKey) {
          if (currentKey === 'images') {
            if (line.trim()) data.images.push(line.trim());
          } else {
            data[currentKey] += (data[currentKey] ? '\n' : '') + line;
          }
        }
      });

      // 渲染 desc (Markdown)
      let descHtml = md.renderInline(data.desc);
      // console.log('descHtml : ',descHtml)
      descHtml = descHtml.replace(/\n/g, '');

      // 渲染图片组
      const imagesHtml = data.images.map((imgMd:string) => md.renderInline(imgMd)).join('');

      return `
        <section class="seo-compare-section">
          <h2 class="compare-title">${md.utils.escapeHtml(data.title)}</h2>
          <p class="compare-desc">${descHtml}</p>
          <figure>
            <figcaption>${md.utils.escapeHtml(data.imgtitle)}</figcaption>
            <div class="comparison-grid">${imagesHtml}</div>
          </figure>
        </section>
      `;

    };
    /////////。 💡💡 END 定义解析器

  }
});

const onUploadImg = async(files: Array<File>, callBack: UploadImgCallBack):Promise<void> => {
  // const res = await Promise.all(
  //   files.map((file) => {
  //     return new Promise((resolve) => {
  //       // 模拟上传接口
  //       // 在实际应用中，您需要调用后端接口并获取图片的真实宽高
  //       // 这里假设后端返回了 url, width, height
  //       setTimeout(() => {
  //         const mockUrl = 'https://example.com/img.jpg';
  //         const mockWidth = 800;
  //         const mockHeight = 450;
          
  //         // 关键：按照要求的格式返回
  //         resolve({
  //           url: `${mockUrl}#${mockWidth}*${mockHeight}`,
  //           alt: file.name,
  //           title: file.name
  //         });
  //       }, 1000);
  //     });
  //   })
  // );

  // callBack(res.map(item => item.url));

  // imgs.forEach(img => {
    // 手动向光标处插入内容
    editorRef.value?.insert(() => {
      return {
        targetValue: `![图片alt](uploadedUrl.jpg#100*200)`,
        select: false,
        deviationStart: 0,
        deviationEnd: 0
      };
    });
  // });

};

// const transformImgUrl = async (url:string) => {
//   console.log('transformImgUrl : ', url)
//   return await decryptImage(ImageHost+url);
// };

const cacheDecryptUrl:Record<string, string> = {};
const htmlChangedhandler = async (html: string) => {
  // 无nextTick 不可行。 获取到的内容是上一个
  nextTick(async () => {
    const previewContainer = document.getElementById(editorId+'-preview');
    if (!previewContainer){
      console.log('没有预览内容？');
      return;
    } 
    const imgs = previewContainer.querySelectorAll('img');
    // console.log(imgs)
    imgs.forEach(async (img) => {
      const imgUrl = img.getAttribute('lazy-crypto-src');
      if(imgUrl){
        try{
          if(!cacheDecryptUrl[imgUrl]){
            cacheDecryptUrl[imgUrl] = getAssetsUrl('/logo.png');
            console.log('解密图片: ', imgUrl);
            cacheDecryptUrl[imgUrl] =  await decryptImage(ImageHost+imgUrl)
          }
          img.setAttribute('src', cacheDecryptUrl[imgUrl]  );
        }catch(err){
          layer.msg('解密图片失败 请检查路径是否正确', { icon: 3, time: 2000 });
        }
      }
    })
  })
}

// 2. 自定义菜单 插入逻辑
const handleInsertCompare = () => {
  const template = `

\`\`\`compare
title: 章节副标题仅一行
desc: 第一行内容
内容可以多行
imgTitle: 图片描述仅一行
images:
![图片说明](img.jpg#800*450)
![图片说明](img.jpg#800*450)
\`\`\` 
`;
  
  // 使用实例方法插入，这样不会破坏撤销记录（Ctrl+Z）
  editorRef.value?.insert(() => {
    return {
      targetValue: template,
      select: true, // 插入后选中内容，方便用户直接修改
      deviationStart: 0,
      deviationEnd: 0
    };
  });
};

</script>
<style lang="css" scoped>
.comparison-grid {
  display: grid;
  /* 自动根据宽度排列，每张图最小 300px，最大平分空间 */
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
  margin: 1.5rem 0;
}

.comparison-grid img {
  width: 100%;
  height: auto;
  object-fit: cover;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  transition: transform 0.3s ease;
}

.comparison-grid img:hover {
  transform: scale(1.02);
}

.compare-title {
  border-left: 4px solid #009688; /* Layui 风格的绿 */
  padding-left: 15px;
  margin-bottom: 10px;
}
</style>