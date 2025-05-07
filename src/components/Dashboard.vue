<template>
<div class="main-container wrapper">
    <Loader v-if="isLoading" />

    <!-- Accounts Section -->
    <div class="account-container">
        <div class="account-header">
            <h1>Accounts</h1>
            <div>
                <p>Total user Profit: {{ accounts.length }}</p>
            </div>
        </div>

        <div v-if="accounts.length > 0">
            <div v-for="account in accounts" :key="account.id" class="account-item" :class="{ selected: selectedAccountId === account.id }" @click="showDetails(account)">

                <div>{{ account.user_id }}</div>

                <transition name="fade">
                    <div v-if="selectedAccountId === account.id" class="account-details">
                        <div>
                            <div>Balance: {{ formatCurrency(detailObj.balance) }}</div>
                            <div>Profit: {{ formatCurrency(detailObj.profit) }}</div>
                        </div>
                        <div>
                            <div class="img-1" @click.stop="img"><img :src="Image"></div>
                        </div>
                    </div>
                </transition>
            </div>
        </div>
        <p v-else>No accounts found.</p>
    </div>

    <!-- Order Details Section -->
    <transition name="slide-fade">
        <div class="object-detail">
            <div class="object-detail-header">
                <h2>Order Details</h2>
                <button @click="logout">LogOut</button>
            </div>
            <br />

            <!--! for Orders Items  -->
            <div class="list-group">
                <div class="total-orders-item">
                    <h3>Total Orders Positions</h3>
                    <p>{{ detailObj.positions?.length || 0 }}</p>
                </div>

                <div class="total-orders-item">
                    <h3>Total Orders</h3>
                    <p>{{ detailObj.orders?.length || 0 }}</p>
                </div>

                <div class="balance-item">
                    <h3>Balance</h3>
                    <p>{{ formatCurrency(detailObj.balance) }}</p>
                </div>

                <div class="profit-item">
                    <h3>Total Profit</h3>
                    <p>{{ formatCurrency(detailObj.profit) }}</p>
                </div>

                <div class="profit-item">
                    <h3>A User Profit</h3>
                    <div>
                        <p>
                            {{ formatCurrency(totalAllUserProfit) }}
                        </p>
                    </div>
                </div>
            </div>

            <!--! Chart Section -->
            <div class="charts">

                <div class="line-chart" style="flex: 2">
                    <h3>Positions, Orders, and Deals </h3>
                    <apexchart type="line" height="350" :options="chartOptions" :series="series" />
                </div>

                <div class="donut-chart" style="flex: 1; background: #f9f9f9; border-radius: 10px; padding: 10px;">
                    <h3>Trade & Pending Order</h3>
                    <apexchart type="radialBar" height="350" :options="donutChartOptions" :series="donutChartSeries" />
                </div>
            </div>
        </div>
    </transition>
</div>
</template>

<script>
import axios from 'axios';
import VueApexCharts from 'vue3-apexcharts';
import Loader from './Loader.vue';
import './Dashboard.css'; // Import your CSS file 


// user for environment variables
const BASE_URL = process.env.VUE_APP_API_BASE_URL;

