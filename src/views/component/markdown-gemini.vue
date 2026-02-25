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
      ref="editorRef"
    >

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
import { ref } from 'vue';
import axios from 'axios';
import { MdEditor,config,UploadImgCallBack,ToolbarNames,NormalToolbar } from 'md-editor-v3';
import 'md-editor-v3/lib/style.css';
// import container from 'markdown-it-container';
import type MarkdownIt from 'markdown-it';
// import Renderer from 'markdown-it/lib/renderer.mjs';

const editorRef = ref()
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
    // --- 1. 增强型图片渲染规则 (解决普通正文图片宽高) ---
    const defaultImageRender = md.renderer.rules.image || 
      ((tokens, idx, options, env, self) => self.renderToken(tokens, idx, options));

    md.renderer.rules.image = (tokens, idx, options, env, self) => {
      const token = tokens[idx];
      const src = token.attrGet('src') || '';
      const alt = token.content || '';
      // // 1. 提取宽高：url#800*450
      // let width = '';
      // let height = '';
      // const sizeMatch = src.match(/#(\d+)\*(\d+)$/);
      
      // let finalSrc = src;
      // if (sizeMatch) {
      //   width = sizeMatch[1];
      //   height = sizeMatch[2];
      //   finalSrc = src.replace(sizeMatch[0], ''); // 移除后缀
      // }

      // // 2. 构造干净的 img 标签
      // // 注意：这里去掉了编辑器可能自动添加的 md-zoom 类，除非你需要它
      // const imgHtml = `<img src="${finalSrc}" 
      //                       alt="${alt}" 
      //                       ${width ? `width="${width}"` : ''} 
      //                       ${height ? `height="${height}"` : ''} 
      //                       loading="lazy" 
      //                       decoding="async">`;
      // // 3. 决定是否包裹 figure
      // // 如果你希望所有图片都不要外层的 figure，直接返回 imgHtml
      // // 如果你希望只有在某些条件下才加，可以在这里判断
      // return imgHtml;
        /*

        为了支持 Markdown 的原生特性：当图片独占一行时，将其视为一个图表块（Figure
        在 markdown-it 的生态中，如果一张图片前后的 Token 是分段（paragraph）或者特定的块级标记，解析器会将其提升为块级元素。
        */
              // 正则匹配 url#800*450
              const sizeMatch = src.match(/#(\d+)\*(\d+)$/);
              if (sizeMatch) {
                const [fullHash, w, h] = sizeMatch;
                token.attrSet('width', w);
                token.attrSet('height', h);
                token.attrSet('src', src.replace(fullHash, '')); // 移除后缀防止404
              }
              
              // SEO 增强
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
      const lines = content.split('\n').map(l => l.trim());

      let title = '';
      let imgTitle = '';
      const descRawLines: string[] = [];
      const imageListHtml: string[] = [];

      lines.forEach((line) => {
        if (line.startsWith('title:')) {
          title = line.replace('title:', '').trim();
        } else if (line.startsWith('imgTitle:')) {
          imgTitle = line.replace('imgTitle:', '').trim();
        } else if (line.startsWith('![')) {
          const imgRegex = /!\[(.*?)\]\((.*?)#(\d+)\*(\d+)\)/;
          const match = line.match(imgRegex);
          if (match) {
            const [_, alt, url, w, h] = match;
            imageListHtml.push(
              `<img src="${url}" width="${w}" height="${h}" alt="${alt}" loading="lazy" decoding="async">`
            );
          }
        }else if(line.startsWith('desc:')) {
          descRawLines.push(line.replace('desc:', '').trim());
        }
        else if (line.length > 0 && !line.startsWith('images:')) {
          descRawLines.push(line);
        }
      });
// --- 关键点：调用 md.renderInline 解析 Markdown ---
      const fullDescRaw = descRawLines.join('\n');
      const renderedDesc = md.renderInline(fullDescRaw); 
      // ----------------------------------------------
      return `
        <section class="seo-compare-section">
          ${title ? `<h2 class="compare-title">${title}</h2>` : ''}
          ${renderedDesc ? `<p class="compare-desc">${renderedDesc.replace(/\n/g, '<br>')}</p>` : ''}
          <figure>
            <div class="comparison-grid">${imageListHtml.join('')}</div>
            ${imgTitle ? `<figcaption>${imgTitle}</figcaption>` : ''}
          </figure>
        </section>`;
    };

    /////////。 💡💡 END 定义解析器

  }
});

const onUploadImg = async(files: Array<File>, callBack: UploadImgCallBack):Promise<void> => {
  // const res = await Promise.all(
  //   files.map((file) => {
  //     return new Promise((rev, rej) => {
  //       const form = new FormData();
  //       form.append('file', file);

  //       axios
  //         .post('/api/img/upload', form, {
  //           headers: {
  //             'Content-Type': 'multipart/form-data',
  //           },
  //         })
  //         .then((res) => rev(res))
  //         .catch((error) => rej(error));
  //     });
  //   })
  // );
  // const urlWithSizes = `${uploadedUrl}#${img.width}*${img.height}`;
  // const urlWithSizes = `uploadedUrl.jpg#100*200`;
  // callBack([urlWithSizes]);
  // callBack(res.map((item) => item.data.url));

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