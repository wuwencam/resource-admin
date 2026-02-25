
export interface PageRow{
    id:number,
    group:number,
    sort:number,
    status:number,
    name:string,
    content:string,
    seo_title:string,
    seo_keywords:string[],
    seo_description:string,
    created_at?:number,
    updated_at?:number,
}

export const PageRowEmpty = () => {
    return {
        id:0,
        group:0,
        sort:0,
        status:1,
        name:'',
        content:`
包含尽量多关键词的描述(可与SEO描述相同)

\`\`\`compare
title: 章节副标题仅一行
desc: 第一行内容
内容可以多行
imgTitle: 图片描述仅一行
images:
![图片说明](/image/e7c/c45/f444bbeec9216d00744ac6d140a8ac16ac2dc3d7610e40e4a4a52935b7.jpg#800*450)
![图片说明](/image/a70/a19/277b483b86321dbdb8bc997a963205a8aba9d9b74b96e7cc3c1f6b6e62.jpg#800*450)
\`\`\` 

        `,
        seo_title:'',
        seo_keywords:['xxx','yyy'],
        seo_description:'',
    }
}

export interface PageSearchParam {
    group: undefined | number,
    name: undefined | string,
}

export const PageSearchParamDefault = () => {
    return {
        group:undefined,
        name:undefined,
    }
}