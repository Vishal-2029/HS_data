import {createWebHistory,createRouter} from "vue-router";
import Login from "./components/Login.vue";
import Dashboard from "./components/Dashboard.vue";

const routes=[
    {
        name:'Login',
        path:'/',
        component:Login 
    },
    {
        name:'Dashboard',
        path:'/dashboard',
        component:Dashboard
    }
    
    
];

const router=createRouter({
    history:createWebHistory(),
    routes
});

export default router;