export default {
    name: 'DASHBOARD',
    components: {
        apexchart: VueApexCharts,
        Loader, 
    },

    data() {
        return {
            accounts: [],
            detailObj: [],
            donutChartSeries: [],
            selectedAccountId: null,
            totalAllUserProfit: 0,
            isLoading: false,

            // chart 1
            chartOptions: {
                chart: {
                    type: 'line',
                    height: 350
                },
                stroke: {
                    curve: 'smooth',
                    width: 2
                },
                markers: {
                    size: 4
                },
                dataLabels: {
                    enabled: false
                },
                xaxis: {
                    type: 'datetime',
                    labels: {
                        format: 'dd MMM'
                    },
                    tickAmount: 7,
                },
                yaxis: {
                    title: {
                        text: 'Count'
                    }
                },
                tooltip: {
                    x: {
                        format: 'dd MMM yyyy HH:mm'
                    },
                    y: {
                        formatter: val => val
                    },
                },
            },
            series: [{
                    name: 'Positions',
                    data: []
                },
                {
                    name: 'Orders',
                    data: []
                },
                {
                    name: 'Deals',
                    data: []
                },
            ],
            Image: require('../assets/time-to-market.gif'),


            //chart 2
            donutChartOptions: {
                chart: {
                    height: 350,
                    type: 'radialBar'
                },
                plotOptions: {
                    radialBar: {
                        dataLabels: {
                            name: {
                                fontSize: '22px'
                            },
                            value: {
                                fontSize: '16px'
                            },
                            total: {
                                show: true,
                                label: 'Total',
                                formatter: function (val) {
                                    return val;
                                },
                            },
                        },
                    },
                },
                labels: ['Trades', 'Pending'],
            },
        };
    },

    methods: {

        // Show Details
        async showDetails(account) {
            this.selectedAccountId = account.id;
            this.detailObj = {
                account,
                balance: account.balance,
                profit: 0,
                orders: [],
                positions: [],
                deals: [],
            };
            await this.fetchOrdersAndPositions(account.id);
        },


        // Fetch Accounts
        async fetchAccounts() {
            this.isLoading = true;
            try {
                const tokenString = localStorage.getItem('token');
                if (!tokenString) return;

                const response = await axios.get(`${BASE_URL}/api/v1/accounts`, {
                    headers: {
                        Authorization: `Bearer ${tokenString}`,
                    },
                });

                this.accounts = response.data.data;
                await this.calculateTotalUserProfit();
            } catch (error) {
                console.error('Error fetching accounts:', error);
            }
            this.isLoading = false;

        },

        async calculateTotalUserProfit() {
            const tokenString = localStorage.getItem('token');
                if (!tokenString) return;

            let totalProfit = 0;

            // Fetch Positions for each account
            for (const account of this.accounts) {
                try {
                    const response = await axios.get(`${BASE_URL}/api/v1/Positions/accounts/${account.id}`, {
                        headers: {
                            Authorization: `Bearer ${tokenString}`,
                        },
                        params: {
                            page: 1,
                            limit: 500,
                            active: 'false'
                        },
                    });

                    const Positions = response.data.data;
                    Positions.forEach(position => {
                        totalProfit += Number(position.profit || 0);
                    });
                } catch (err) {
                    console.error(`Failed to fetch Positions for account ${account.id}:`, err);
                }
            }

            this.totalAllUserProfit = totalProfit;
        },


        // User Chart Page Img
        img() {
            this.$router.push('/userchart/' + this.selectedAccountId);
        },

        async fetchOrdersAndPositions(accountId) {
            try {
                const tokenString = localStorage.getItem('token');
                if (!tokenString) return;

                this.isLoading = true;

                //Fetch the Data
                const [
                    responsePosition,
                    responseOrder,
                    responseDeals,
                    responseTrades,
                    responsePending,
                    responseSymbols,
                ] = await Promise.all([
                    axios.get(`${BASE_URL}/api/v1/positions/accounts/${accountId}`, {
                        headers: {
                            Authorization: `Bearer ${tokenString}`
                        },
                        params: {
                            page: 1,
                            limit: 500,
                            active: 'false'
                        },
                    }),
                    axios.get(`${BASE_URL}/api/v1/orders/accounts/${accountId}`, {
                        headers: {
                            Authorization: `Bearer ${tokenString}`
                        },
                        params: {
                            page: 1,
                            limit: 500,
                            active: 'false'
                        },
                    }),
                    axios.get(`${BASE_URL}/api/v1/deals/accounts/${accountId}`, {
                        headers: {
                            Authorization: `Bearer ${tokenString}`
                        },
                        params: {
                            page: 1,
                            limit: 500
                        },
                    }),
                    axios.get(`${BASE_URL}/api/v1/positions/accounts/${accountId}`, {
                        headers: {
                            Authorization: `Bearer ${tokenString}`
                        },
                        params: {
                            page: 0,
                            limit: 0,
                            active: 'true'
                        },
                    }),
                    axios.get(`${BASE_URL}/api/v1/orders/accounts/${accountId}`, {
                        headers: {
                            Authorization: `Bearer ${tokenString}`
                        },
                        params: {
                            page: 1,
                            limit: 500,
                            active: 'true'
                        },
                    }),
                    axios.get(`${BASE_URL}/api/v1/symbols/accounts/${accountId}`, {
                        headers: {
                            Authorization: `Bearer ${tokenString}`
                        },
                    }),
                ]);

                // Data Formatting
                const trades = responseTrades.data.data.length;
                const pending = responsePending.data.data.length;
                const positions = responsePosition.data.data;
                const orders = responseOrder.data.data;
                const deals = responseDeals.data.data;

                // set the data to the store*
                this.$store.dispatch('setSymbols', responseSymbols.data.data);

                // Calculate user total profit
                let totalProfit = 0;
                positions.forEach((position) => {
                    totalProfit += Number(position.profit || 0);
                });

                // Set the data to the detailObj
                this.detailObj.positions = positions;
                this.detailObj.orders = orders;
                this.detailObj.deals = deals;
                this.detailObj.profit = totalProfit;

                //chart data
                this.donutChartSeries = [trades, pending];

                this.updateChart();

            } catch (error) {
                console.error('Error fetching data:', error);
            }
            this.isLoading = false;

        },

        // Update the chart with the new data
        updateChart() {
            const groupByDay = (items) => {
                const grouped = {};
                items.forEach((item) => {
                    const ms = item.created_at / 1_000_000;
                    const dateStr = new Date(ms).toISOString().split('T')[0];
                    if (!grouped[dateStr]) {
                        grouped[dateStr] = 0;
                    }
                    grouped[dateStr] += 1;
                });
                return Object.keys(grouped).map((date) => ({
                    x: new Date(date).getTime(),
                    y: grouped[date],
                }));
            };

            const positionSeries = groupByDay(this.detailObj.positions);
            const orderSeries = groupByDay(this.detailObj.orders);
            const dealSeries = groupByDay(this.detailObj.deals);

            this.series = [{
                    name: 'Positions',
                    data: positionSeries
                },
                {
                    name: 'Orders',
                    data: orderSeries
                },
                {
                    name: 'Deals',
                    data: dealSeries
                },
            ];
        },

        // Format currency
        formatCurrency(value) {
            if (!value) return '$0.00';
            return `$ ${Number(value).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
        },

         // Logout Button
    logout() {
        localStorage.removeItem('token');
        this.$router.push('/');
    },
    },

    mounted() {
        this.fetchAccounts();
    },

};
</script>
