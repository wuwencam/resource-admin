import Http from '../http';


export const insert = (data:any) => {
    return Http.post('/admin/app/insert', data)
}

export const update = (data:any) => {
    return Http.post('/admin/app/update', data)
}

export const select = () => {
    return Http.post('/admin/app/select')
}

export const remove = (data:any) => {
    return Http.post('/admin/app/remove', data)
}


export const sceneInsert = (data:any) => {
    return Http.post('/admin/appScene/insert', data)
}

export const sceneUpdate = (data:any) => {
    return Http.post('/admin/appScene/update', data)
}

export const sceneSelect = (data:any) => {
    return Http.post('/admin/appScene/select', data)
}

export const sceneRemove = (data:any) => {
    return Http.post('/admin/appScene/remove', data)
}

