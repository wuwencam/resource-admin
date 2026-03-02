
export interface AppRow{
    id:number
    app_key:string
    status:number
    name:string
    directory:string
}

export const AppRowEmpty = ():AppRow => {
    return {
        id:0,
        app_key:'',
        status:1,
        name:'',
        directory:''
    }
}

export interface AppSceneParam{
    app_key?:string
    scene_key?:string
    mode?:number
    max_size?:number
    quality?:number
}

export interface AppSceneRow {
    id:number
    app_key :string
    scene_key  :string
    name  :string
    remark  :string
    mode :number
    size :number
    max_size :number
    allow_mime  :string[]
    width :number
    height :number
    min_width :number
    min_height :number
    max_width :number
    max_height :number
    scale_width :number
    scale_height :number
    quality :number
    force_webp :number
}
export const AppSceneRowEmpty = ():AppSceneRow => {
    return {
        id:0,
        app_key:'', 
        scene_key : '',
        name : '',
        remark : '',
        mode : 1,
        size : 1,
        max_size : 2097152, // 2M
        allow_mime : [],
        width : 0, 
        height :0,
        min_width :0,
        min_height :0,
        max_width :0,
        max_height :0,
        scale_width :0,
        scale_height :0,
        quality :80,
        force_webp : 1
    }
}