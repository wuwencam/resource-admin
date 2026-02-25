import Http from '../http';

export const insertSetting = (data:any) => {
    return Http.post('/admin/setting/insert', data)
}

export const updateSetting = (data:any) => {
    return Http.post('/admin/setting/update', data)
}

export const deleteSetting = (id:number) => {
    return Http.post('/admin/setting/delete', {id:id})
}

export const settingValue = (id:number,value:string,nullable:number) => {
    return Http.post('/admin/setting/setValue', {id:id,value:value,nullable:nullable})
}

export const selectSetting = () => {
    return Http.post('/admin/setting/select')
}
