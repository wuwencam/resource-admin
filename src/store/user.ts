import { defineStore } from 'pinia'
import { menu, permission } from "../api/module/admin";

export const useUserStore = defineStore({
  id: 'user',
  state: () => {
    return {
      access_token: '',
      refresh_token: '',
      token_type:'',
      expired:0,
      userInfo: {},
      permissions: [],
      menus: [],
    }
  },
  actions: {
    async getAuthorization(){
      // const now = Date.now();
      // if( now <= this.expired){

      // }
      return this.token_type + ' ' + this.access_token
    },
    async SetUserInfo(data:any){
      console.log('set user info : ', data);
        this.access_token = data.token.access_token
        this.refresh_token = data.token.refresh_token
        this.token_type = data.token.token_type
        this.expired = Date.now() + ((data.token.expires_in - 300) * 1000)
        this.userInfo = {
          id: data.id,
          nickname: data.nickname,
          role_id: data.role_id,
          username: data.username,
        }
    },
    async loadMenus(){
      const {data,errcode, message} = await menu();
      if(errcode == 0) {
        this.menus = data;
      }else{
        console.error('load menu error : '+ message)
      }
    },
    async loadPermissions(){
      const {data,errcode, message } = await permission();
      if(errcode == 0) {
         this.permissions = data;
      }else{
        console.error('load Permissions error : '+ message)
      }
    }
  },
  persist: {
    storage: localStorage,
    paths: ['access_token',
      'refresh_token',
      'token_type',
      'expired', 'userInfo', 'permissions', 'menus','SetUserInfo','getAuthorization' ],
  }
})