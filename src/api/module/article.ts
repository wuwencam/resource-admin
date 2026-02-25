import Http from '../http';


export const insert = (data:any) => {
    return Http.post('/admin/article/insert', data)
}
export const options = () => {
    return Http.post('/admin/article/options')
}

export const update = (data:any) => {
    return Http.post('/admin/article/update', data)
}

export const select = (data:any) => {
    return Http.post('/admin/article/select', data)
}

export const remove = (data:any) => {
    return Http.post('/admin/article/delete', data)
}


export const insertVideo = (data:any) => {
    return Http.post('/admin/articleVideo/insert', data)
}

export const updateVideo = (data:any) => {
    return Http.post('/admin/articleVideo/update', data)
}

export const selectVideo = (data:any) => {
    return Http.post('/admin/articleVideo/select', data)
}

export const deleteVideo = (data:any) => {
    return Http.post('/admin/articleVideo/delete', data)
}



export const insertCategory = (data:any) => {
    return Http.post('/admin/articleCategory/insert', data)
}

export const updateCategory = (data:any) => {
    return Http.post('/admin/articleCategory/update', data)
}

export const selectCategory = () => {
    return Http.post('/admin/articleCategory/select')
}

export const deleteCategory = function (data:any) {
    return Http.post('/admin/articleCategory/delete',data)
}

export const insertTag = (data:any) => {
    return Http.post('/admin/articleTag/insert', data)
}

export const updateTag = (data:any) => {
    return Http.post('/admin/articleTag/update', data)
}

export const selectTag = (data:any) => {
    return Http.post('/admin/articleTag/select', data)
}

export const deleteTag = function (data:any) {
    return Http.post('/admin/articleTag/delete',data)
}