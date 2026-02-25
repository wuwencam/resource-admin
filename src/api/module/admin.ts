import Http from '../http';

export const login = function(loginForm: any) {
    return Http.post('/admin/common/login', loginForm)
}

export const menu = function() {
    return Http.get('/admin/admin/menu')
}

export const permission = function() {
    return Http.get('/admin/admin/permission')
}

export const resetPassword = function () {
    return Http.post('/admin/admin/resetPassword')
}

export const insertAdmin = function (data:any) {
    return Http.post('/admin/admin/insert',data)
}

export const updateAdmin = function (data:any) {
    return Http.post('/admin/admin/update',data)
}

export const selectAdmin = function (param:any) {
    return Http.post('/admin/admin/select',param)
}

export const deleteAdmin = function (id:number) {
    return Http.post('/admin/admin/delete',{id:id})
}

export const insertRole = function (data:any) {
    return Http.post('/admin/adminRole/insert', data)
}

export const updateRole = function(data:any) {
    return Http.post('/admin/adminRole/update', data)
}

export const deleteRole = function(id:number) {
    return Http.post('/admin/adminRole/delete', {'id':id})
}

export const selectRole = function(param:any) {
    return Http.post('/admin/adminRole/select', param)
}

export const saveRoleActions = function (data:any){
    return Http.post('/admin/adminRole/setActions', data)
}

export const getSelectedActionIds = function(role_id:number){
    return Http.post('/admin/adminRole/getSelectedActionIds', {id:role_id})
}


export const insertAction = function (data:any) {
    return Http.post('/admin/adminAction/insert', data)
}

export const updateAction = function(data:any) {
    return Http.post('/admin/adminAction/update', data)
}

export const deleteAction = function(id:number) {
    return Http.post('/admin/adminAction/delete', {'id':id})
}

export const selectAction = function(param:any) {
    return Http.get('/admin/adminAction/select', param)
}