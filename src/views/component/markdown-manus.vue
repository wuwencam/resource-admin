<template>
  <div class="editor-container">
    <MdEditor
      v-model="text"
      :config="editorConfig"
      @onUploadImg="onUploadImg"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { MdEditor, config } from 'md-editor-v3';
import 'md-editor-v3/lib/style.css';

const text = ref(`![图片说明](img.jpg#800*450)

\`\`\`compare
title: 章节副标题仅一行
desc: 第*一行*内容
内容**可以**多行
imgTitle: 图片描述仅一行
images:
![图片说明](img.jpg#800*450)
![图片说明](img.jpg#800*450)
\`\`\``);

/**
 * 1. 自定义渲染配置
 * md-editor-v3 使用 markdown-it 作为解析引擎
 */
config({
  markdownItConfig(md) {
    // --- 处理图片格式 ---
    const defaultImageRender = md.renderer.rules.image;
    md.renderer.rules.image = (tokens, idx, options, env, self) => {
      const token = tokens[idx];
      let src = token.attrGet('src') || '';
      
      // 解析 #800*450
      if (src.includes('#')) {
        const [realSrc, fragment] = src.split('#');
        const match = fragment.match(/^(\d+)\*(\d+)$/);
        if (match) {
          token.attrSet('src', realSrc);
          token.attrSet('width', match[1]);
          token.attrSet('height', match[2]);
        }
      }
      
      // 添加 lazy loading 和 async decoding
      token.attrSet('loading', 'lazy');
      token.attrSet('decoding', 'async');
      
      return defaultImageRender(tokens, idx, options, env, self);
    };

    // --- 处理 compare 代码块 ---
    const defaultFenceRender = md.renderer.rules.fence;
    md.renderer.rules.fence = (tokens, idx, options, env, self) => {
      const token = tokens[idx];
      if (token.info.trim() === 'compare') {
        const content = token.content.trim();
        const lines = content.split('\n');
        
        const data = { title: '', desc: '', imgTitle: '', images: [] };
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
        descHtml = descHtml.replace(/\n/g, '<br>');

        // 渲染图片组
        const imagesHtml = data.images.map(imgMd => md.renderInline(imgMd)).join('');

        return `
          <section class="seo-compare-section">
            <h2 class="compare-title">${md.utils.escapeHtml(data.title)}</h2>
            <p class="compare-desc">${descHtml}</p>
            <figure>
              <div class="comparison-grid">${imagesHtml}</div>
              <figcaption>${md.utils.escapeHtml(data.imgTitle)}</figcaption>
            </figure>
          </section>
        `;
      }
      return defaultFenceRender(tokens, idx, options, env, self);
    };
  }
});

/**
 * 2. 处理图片上传
 * 上传后将结果格式化为 ![alt](url#width*height)
 */
const onUploadImg = async (files, callback) => {
  const res = await Promise.all(
    files.map((file) => {
      return new Promise((resolve) => {
        // 模拟上传接口
        // 在实际应用中，您需要调用后端接口并获取图片的真实宽高
        // 这里假设后端返回了 url, width, height
        setTimeout(() => {
          const mockUrl = 'https://example.com/img.jpg';
          const mockWidth = 800;
          const mockHeight = 450;
          
          // 关键：按照要求的格式返回
          resolve({
            url: `${mockUrl}#${mockWidth}*${mockHeight}`,
            alt: file.name,
            title: file.name
          });
        }, 1000);
      });
    })
  );

  callback(res.map(item => item.url));
};
</script>

<style>
/* 建议在全局或组件内添加样式以匹配您的设计 */
.seo-compare-section {
  margin: 2em 0;
  border: 1px solid #eee;
  padding: 1.5em;
  border-radius: 8px;
}
.compare-title {
  font-size: 1.5em;
  margin-bottom: 0.5em;
}
.compare-desc {
  color: #666;
  line-height: 1.6;
}
.comparison-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin: 1em 0;
}
.comparison-grid img {
  width: 100%;
  height: auto;
  border-radius: 4px;
}
</style>
