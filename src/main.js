import Vue from 'vue';
import App from './App.vue';
import VueRouter from 'vue-router';
import VueResource from 'vue-resource';
import frame from './components/Frame.vue';
import tableInfo from './components/TableInfo.vue';
import tableList from './components/TableList.vue';
import domainList from './components/DomainList.vue';
import domainInfo from './components/DomainInfo.vue';
import tableSpaceList from './components/TableSpaceList.vue';


Vue.use(VueRouter);
Vue.use(VueResource);

//routes config
const routes = [
    {path: '/', redirect: '/frame'},
    {path: '/frame', component:frame,
        children:[
            {path:'/tableList', component:tableList, name:'tableList'},
            {path:'/tableInfo', component:tableInfo, name:'tableInfo'},
            {path:'/domainList', component:domainList, name:'domainList'},
            {path:'/domainInfo', component:domainInfo, name:'domainInfo'},
            {path:'/tableSpaceList', component:tableSpaceList, name:'tableSpaceList'}
        ]
    }
];

//genartor VueRouter object
const router = new VueRouter({
    mode: 'history',
    routes
});

//bind and render
const app = new Vue({
    router,
    render: h => h(App)
}).$mount('#app');




