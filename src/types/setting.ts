
export interface GroupWithSettingRow {
    id:number;
    title:string;
    data: SettingRow[]
}

export interface SettingRow {
    id:number;
    group:number | null;
    mode:number | null,
    sort:number;
    code:string;
    name:string;
    value:string ;
    remark:string;
    optional:{[key:string]:string};
    nullable:number;
}

export const SettingEmptyRow = ():SettingRow => {
    return {
        id:0,
        mode:null,
        group:null,
        sort:0,
        code:'',
        name:'',
        value:'',
        remark:'',
        nullable:1,
        optional:{},
    }
}

export interface SetRow{
    id:number;
    value:string;
    optional:number;
}

export const SetEmptyRow = ():SetRow => {
    return {
        id:0,
        value:'',
        optional:0,
    }
}
