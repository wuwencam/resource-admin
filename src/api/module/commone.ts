import Http from '../http';

export const tgroupInsert = (data:any) => {
  return Http.post('/admin/telegramGroup/insert', data)
}
export const tgroupUpdate = (data:any) => {
  return Http.post('/admin/telegramGroup/update', data)
}
export const tgroupSelect = (data:any) => {
  return Http.post('/admin/telegramGroup/select', data)
}
export const tgroupDelete = (data:any) => {
  return Http.post('/admin/telegramGroup/delete', data)
}

// //登录验证码
// export const verificationImg = function () {
//   return Http.get('/login/verificationImg')
// }

// //登录二维码
// export const loginQrcode = function () {
//   return Http.get('/login/loginQrcode')
// }