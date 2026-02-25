export interface ArticleCategoryOption {
    id:number
    pid:number
    name:string
    children?:ArticleCategoryOption[]
    disabled?:boolean
}
export interface ArticleTagOption {
    id:number
    name:string
    group:Array<number>
    use_times:number
    checked?:boolean
}

export interface ArticleFindParam {
    id?:number
    cid?:number
    status?:number 
    author_id?:number
    asc?:string
    desc?:string
    tag_id?:number 
    video_id?:number 
    keyword?:string
    page?:number
    pageSize?:number
}

export interface ArticleRow {
    id:number
    sort:number
    status:number
    cover:string
    title:string
    content:string
    seo_keywords:string[]
    seo_description:string

    author_id:number
    hot_sort:number
    home_sort:number
    view:number
    like:number
    star:number

    at_time:string
    created_at?:number
    updated_at?:number

    categories_id:number[]
    categories?:CategoryRow[],
    tags_id:number[]
    tags?:TagRow[],
    videos_id:number[]
    videos?: VideoRow[]
}

export const ArticleRowEmpty = ():ArticleRow => {
    return {
        id:0,
        sort:0,
        status:2,
        cover:'',
        title:'',
        content:'',
        seo_keywords:[],
        seo_description:'',

        author_id:0,
        hot_sort:0,
        home_sort:0,
        view:0,
        like:0,
        star:0,

        at_time:'',

        categories_id:[],
        tags_id:[],
        videos_id:[],
    }
}

export interface VideoRow {
    id:number
    name:string
    cover:string
    video:string
    description:string
}

export const VideoRowEmpty = ():VideoRow => {
    return {
        id:0,
        name:'',
        cover:'',
        video:'',
        description:''
    }
}


export interface CategoryRow {
    id:number
    pid:number
    sort:number
    status:number
    name:string
    seo_title:string
    seo_keywords:string[]
    seo_description:string
    children?:CategoryRow[]
}

export const CategoryRowEmpty = ():CategoryRow => {
    return {
        id:0,
        pid:0,
        sort:0,
        status:1,
        name:'',
        seo_title:'',
        seo_keywords:[],
        seo_description:''
    }
}

export interface TagRow{
    id:number
    name:string
    sort:number
    hot_sort:number
    group:Array<number>
    status:number
    use_times:number
    seo_title:string
    seo_keywords:string[]
    seo_description:string
}

export const TagRowEmpty = () => {
    return {
        id:0,
        name:'',
        sort:0,
        hot_sort:0,
        group:[],
        status:1,
        use_times:0,
        seo_title:'',
        seo_keywords:[],
        seo_description:''
    }
}

export interface TagFindParam {
    name:string|undefined,
    id:number|undefined,
    is_hot:number|undefined,
    status:number|undefined,
}