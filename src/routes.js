import { createWebHistory, createRouter } from "vue-router";
import Login from "./components/Login.vue";
import Dashboard from "./components/Dashboard.vue";
import Userchart from "./components/Userchart.vue";

const routes = [
    {
        name: 'Login',
        path: '/',
        component: Login,
        meta: { requiresGuest: true }
    },
    {
        name: 'Dashboard',
        path: '/dashboard',
        component: Dashboard,
        meta: { 
            requiresAuth: true ,
            beforeEnter: (to, from, next) => {
                const token = localStorage.getItem('token');
                if (!token) {
                    return next({ name: 'Login' });
                }
                next();
                }
        }
    },
    
    {
        name: 'Userchart',
        path: '/Userchart/:user_id',
        component:Userchart ,
        meta: { requiresAuth: true },
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});


router.beforeEach((to, from, next) => {
    const token = localStorage.getItem('token');
    const isAuthenticated = token !== null && token !== '';

    // Always show Login page on root URL
    if (to.path === '/') {
        return next();
    }

    // If route requires guest and user is authenticated, redirect to dashboard
    if (to.meta.requiresGuest && isAuthenticated) {
        return next({ name: 'Dashboard' });
    }

    // If route requires auth and user is not authenticated, redirect to login
    if (to.meta.requiresAuth && !isAuthenticated) {
        return next({ name: 'Login' });
    }

    next();
});


export default router;
