export interface AdminItemRow {
    id:number ;
    role_id:number ;
    status:number;
    inviter?:number;
    username:string;
    nickname:string;
    opt_token?:string;
    last_login?:number;
    password?:string;
    password_confirm?:string;
}

export const AdminItemRowEmpty = () : AdminItemRow => {
    return {
        id: 0,
        role_id:0,
        status:0,
        inviter:0,
        username:'',
        nickname:'',
        password:'',
        password_confirm:'',
    }
}


export interface AdminResetPasswordRow {
    id:number;
    password:string;
    password_confirm:string;
}

export interface AdminRoleRow {
    id:number;
    name:string;
    remark:string;
}

export const AdminRoleEmptyRow = ():AdminRoleRow => {
    return {
        id:0,
        name:'',
        remark:'',
    }
}

export interface AdminSetRoleActionsRow {
    role_ids:Array<number>;
    action_ids:Array<number>;
}

export interface AdminActionRow {
    id:number;
    pid:number;
    sort:number;
    mode:number;
    title:string;
    icon:string;
    value:string;
    children?: Array<AdminActionRow>;
}

export const AdminActionEmptyRow = ():AdminActionRow => {
    return {
        id:0,
        pid:0,        
        sort:0,
        mode:0,
        title:'',
        icon:'',
        value:'',
    }
}