import Http from '../http';


export const insertPage = function (data:any) {
  return Http.post('/admin/page/insert',data)
}

export const updatePage = function (data:any) {
  return Http.post('/admin/page/update',data)
}

export const selectPage = function (param:any) {
  return Http.post('/admin/page/select',param)
}

export const deletePage = function (data:any) {
  return Http.post('/admin/page/delete',data)
}
