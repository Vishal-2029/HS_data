<template>
<div class="main-container wrapper">
    <Loader v-if="isLoading" />

    <!-- Accounts Section -->
    <div class="account-container">

        <h1>Accounts</h1>
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
            </div>

            <!-- Chart Section -->
            <div class="charts">

                <div class="line-chart" style="flex: 2">
                    <h3>Positions, Orders, and Deals Trend</h3>
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
import {
    mapGetters
} from 'vuex'

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

            // Line Chart Options 
            chartOptions: {
                chart: {
                    type: 'line',
                    height: 350,
                },

                stroke: {
                    curve: 'smooth',
                    width: 2,
                },
                markers: {
                    size: 4,
                },
                dataLabels: {
                    enabled: false,
                },
                xaxis: {
                    type: 'datetime',
                    labels: {
                        format: 'dd MMM',
                    },
                    tickAmount: 7,
                },
                yaxis: {
                    title: {
                        text: 'Count',
                    },
                },
                tooltip: {
                    x: {
                        format: 'dd MMM yyyy HH:mm',
                    },
                    y: {
                        formatter: function (val) {
                            return val;
                        },
                    },
                },
            },
            series: [{
                    name: 'Positions',
                    data: [],
                },
                {
                    name: 'Orders',
                    data: [],
                },
                {
                    name: 'Deals',
                    data: [],
                },
            ],

            Image: require("../assets/time-to-market.gif"),

            // Donut Chart Options
            donutChartOptions: {
                chart: {
                    height: 350,
                    type: 'radialBar',
                },
                plotOptions: {
                    radialBar: {
                        dataLabels: {
                            name: {
                                fontSize: '22px',
                            },
                            value: {
                                fontSize: '16px',
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
            isLoading: false,
        };
    },

    methods: {

        // Accounts section
        async fetchAccounts() {
            this.isLoading = true;
            try {
                const tokenString = localStorage.getItem('token');
                if (!tokenString) {
                    console.error('No token found. Please log in.');
                    return;
                }

                const response = await axios.get('https://dev.hstrader.com/api/v1/accounts', {
                    headers: {
                        Authorization: `Bearer ${tokenString}`,
                    },
                });

                this.accounts = response.data.data;
            } catch (error) {
                console.error('Error fetching accounts:', error);
            }
            this.isLoading = false;
        },

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

        logout() {
            localStorage.removeItem('token');
            this.$router.push('/');
        },

        img() {
            this.$router.push('/userchart/' + this.selectedAccountId);
        },

        // Orders,Positions and Deals section
        async fetchOrdersAndPositions(accountId) {
            try {
                const tokenString = localStorage.getItem('token');
                if (!tokenString) {
                    console.error('No token found. Please log in.');
                    return;
                } 

                this.isLoading = true;
                const [
                    responsePosition,
                    responseOrder,
                    responseDeals,
                    responseTrades,
                    responsePending,
                    responseSymbols,
                ] = await Promise.all([
                    axios.get(`https://dev.hstrader.com/api/v1/positions/accounts/${accountId}`, {
                        headers: {
                            Authorization: `Bearer ${tokenString}`,
                        },
                        params: {
                            page: 1,
                            limit: 500,
                            active: 'false',
                        },
                    }),
                    axios.get(`https://dev.hstrader.com/api/v1/orders/accounts/${accountId}`, {
                        headers: {
                            Authorization: `Bearer ${tokenString}`,
                        },
                        params: {
                            page: 1,
                            limit: 500,
                            active: 'false',
                        },
                    }),
                    axios.get(`https://dev.hstrader.com/api/v1/deals/accounts/${accountId}`, {
                        headers: {
                            Authorization: `Bearer ${tokenString}`,
                        },
                        params: {
                            page: 1,
                            limit: 500,
                        },
                    }),
                    axios.get(`https://dev.hstrader.com/api/v1/positions/accounts/${accountId}`, {
                        headers: {
                            Authorization: `Bearer ${tokenString}`,
                        },
                        params: {
                            page: 0,
                            limit: 0,
                            active: 'true',
                        },
                    }),
                    axios.get(`https://dev.hstrader.com/api/v1/orders/accounts/${accountId}`, {
                        headers: {
                            Authorization: `Bearer ${tokenString}`,
                        },
                        params: {
                            page: 1,
                            limit: 500,
                            active: 'true',
                        },
                    }),
                    axios.get(`https://dev.hstrader.com/api/v1/symbols/accounts/${accountId}`, {
                        headers: {
                            Authorization: `Bearer ${tokenString}`,
                        },
                    }),
                ]);
                this.isLoading = false;

                // Extract values from response
                const trades = responseTrades.data.data.length;
                const pending = responsePending.data.data.length;
                const positions = responsePosition.data.data;
                const orders = responseOrder.data.data;
                const deals = responseDeals.data.data;

                // console Values
                console.log('Positions:', positions);
                console.log('Orders:', orders);
                console.log('Deals:', deals);
                console.log('Trades:', trades);
                console.log('Pending:', pending);

                
                this.$store.dispatch('setSymbols', responseSymbols.data.data);

                // Total profit calculation
                let totalProfit = 0;
                positions.forEach((position) => {
                    totalProfit += Number(position.profit || 0);
                });

                this.detailObj.positions = positions;
                this.detailObj.orders = orders;
                this.detailObj.deals = deals;
                this.detailObj.profit = totalProfit;

                // Update the donut chart series 
                this.donutChartSeries = [trades, pending];

                this.updateChart();
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        },

        //line chart Update
        updateChart() {
            const groupByDay = (items) => {
                const grouped = {};
                items.forEach((item) => {
                    const ms = item.created_at / 1_000_000;
                    const dateStr = new Date(ms).toISOString().split('T')[0]; // only YYYY-MM-DD
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
                    data: positionSeries,
                },
                {
                    name: 'Orders',
                    data: orderSeries,
                },
                {
                    name: 'Deals',
                    data: dealSeries,
                },
            ];
        },

        formatCurrency(value) {
            if (!value) return '$0.00';
            return `$ ${Number(value).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
        },
    },
    mounted() {
        this.fetchAccounts();
    },
    computed: {
        ...mapGetters(['count']),
    },
};
</script>

<style scoped>
/* main-container Style */
.main-container {
height: 90vh;
    display: flex;
    background: #ffffff;
    padding: 30px;
    border-radius: 16px;
    box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1);
}

/* Account Section Style */
.account-container {
    width: 300px;
    overflow-y: auto;

    border-radius: 12px;
    border: 5px solid #ddd;
    background: #ffffff;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
    padding: 20px;

}

.account-item {
    padding: 12px;
    margin-bottom: 12px;
    background-color: #f7f7f7;
    border-radius: 15px;
    cursor: pointer;
    transition: background-color 0.3s ease, transform 0.3s ease;
}

.account-item.selected {
    outline: 3px solid #80deea;
    background-color: #e1f5fe;
    transform: scale(1.03);
}

.account-details {
    margin-top: 6px;
    padding: 12px;
    font-size: 14px;
    color: #7b8d8e;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-radius: 8px;
}

.account-info {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

/* object Section Style */
.object-detail {
    margin-left: 24px;
    padding: 25px;
    border-radius: 16px;
    border: 5px solid #ddd;
    background: #ffffff;
    box-shadow: 0 8px 15px rgba(0, 0, 0, 0.05);
    flex: 1;
}

.object-detail-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.object-detail-header h2 {
    margin: 0;
    color: #388e3c;
    font-size: 22px;
}

.object-detail-header button {
    padding: 6px 14px;
    background-color: transparent;
    color: #388e3c;
    border: 2px solid #388e3c;
    border-radius: 12px;
    cursor: pointer;
    text-decoration: none;
    transition: background-color 0.3s ease, transform 0.3s ease;
}

.object-detail-header button:hover {
    background-color: #ffffff;
    transform: scale(1.05);
}

/* List Group Styles */
.list-group {
    display: flex;
    gap: 18px;
    margin-bottom: 24px;
}

.total-orders-item,
.balance-item,
.profit-item {
    padding: 20px;
    background-color: #e8f5e9;
    border-radius: 15px;
    flex: 1;
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.05);
}

.total-orders-item h3,
.balance-item h3,
.profit-item h3 {
    margin-bottom: 12px;
    color: #388e3c;
}

/* img */

.img-1 {
    width: 30px;
    height: 30px;
    overflow: hidden;
    margin-left: 10px;
    display: flex;
    border-radius: 5px;
    flex-direction: row;
}

.img-1 img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

/* Chart Section Style */
.charts {
    display: flex;
    gap: 20px;
}

.line-chart,
.donut-chart {
    background: #ffffff;
    border-radius: 16px; 
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.05);
}

/* Fade Animation */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.4s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

/* Slide-in Animation */
.slide-fade-enter-active {
    transition: all 0.5s ease;
}

.slide-fade-enter-from {
    opacity: 0;
    transform: translateY(10px);
}

.slide-fade-leave-active {
    transition: all 0.3s ease;
}

.slide-fade-leave-to {
    opacity: 0;
    transform: translateY(10px);
}

/* Responsive Design */
@media (max-width: 1024px) {
    .main-container {
        flex-direction: column;
        padding: 10px;
    }

    .account-container {
        width: 100%;
        height: 70vh;
        margin-bottom: 20px;
        overflow-y: auto;
    }

    .object-detail {
        margin-left: 0;
        width: 100%;
    }

    .list-group {
        flex-direction: column;
    }

    .charts {
        flex-direction: column;
    }

    .line-chart,
    .donut-chart {
        width: 100%;
    }

    .object-detail-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 10px;
    }
}

@media (max-width: 600px) {
    .account-container {
        height: 70vh;
        width: 100%;
        overflow-y: auto;
    }

    .account-item {
        font-size: 14px;
    }

    .account-details {
        font-size: 12px;
    }

    .total-orders-item h3,
    .balance-item h3,
    .profit-item h3 {
        font-size: 16px;
    }

    .object-detail-header h2 {
        font-size: 18px;
    }
}
</style>
